import { gunzipSync, inflateRawSync } from "node:zlib";

export const prohibitedDataArchivePolicy = Object.freeze({
  identifier: "FAIL_CLOSED_TAR_ZIP_OCI_V1",
  maxDepth: 4,
  maxEntries: 50_000,
  maxEntryBytes: 256 * 1024 * 1024,
  maxExpandedBytes: 2 * 1024 * 1024 * 1024,
  maxCompressionRatio: 200,
});

const reservedEmailDomains = new Set([
  "example.com",
  "example.net",
  "example.org",
]);
const utf8Fatal = new TextDecoder("utf-8", { fatal: true });

export function createProhibitedDataInspection() {
  return {
    archiveEntryCount: 0,
    expandedByteCount: 0,
    findingCount: 0,
  };
}

export function inspectProhibitedData(bytes, logicalPath, inspection) {
  if (!Buffer.isBuffer(bytes) || typeof logicalPath !== "string") {
    fail("invalid inspection input");
  }
  if (
    inspection === null ||
    typeof inspection !== "object" ||
    !Number.isSafeInteger(inspection.archiveEntryCount) ||
    !Number.isSafeInteger(inspection.expandedByteCount) ||
    !Number.isSafeInteger(inspection.findingCount)
  ) {
    fail("invalid inspection state");
  }
  inspect(bytes, logicalPath, inspection, 0, false);
  return inspection.findingCount;
}

function inspect(bytes, logicalPath, inspection, depth, expanded) {
  const expectedKind = expectedArchiveKind(logicalPath);
  const detectedKind = detectArchiveKind(bytes);

  if (expectedKind && detectedKind !== expectedKind) {
    fail(`${expectedKind} input is malformed or unsupported`);
  }
  if (detectedKind === "unsupported-compression") {
    fail("archive uses an unsupported compression format");
  }
  if (!detectedKind) {
    inspection.findingCount += countProhibitedData(bytes, logicalPath);
    return;
  }

  const nextDepth = depth + 1;
  if (nextDepth > prohibitedDataArchivePolicy.maxDepth) {
    fail("archive nesting depth exceeds the policy limit");
  }
  if (expanded && bytes.length > prohibitedDataArchivePolicy.maxEntryBytes) {
    fail("expanded archive entry exceeds the per-entry limit");
  }

  if (detectedKind === "gzip") {
    const output = decompressGzip(bytes, inspection);
    const nestedPath = gzipNestedPath(logicalPath);
    inspect(output, nestedPath, inspection, nextDepth, true);
    return;
  }
  if (detectedKind === "zip") {
    inspectZip(bytes, logicalPath, inspection, nextDepth);
    return;
  }
  inspectTar(bytes, logicalPath, inspection, nextDepth);
}

function fail(message) {
  throw new Error(`Prohibited data archive inspection failed: ${message}`);
}

function digits(value) {
  return value.replace(/\D/gu, "");
}

