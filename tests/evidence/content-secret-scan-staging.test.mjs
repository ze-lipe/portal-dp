import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { gzipSync } from "node:zlib";
import test from "node:test";

const execute = promisify(execFile);
const repositoryRoot = resolve(import.meta.dirname, "../..");
const script = resolve(repositoryRoot, "scripts/stage-content-secret-scan.mjs");

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 1) === 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function zipEntry(name, content, { declaredSize = content.length } = {}) {
  const nameBytes = Buffer.from(name, "utf8");
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4);
  local.writeUInt16LE(0x800, 6);
  local.writeUInt16LE(0, 8);
  local.writeUInt32LE(crc32(content), 14);
  local.writeUInt32LE(content.length, 18);
  local.writeUInt32LE(declaredSize, 22);
  local.writeUInt16LE(nameBytes.length, 26);

  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(20, 4);
  central.writeUInt16LE(20, 6);
  central.writeUInt16LE(0x800, 8);
  central.writeUInt16LE(0, 10);
  central.writeUInt32LE(crc32(content), 16);
  central.writeUInt32LE(content.length, 20);
  central.writeUInt32LE(declaredSize, 24);
  central.writeUInt16LE(nameBytes.length, 28);

  const localRecord = Buffer.concat([local, nameBytes, content]);
  const centralRecord = Buffer.concat([central, nameBytes]);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(1, 8);
  eocd.writeUInt16LE(1, 10);
  eocd.writeUInt32LE(centralRecord.length, 12);
  eocd.writeUInt32LE(localRecord.length, 16);
  return Buffer.concat([localRecord, centralRecord, eocd]);
}

function tarField(header, offset, length, value) {
  const encoded = value.toString(8).padStart(length - 1, "0");
  header.write(encoded, offset, length - 1, "ascii");
  header[offset + length - 1] = 0;
}

function tarArchive(entries) {
  const parts = [];
  for (const [name, content] of entries) {
    const header = Buffer.alloc(512);
    header.write(name, 0, 100, "utf8");
    tarField(header, 100, 8, 0o600);
    tarField(header, 108, 8, 0);
    tarField(header, 116, 8, 0);
    tarField(header, 124, 12, content.length);
    tarField(header, 136, 12, 0);
    header.fill(0x20, 148, 156);
    header[156] = "0".charCodeAt(0);
    header.write("ustar\0", 257, 6, "ascii");
    header.write("00", 263, 2, "ascii");
    let checksum = 0;
    for (const byte of header) checksum += byte;
    header.write(checksum.toString(8).padStart(6, "0"), 148, 6, "ascii");
    header[154] = 0;
    header[155] = 0x20;
    const padding = Buffer.alloc((512 - (content.length % 512)) % 512);
    parts.push(header, content, padding);
  }
  parts.push(Buffer.alloc(1024));
  return Buffer.concat(parts);
}

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "portal-dp-secret-stage-root-"));
  const temporary = await mkdtemp(
    join(tmpdir(), "portal-dp-secret-stage-output-"),
  );
  for (const directory of ["build", "evidence", "fixtures"]) {
    await mkdir(join(root, directory), { recursive: true });
  }
  return {
    root,
    temporary,
    staging: join(temporary, "staged"),
    proof: join(temporary, "proof.txt"),
  };
}

function cycloneDxInventory(component) {
  return {
    $schema: "http://cyclonedx.org/schema/bom-1.7.schema.json",
    bomFormat: "CycloneDX",
    specVersion: "1.7",
    serialNumber: "urn:uuid:12345678-1234-4123-8123-123456789abc",
    version: 1,
    metadata: {
      component: { type: "application", name: "portal-dp", version: "0.0.0" },
    },
    components: [component],
    dependencies: [],
  };
}

async function stage(paths) {
  return execute(
    process.execPath,
    [
      script,
      "--root",
      paths.root,
      "--staging",
      paths.staging,
      "--proof",
      paths.proof,
      "--scope",
      "BUILD_PACKAGE=build",
      "--scope",
      "GENERATED_EVIDENCE=evidence",
      "--scope",
      "TEST_FIXTURES=fixtures",
    ],
    { cwd: repositoryRoot },
  );
}

