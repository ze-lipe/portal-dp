import { writeFile } from "node:fs/promises";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { resolve } from "node:path";

const countPathArgument = process.argv[2];
if (!countPathArgument) {
  throw new Error("O caminho do comprovante de contagem é obrigatório");
}

const countPath = resolve(countPathArgument);
let byteCount = 0n;

// Encaminha os bytes sem interpretá-los nem persistir o conteúdo sensível.
const counter = new Transform({
  transform(chunk, _encoding, callback) {
    byteCount += BigInt(chunk.length);
    callback(null, chunk);
  },
});

await pipeline(process.stdin, counter, process.stdout);
await writeFile(countPath, `${byteCount}\n`, { encoding: "utf8", flag: "wx" });