function hasValidCheckDigits(value, baseLength) {
  const number = digits(value);
  if (number.length !== baseLength + 2 || /^(\d)\1+$/u.test(number)) {
    return false;
  }
  const calculate = (length) => {
    let factor = length - 7;
    let total = 0;
    for (let index = 0; index < length; index += 1) {
      total += Number(number[index]) * factor;
      factor -= 1;
      if (factor === 1) factor = 9;
    }
    const remainder = total % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  if (baseLength === 9) {
    const cpfDigit = (length) => {
      let total = 0;
      for (let index = 0; index < length; index += 1) {
        total += Number(number[index]) * (length + 1 - index);
      }
      const remainder = (total * 10) % 11;
      return remainder === 10 ? 0 : remainder;
    };
    return (
      cpfDigit(9) === Number(number[9]) && cpfDigit(10) === Number(number[10])
    );
  }
  return (
    calculate(12) === Number(number[12]) && calculate(13) === Number(number[13])
  );
}

function countMatches(expression, value, predicate = () => true) {
  let count = 0;
  for (const match of value.matchAll(expression)) {
    if (predicate(match[0])) count += 1;
  }
  return count;
}

function isThirdPartyDependencyPath(logicalPath) {
  const normalized = `/${logicalPath.replaceAll("\\", "/").toLowerCase()}/`;
  return normalized.includes("/node_modules/");
}

function countProhibitedData(bytes, logicalPath) {
  // Dependencias instaladas carregam metadados publicos de mantenedores
  // (inclusive e-mails em package.json e licencas). Elas nao sao massa do
  // Portal DP e continuam integralmente cobertas por Gitleaks, Trivy e SCA.
  // O detector de dados empresariais permanece ativo em todo o restante da
  // imagem, inclusive /app/apps, /app/packages e arquivos inesperados.
  if (isThirdPartyDependencyPath(logicalPath)) return 0;
  const text = bytes.toString("utf8");
  let count = 0;

  count += countMatches(
    /(?<!\d)(?:\d{3}[.\s-]?\d{3}[.\s-]?\d{3}[-\s]?\d{2})(?!\d)/gu,
    text,
    (value) => hasValidCheckDigits(value, 9),
  );
  count += countMatches(
    /(?<!\d)(?:\d{2}[.\s-]?\d{3}[.\s-]?\d{3}[\s/]?\d{4}[-\s]?\d{2})(?!\d)/gu,
    text,
    (value) => hasValidCheckDigits(value, 12),
  );
  count += countMatches(
    /\b[A-Z0-9._%+-]+@(?:[A-Z0-9-]+\.)+[A-Z]{2,63}\b/giu,
    text,
    (value) => {
      const domain = value.split("@").at(-1)?.toLowerCase() ?? "";
      return !(
        reservedEmailDomains.has(domain) ||
        domain.endsWith(".example") ||
        domain.endsWith(".invalid") ||
        domain.endsWith(".test")
      );
    },
  );
  count += countMatches(/\bCID\s*[:=-]\s*[A-Z]\d{2}(?:\.\d)?\b/giu, text);
  count += countMatches(
    /\bCRM(?:[- /]?[A-Z]{2})?\s*[:=-]\s*\d{4,8}\b/giu,
    text,
  );
  return count;
}

function expectedArchiveKind(logicalPath) {
  const path = logicalPath.toLowerCase();
  if (
    path.endsWith(".tar.gz") ||
    path.endsWith(".tgz") ||
    path.endsWith(".gz")
  ) {
    return "gzip";
  }
  if (path.endsWith(".zip")) return "zip";
  if (path.endsWith(".tar") || path.endsWith(".oci")) return "tar";
  return null;
}

function detectArchiveKind(bytes) {
  if (bytes.length >= 4) {
    const signature = bytes.readUInt32LE(0);
    if (
      signature === 0x04034b50 ||
      signature === 0x06054b50 ||
      signature === 0x08074b50
    ) {
      return "zip";
    }
  }
  if (bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b) {
    return "gzip";
  }
  if (
    (bytes.length >= 4 && bytes.readUInt32LE(0) === 0xfd2fb528) ||
    (bytes.length >= 6 &&
      bytes.subarray(0, 6).equals(Buffer.from("fd377a585a00", "hex"))) ||
    (bytes.length >= 3 &&
      bytes.subarray(0, 3).equals(Buffer.from("425a68", "hex")))
  ) {
    return "unsupported-compression";
  }
  if (looksLikeTar(bytes)) return "tar";
  return null;
}

function gzipNestedPath(logicalPath) {
  const lower = logicalPath.toLowerCase();
  if (lower.endsWith(".tar.gz")) return logicalPath.slice(0, -3);
  if (lower.endsWith(".tgz")) return `${logicalPath.slice(0, -4)}.tar`;
  if (lower.endsWith(".gz")) return logicalPath.slice(0, -3) || "gzip-content";
  return `${logicalPath}!/gzip-content`;
}

function consumeArchiveEntry(inspection) {
  inspection.archiveEntryCount += 1;
  if (inspection.archiveEntryCount > prohibitedDataArchivePolicy.maxEntries) {
    fail("archive entry count exceeds the policy limit");
  }
}

function consumeExpandedBytes(inspection, expandedBytes, compressedBytes) {
  if (
    !Number.isSafeInteger(expandedBytes) ||
    expandedBytes < 0 ||
    expandedBytes > prohibitedDataArchivePolicy.maxEntryBytes
  ) {
    fail("expanded archive entry exceeds the per-entry limit");
  }
  if (
    expandedBytes > 0 &&
    (compressedBytes <= 0 ||
      expandedBytes / compressedBytes >
        prohibitedDataArchivePolicy.maxCompressionRatio)
  ) {
    fail("archive compression ratio exceeds the policy limit");
  }
  inspection.expandedByteCount += expandedBytes;
  if (
    !Number.isSafeInteger(inspection.expandedByteCount) ||
    inspection.expandedByteCount > prohibitedDataArchivePolicy.maxExpandedBytes
  ) {
    fail("expanded archive bytes exceed the policy limit");
  }
}

function decompressGzip(bytes, inspection) {
  let output;
  try {
    output = gunzipSync(bytes, {
      maxOutputLength: prohibitedDataArchivePolicy.maxEntryBytes + 1,
    });
  } catch {
    fail("gzip member is malformed or exceeds the per-entry limit");
  }
  consumeExpandedBytes(inspection, output.length, bytes.length);
  return output;
}

function looksLikeTar(bytes) {
  return (
    bytes.length >= 512 && !isZeroBlock(bytes, 0) && validTarChecksum(bytes, 0)
  );
}

function validTarChecksum(bytes, offset) {
  if (offset + 512 > bytes.length) return false;
  const expected = parseTarOctal(bytes.subarray(offset + 148, offset + 156));
  if (expected === null) return false;
  let unsigned = 0;
  for (let index = 0; index < 512; index += 1) {
    unsigned += index >= 148 && index < 156 ? 0x20 : bytes[offset + index];
  }
  return unsigned === expected;
}

function parseTarOctal(bytes) {
  const value = bytes.toString("ascii").replaceAll("\0", "").trim();
  if (!/^[0-7]+$/u.test(value)) return null;
  const parsed = Number.parseInt(value, 8);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function parseTarNumber(bytes) {
  if ((bytes[0] & 0x80) === 0) return parseTarOctal(bytes);
  if ((bytes[0] & 0x40) !== 0) return null;
  let value = BigInt(bytes[0] & 0x7f);
  for (let index = 1; index < bytes.length; index += 1) {
    value = (value << 8n) | BigInt(bytes[index]);
  }
  return value <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(value) : null;
}

function tarText(bytes) {
  const end = bytes.indexOf(0);
  return bytes.subarray(0, end === -1 ? bytes.length : end).toString("utf8");
}

function isZeroBlock(bytes, offset) {
  if (offset + 512 > bytes.length) return false;
  for (let index = offset; index < offset + 512; index += 1) {
    if (bytes[index] !== 0) return false;
  }
  return true;
}

function safeArchivePath(value) {
  if (typeof value !== "string" || value.length === 0 || value.includes("\0")) {
    fail("archive entry has an invalid path");
  }
  const normalized = value.replace(/^\.\//u, "");
  if (
    normalized.length === 0 ||
    normalized.startsWith("/") ||
    /^[A-Z]:[\\/]/iu.test(normalized) ||
    normalized.split(/[\\/]/u).includes("..")
  ) {
    fail("archive entry path escapes its container");
  }
  return normalized;
}

function parsePax(bytes) {
  const values = new Map();
  let offset = 0;
  while (offset < bytes.length) {
    const space = bytes.indexOf(0x20, offset);
    if (space === -1) fail("PAX header is malformed");
    const lengthText = bytes.subarray(offset, space).toString("ascii");
    if (!/^[1-9][0-9]*$/u.test(lengthText))
      fail("PAX record length is invalid");
    const length = Number(lengthText);
    if (
      !Number.isSafeInteger(length) ||
      length < 5 ||
      offset + length > bytes.length
    ) {
      fail("PAX record exceeds its header");
    }
    const record = bytes.subarray(space + 1, offset + length);
    if (record.at(-1) !== 0x0a) fail("PAX record has no terminator");
    const separator = record.indexOf(0x3d);
    if (separator < 1) fail("PAX record has no key");
    const key = utf8Fatal.decode(record.subarray(0, separator));
    const value = utf8Fatal.decode(record.subarray(separator + 1, -1));
    values.set(key, value);
    offset += length;
  }
  return values;
}

function inspectTar(bytes, logicalPath, inspection, depth) {
  let offset = 0;
  let zeroBlocks = 0;
  let nextPax = new Map();
  let globalPax = new Map();
  let longName = null;

  while (offset + 512 <= bytes.length) {
    if (isZeroBlock(bytes, offset)) {
      zeroBlocks += 1;
      offset += 512;
      if (zeroBlocks === 2) break;
      continue;
    }
    if (zeroBlocks !== 0) fail("tar contains data after a partial terminator");
    if (!validTarChecksum(bytes, offset))
      fail("tar header checksum is invalid");

    const header = bytes.subarray(offset, offset + 512);
    const name = tarText(header.subarray(0, 100));
    const prefix = tarText(header.subarray(345, 500));
    const headerSize = parseTarNumber(header.subarray(124, 136));
    if (headerSize === null || headerSize < 0)
      fail("tar entry size is invalid");
    const type = String.fromCharCode(header[156] ?? 0);
    const paxSize = nextPax.get("size");
    const size = paxSize === undefined ? headerSize : Number(paxSize);
    if (!Number.isSafeInteger(size) || size < 0) fail("PAX size is invalid");
    if (size > prohibitedDataArchivePolicy.maxEntryBytes) {
      fail("tar entry exceeds the per-entry limit");
    }
    const contentOffset = offset + 512;
    const contentEnd = contentOffset + size;
    const paddedEnd = contentOffset + Math.ceil(size / 512) * 512;
    if (contentEnd > bytes.length || paddedEnd > bytes.length) {
      fail("tar entry is truncated");
    }
    const content = bytes.subarray(contentOffset, contentEnd);
    consumeArchiveEntry(inspection);

    if (type === "x" || type === "g") {
      const parsed = parsePax(content);
      if ([...parsed.keys()].some((key) => key.startsWith("GNU.sparse"))) {
        fail("sparse tar entries are unsupported");
      }
      if (type === "g") globalPax = new Map([...globalPax, ...parsed]);
      else nextPax = parsed;
    } else if (type === "L") {
      longName = tarText(content).replace(/\n$/u, "");
    } else {
      const effectivePax = new Map([...globalPax, ...nextPax]);
      const entryName = safeArchivePath(
        effectivePax.get("path") ??
          longName ??
          (prefix ? `${prefix}/${name}` : name),
      );
      if (type === "\0" || type === "0" || type === "7") {
        inspection.expandedByteCount += size;
        if (
          inspection.expandedByteCount >
          prohibitedDataArchivePolicy.maxExpandedBytes
        ) {
          fail("expanded archive bytes exceed the policy limit");
        }
        inspect(
          content,
          `${logicalPath}!/${entryName}`,
          inspection,
          depth,
          true,
        );
      } else if (type === "S") {
        fail("sparse tar entries are unsupported");
      }
      nextPax = new Map();
      longName = null;
    }
    offset = paddedEnd;
  }

  if (zeroBlocks < 2) fail("tar archive has no complete terminator");
  for (; offset < bytes.length; offset += 1) {
    if (bytes[offset] !== 0) fail("tar archive has trailing non-zero bytes");
  }
}

function findZipEocd(bytes) {
  const minimum = Math.max(0, bytes.length - 65_557);
  for (let offset = bytes.length - 22; offset >= minimum; offset -= 1) {
    if (bytes.readUInt32LE(offset) === 0x06054b50) return offset;
  }
  return -1;
}

function decodeZipName(bytes, utf8) {
  const value = utf8
    ? utf8Fatal.decode(bytes)
    : new TextDecoder("latin1").decode(bytes);
  return safeArchivePath(value);
}

let crcTable;
function crc32(bytes) {
  if (!crcTable) {
    crcTable = new Uint32Array(256);
    for (let value = 0; value < 256; value += 1) {
      let crc = value;
      for (let bit = 0; bit < 8; bit += 1) {
        crc = (crc & 1) === 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
      }
      crcTable[value] = crc >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function inspectZip(bytes, logicalPath, inspection, depth) {
  const eocdOffset = findZipEocd(bytes);
  if (eocdOffset < 0) fail("zip end-of-directory record is missing");
  const disk = bytes.readUInt16LE(eocdOffset + 4);
  const centralDisk = bytes.readUInt16LE(eocdOffset + 6);
  const entriesOnDisk = bytes.readUInt16LE(eocdOffset + 8);
  const entryCount = bytes.readUInt16LE(eocdOffset + 10);
  const centralSize = bytes.readUInt32LE(eocdOffset + 12);
  const centralOffset = bytes.readUInt32LE(eocdOffset + 16);
  const commentLength = bytes.readUInt16LE(eocdOffset + 20);
  if (
    disk !== 0 ||
    centralDisk !== 0 ||
    entriesOnDisk !== entryCount ||
    entryCount === 0xffff ||
    centralSize === 0xffffffff ||
    centralOffset === 0xffffffff
  ) {
    fail("multi-disk or ZIP64 archives are unsupported");
  }
  if (
    eocdOffset + 22 + commentLength !== bytes.length ||
    centralOffset + centralSize !== eocdOffset
  ) {
    fail("zip central directory bounds are invalid");
  }

  let cursor = centralOffset;
  for (let index = 0; index < entryCount; index += 1) {
    if (cursor + 46 > eocdOffset || bytes.readUInt32LE(cursor) !== 0x02014b50) {
      fail("zip central directory entry is malformed");
    }
    const flags = bytes.readUInt16LE(cursor + 8);
    const method = bytes.readUInt16LE(cursor + 10);
    const expectedCrc = bytes.readUInt32LE(cursor + 16);
    const compressedSize = bytes.readUInt32LE(cursor + 20);
    const expandedSize = bytes.readUInt32LE(cursor + 24);
    const nameLength = bytes.readUInt16LE(cursor + 28);
    const extraLength = bytes.readUInt16LE(cursor + 30);
    const entryCommentLength = bytes.readUInt16LE(cursor + 32);
    const startDisk = bytes.readUInt16LE(cursor + 34);
    const localOffset = bytes.readUInt32LE(cursor + 42);
    const centralEnd =
      cursor + 46 + nameLength + extraLength + entryCommentLength;
    if (centralEnd > eocdOffset || startDisk !== 0) {
      fail("zip central directory entry exceeds its bounds");
    }
    if ((flags & 0x1) !== 0) fail("encrypted zip entries are unsupported");
    if (method !== 0 && method !== 8)
      fail("zip compression method is unsupported");
    if (
      expandedSize > prohibitedDataArchivePolicy.maxEntryBytes ||
      (expandedSize > 0 &&
        (compressedSize === 0 ||
          expandedSize / compressedSize >
            prohibitedDataArchivePolicy.maxCompressionRatio))
    ) {
      fail("zip entry exceeds expansion limits");
    }
    const nameBytes = bytes.subarray(cursor + 46, cursor + 46 + nameLength);
    const entryName = decodeZipName(nameBytes, (flags & 0x800) !== 0);
    consumeArchiveEntry(inspection);

    if (
      localOffset + 30 > centralOffset ||
      bytes.readUInt32LE(localOffset) !== 0x04034b50
    ) {
      fail("zip local header is missing");
    }
    const localFlags = bytes.readUInt16LE(localOffset + 6);
    const localMethod = bytes.readUInt16LE(localOffset + 8);
    const localNameLength = bytes.readUInt16LE(localOffset + 26);
    const localExtraLength = bytes.readUInt16LE(localOffset + 28);
    const localName = bytes.subarray(
      localOffset + 30,
      localOffset + 30 + localNameLength,
    );
    const dataOffset = localOffset + 30 + localNameLength + localExtraLength;
    const dataEnd = dataOffset + compressedSize;
    if (
      localFlags !== flags ||
      localMethod !== method ||
      !localName.equals(nameBytes) ||
      dataEnd > centralOffset
    ) {
      fail("zip local header does not match the central directory");
    }
    const compressed = bytes.subarray(dataOffset, dataEnd);
    let output;
    try {
      output =
        method === 0
          ? Buffer.from(compressed)
          : inflateRawSync(compressed, {
              maxOutputLength: prohibitedDataArchivePolicy.maxEntryBytes + 1,
            });
    } catch {
      fail("zip entry is malformed or exceeds the per-entry limit");
    }
    if (output.length !== expandedSize || crc32(output) !== expectedCrc) {
      fail("zip entry integrity check failed");
    }
    consumeExpandedBytes(
      inspection,
      output.length,
      Math.max(compressedSize, output.length === 0 ? 1 : 0),
    );
    if (!entryName.endsWith("/")) {
      inspect(output, `${logicalPath}!/${entryName}`, inspection, depth, true);
    } else if (output.length !== 0) {
      fail("zip directory entry contains data");
    }
    cursor = centralEnd;
  }
  if (cursor !== eocdOffset) fail("zip central directory has unparsed bytes");
}