test("prepara os três escopos com inventário agregado e sem caminhos no comprovante", async () => {
  const paths = await fixture();
  try {
    await writeFile(join(paths.root, "build/app.js"), "export default 1;\n");
    await writeFile(
      join(paths.root, "evidence/result.json"),
      '{"passed":true}\n',
    );
    await writeFile(
      join(paths.root, "fixtures/data.json"),
      '{"email":"pessoa@example.invalid","synthetic":true}\n',
    );

    const result = await stage(paths);
    assert.equal(result.stderr, "");
    const proof = await readFile(paths.proof, "utf8");
    assert.match(
      proof,
      /^scopes=BUILD_PACKAGE,GENERATED_EVIDENCE,TEST_FIXTURES$/mu,
    );
    assert.match(proof, /^fileCount=3$/mu);
    assert.match(proof, /^prohibitedDataFindingCount=0$/mu);
    assert.doesNotMatch(proof, /app\.js|data\.json|result\.json/u);
  } finally {
    await rm(paths.root, { recursive: true, force: true });
    await rm(paths.temporary, { recursive: true, force: true });
  }
});

test("conta CPF, CNPJ, e-mail real e conteúdo clínico sem copiá-los ao resumo", async () => {
  const paths = await fixture();
  try {
    const prohibitedValues = [
      ["529", "982", "247"].join(".").concat("-25"),
      ["04", "252", "011"].join(".").concat("/0001-10"),
      ["pessoa", "empresa.com.br"].join("@"),
      ["CI", "D: A12.3"].join(""),
      ["CR", "M-SP: 123456"].join(""),
    ];
    await writeFile(join(paths.root, "build/app.js"), "export default 1;\n");
    await writeFile(join(paths.root, "evidence/result.txt"), "resultado\n");
    await writeFile(
      join(paths.root, "fixtures/input.txt"),
      prohibitedValues.join("\n"),
    );

    await stage(paths);
    const proof = await readFile(paths.proof, "utf8");
    assert.match(proof, /^prohibitedDataFindingCount=5$/mu);
    for (const value of prohibitedValues) {
      assert.equal(proof.includes(value), false);
    }
  } finally {
    await rm(paths.root, { recursive: true, force: true });
    await rm(paths.temporary, { recursive: true, force: true });
  }
});

test("não isenta e-mail real apenas porque o arquivo é um SBOM CycloneDX", async () => {
  const paths = await fixture();
  try {
    await writeFile(join(paths.root, "build/app.js"), "export default 1;\n");
    await writeFile(
      join(paths.root, "evidence/inventory.cdx.json"),
      JSON.stringify(
        cycloneDxInventory({
          description: ["responsavel", "empresa.com.br"].join("@"),
        }),
      ),
    );
    await writeFile(
      join(paths.root, "fixtures/data.json"),
      '{"synthetic":true}\n',
    );

    await stage(paths);
    const proof = await readFile(paths.proof, "utf8");
    assert.match(proof, /^prohibitedDataFindingCount=1$/mu);
  } finally {
    await rm(paths.root, { recursive: true, force: true });
    await rm(paths.temporary, { recursive: true, force: true });
  }
});

test("não isenta CPF válido colocado no serial UUID de um CycloneDX", async () => {
  const paths = await fixture();
  try {
    const cpf = "52998224725";
    const inventory = cycloneDxInventory({ name: "componente" });
    inventory.serialNumber = `urn:uuid:12345678-1234-4123-8123-a${cpf}`;
    await writeFile(join(paths.root, "build/app.js"), "export default 1;\n");
    await writeFile(
      join(paths.root, "evidence/inventory.cdx.json"),
      JSON.stringify(inventory),
    );
    await writeFile(
      join(paths.root, "fixtures/data.json"),
      '{"synthetic":true}\n',
    );

    await stage(paths);
    const proof = await readFile(paths.proof, "utf8");
    assert.match(proof, /^prohibitedDataFindingCount=1$/mu);
    assert.equal(proof.includes(cpf), false);
  } finally {
    await rm(paths.root, { recursive: true, force: true });
    await rm(paths.temporary, { recursive: true, force: true });
  }
});

test("não isenta hash nem texto livre dentro de CycloneDX válido", async () => {
  const paths = await fixture();
  try {
    const cpf = "52998224725";
    const collidingSha512 = `${"a".repeat(10)}${cpf}${"b".repeat(107)}`;
    await writeFile(join(paths.root, "build/app.js"), "export default 1;\n");
    await writeFile(
      join(paths.root, "evidence/free-field.cdx.json"),
      JSON.stringify(
        cycloneDxInventory({
          description: collidingSha512,
          externalReferences: [
            {
              type: "distribution",
              url: "https://registry.npmjs.org/example/-/example-1.0.0.tgz",
              hashes: [{ alg: "SHA-512", content: collidingSha512 }],
            },
          ],
        }),
      ),
    );
    await writeFile(join(paths.root, "fixtures/data.json"), '{"ok":true}\n');

    await stage(paths);
    const proof = await readFile(paths.proof, "utf8");
    assert.match(proof, /^prohibitedDataFindingCount=2$/mu);
    assert.equal(proof.includes(cpf), false);
  } finally {
    await rm(paths.root, { recursive: true, force: true });
    await rm(paths.temporary, { recursive: true, force: true });
  }
});

test("detecta JSON por conteúdo e normaliza escapes Unicode sem confiar na extensão", async () => {
  const paths = await fixture();
  try {
    const escapedCpf =
      "\\u0035\\u0032\\u0039\\u0039\\u0038\\u0032\\u0032\\u0034\\u0037\\u0032\\u0035";
    await writeFile(join(paths.root, "build/app.js"), "export default 1;\n");
    await writeFile(
      join(paths.root, "evidence/escaped.txt"),
      `{"value":"${escapedCpf}"}`,
    );
    await writeFile(join(paths.root, "fixtures/data.json"), '{"ok":true}\n');

    await stage(paths);
    const proof = await readFile(paths.proof, "utf8");
    assert.match(proof, /^prohibitedDataFindingCount=1$/mu);
  } finally {
    await rm(paths.root, { recursive: true, force: true });
    await rm(paths.temporary, { recursive: true, force: true });
  }
});

test("examina chaves e valores JSON após decodificar controles escapados", async () => {
  const paths = await fixture();
  try {
    const cpfWithControls = "529\\n982\\t247\\n25";
    await writeFile(join(paths.root, "build/app.js"), "export default 1;\n");
    await writeFile(
      join(paths.root, "evidence/controls.json"),
      `{"value":"${cpfWithControls}","${cpfWithControls}":"chave"}`,
    );
    await writeFile(join(paths.root, "fixtures/data.json"), '{"ok":true}\n');

    await stage(paths);
    const proof = await readFile(paths.proof, "utf8");
    assert.match(proof, /^prohibitedDataFindingCount=2$/mu);
  } finally {
    await rm(paths.root, { recursive: true, force: true });
    await rm(paths.temporary, { recursive: true, force: true });
  }
});

test("falha fechada para JSON com chave repetida", async () => {
  const paths = await fixture();
  try {
    await writeFile(join(paths.root, "build/app.js"), "export default 1;\n");
    await writeFile(join(paths.root, "evidence/result.txt"), "ok\n");
    await writeFile(
      join(paths.root, "fixtures/ambiguous.json"),
      '{"value":"primeiro","value":"segundo"}',
    );

    await assert.rejects(stage(paths), /JSON input is malformed, ambiguous/u);
  } finally {
    await rm(paths.root, { recursive: true, force: true });
    await rm(paths.temporary, { recursive: true, force: true });
  }
});

test("detecta JSON UTF-16LE sem extensão e normaliza seus escapes Unicode", async () => {
  const paths = await fixture();
  try {
    const escapedCpf = "529\\n982\\t247\\n25";
    await writeFile(join(paths.root, "build/app.js"), "export default 1;\n");
    await writeFile(
      join(paths.root, "evidence/utf16-sem-extensao"),
      Buffer.from(`{"value":"${escapedCpf}"}`, "utf16le"),
    );
    await writeFile(join(paths.root, "fixtures/data.json"), '{"ok":true}\n');

    await stage(paths);
    const proof = await readFile(paths.proof, "utf8");
    assert.match(proof, /^prohibitedDataFindingCount=1$/mu);
  } finally {
    await rm(paths.root, { recursive: true, force: true });
    await rm(paths.temporary, { recursive: true, force: true });
  }
});

test("inspeciona PII dentro de ZIP e de camada compactada em OCI", async () => {
  const paths = await fixture();
  try {
    const cpf = ["529", "982", "247"].join(".").concat("-25");
    const cnpj = ["04", "252", "011"].join(".").concat("/0001-10");
    const email = ["pessoa", "empresa.com.br"].join("@");
    const cid = ["CI", "D: A12.3"].join("");
    const crm = ["CR", "M-SP: 123456"].join("");
    const zip = zipEntry("dados.txt", Buffer.from(cpf));
    const layer = gzipSync(
      tarArchive([
        ["dados/privados.txt", Buffer.from([cnpj, email, cid, crm].join("\n"))],
      ]),
    );
    const oci = tarArchive([
      ["oci-layout", Buffer.from('{"imageLayoutVersion":"1.0.0"}')],
      ["index.json", Buffer.from('{"schemaVersion":2,"manifests":[]}')],
      ["blobs/sha256/layer", layer],
    ]);

    await writeFile(join(paths.root, "build/app.js"), "export default 1;\n");
    await writeFile(join(paths.root, "evidence/image.oci.tar"), oci);
    await writeFile(join(paths.root, "fixtures/payload.zip"), zip);

    await stage(paths);
    const proof = await readFile(paths.proof, "utf8");
    assert.match(proof, /^prohibitedDataFindingCount=5$/mu);
    assert.match(
      proof,
      /^prohibitedDataArchiveInspection=FAIL_CLOSED_TAR_ZIP_OCI_V2$/mu,
    );
    assert.match(proof, /^prohibitedDataArchiveEntryCount=5$/mu);
    for (const value of [cpf, cnpj, email, cid, crm]) {
      assert.equal(proof.includes(value), false);
    }
  } finally {
    await rm(paths.root, { recursive: true, force: true });
    await rm(paths.temporary, { recursive: true, force: true });
  }
});

test("tolera fixture .gz inválida somente dentro de dependência de terceiro", async () => {
  const paths = await fixture();
  try {
    const cpf = ["529", "982", "247"].join(".").concat("-25");
    const layer = gzipSync(
      tarArchive([
        [
          "app/node_modules/@fastify/static/test/fixtures/sample.gz",
          Buffer.from("fixture publica sem assinatura gzip"),
        ],
        ["app/dados/documento.txt", Buffer.from(cpf)],
      ]),
    );
    const oci = tarArchive([
      ["oci-layout", Buffer.from('{"imageLayoutVersion":"1.0.0"}')],
      ["index.json", Buffer.from('{"schemaVersion":2,"manifests":[]}')],
      ["blobs/sha256/layer", layer],
    ]);

    await writeFile(join(paths.root, "build/app.js"), "export default 1;\n");
    await writeFile(join(paths.root, "evidence/image.oci.tar"), oci);
    await writeFile(join(paths.root, "fixtures/data.json"), '{"ok":true}\n');

    await stage(paths);
    const proof = await readFile(paths.proof, "utf8");
    assert.match(proof, /^prohibitedDataFindingCount=1$/mu);
    assert.equal(proof.includes(cpf), false);
  } finally {
    await rm(paths.root, { recursive: true, force: true });
    await rm(paths.temporary, { recursive: true, force: true });
  }
});

test("falha fechada para .gz aninhado inválido fora de dependência de terceiro", async () => {
  const paths = await fixture();
  try {
    const layer = gzipSync(
      tarArchive([
        ["app/dados/documento.gz", Buffer.from("nao e um arquivo gzip")],
      ]),
    );
    const oci = tarArchive([
      ["oci-layout", Buffer.from('{"imageLayoutVersion":"1.0.0"}')],
      ["index.json", Buffer.from('{"schemaVersion":2,"manifests":[]}')],
      ["blobs/sha256/layer", layer],
    ]);

    await writeFile(join(paths.root, "build/app.js"), "export default 1;\n");
    await writeFile(join(paths.root, "evidence/image.oci.tar"), oci);
    await writeFile(join(paths.root, "fixtures/data.json"), '{"ok":true}\n');

    await assert.rejects(stage(paths), /gzip input is malformed/u);
  } finally {
    await rm(paths.root, { recursive: true, force: true });
    await rm(paths.temporary, { recursive: true, force: true });
  }
});

test("separa metadados publicos de dependencias dos dados da aplicacao na OCI", async () => {
  const paths = await fixture();
  try {
    const maintainerEmail = ["mantenedor", "projeto.dev"].join("@");
    const businessEmail = ["colaborador", "empresa.com.br"].join("@");
    const layer = gzipSync(
      tarArchive([
        [
          "app/node_modules/pacote/package.json",
          Buffer.from(JSON.stringify({ author: maintainerEmail })),
        ],
        ["app/apps/api/dist/dados.txt", Buffer.from(businessEmail)],
      ]),
    );
    const oci = tarArchive([
      ["oci-layout", Buffer.from('{"imageLayoutVersion":"1.0.0"}')],
      ["index.json", Buffer.from('{"schemaVersion":2,"manifests":[]}')],
      ["blobs/sha256/layer", layer],
    ]);

    await writeFile(join(paths.root, "build/app.js"), "export default 1;\n");
    await writeFile(join(paths.root, "evidence/image.oci.tar"), oci);
    await writeFile(join(paths.root, "fixtures/data.json"), '{"ok":true}\n');

    await stage(paths);
    const proof = await readFile(paths.proof, "utf8");
    assert.match(
      proof,
      /^prohibitedDataPolicy=PORTAL_DP_PROHIBITED_DATA_V3$/mu,
    );
    assert.match(proof, /^prohibitedDataFindingCount=1$/mu);
    assert.equal(proof.includes(maintainerEmail), false);
    assert.equal(proof.includes(businessEmail), false);
  } finally {
    await rm(paths.root, { recursive: true, force: true });
    await rm(paths.temporary, { recursive: true, force: true });
  }
});

test("preserva domínios reservados e documentos com dígitos inválidos dentro de ZIP", async () => {
  const paths = await fixture();
  try {
    const safeArchive = zipEntry(
      "massa-sintetica.txt",
      Buffer.from(
        [
          "pessoa@example.invalid",
          "000.000.000-00",
          "00.000.000/0000-00",
          "campo CID sem valor",
          "campo CRM sem valor",
        ].join("\n"),
      ),
    );
    await writeFile(join(paths.root, "build/app.js"), "ok\n");
    await writeFile(join(paths.root, "evidence/result.txt"), "ok\n");
    await writeFile(join(paths.root, "fixtures/synthetic.zip"), safeArchive);

    await stage(paths);
    const proof = await readFile(paths.proof, "utf8");
    assert.match(proof, /^prohibitedDataFindingCount=0$/mu);
  } finally {
    await rm(paths.root, { recursive: true, force: true });
    await rm(paths.temporary, { recursive: true, force: true });
  }
});

test("falha fechado para arquivo compactado malformado e expansão acima do limite", async () => {
  for (const archive of [
    Buffer.from("nao e um zip"),
    zipEntry("bomba.txt", Buffer.from("x"), { declaredSize: 10_000_000 }),
  ]) {
    const paths = await fixture();
    try {
      await writeFile(join(paths.root, "build/app.js"), "ok\n");
      await writeFile(join(paths.root, "evidence/result.txt"), "ok\n");
      await writeFile(join(paths.root, "fixtures/payload.zip"), archive);
      await assert.rejects(
        stage(paths),
        /archive inspection failed|zip input is malformed/u,
      );
    } finally {
      await rm(paths.root, { recursive: true, force: true });
      await rm(paths.temporary, { recursive: true, force: true });
    }
  }
});

test("continua falhando fechado para .gz malformado fornecido no topo", async () => {
  const paths = await fixture();
  try {
    await writeFile(join(paths.root, "build/app.js"), "ok\n");
    await writeFile(join(paths.root, "evidence/result.txt"), "ok\n");
    await writeFile(
      join(paths.root, "fixtures/payload.gz"),
      "conteudo sem assinatura gzip\n",
    );

    await assert.rejects(stage(paths), /gzip input is malformed/u);
  } finally {
    await rm(paths.root, { recursive: true, force: true });
    await rm(paths.temporary, { recursive: true, force: true });
  }
});

test("falha fechada para escopo vazio, ausente ou com link simbólico", async () => {
  const paths = await fixture();
  try {
    await writeFile(join(paths.root, "build/app.js"), "ok\n");
    await writeFile(join(paths.root, "evidence/result.txt"), "ok\n");
    await assert.rejects(
      stage(paths),
      /scope TEST_FIXTURES has no regular files/u,
    );
  } finally {
    await rm(paths.root, { recursive: true, force: true });
    await rm(paths.temporary, { recursive: true, force: true });
  }
});
