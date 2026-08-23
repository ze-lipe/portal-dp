// JSON.parse aceita silenciosamente chaves repetidas e preserva apenas a
// ultima. Esta validacao lexical rejeita documentos ambiguos antes que algum
// consumidor normalize ou examine o conteudo semantico.
export function assertNoDuplicateJsonKeys(text) {
  let position = 0;

  function fail(message) {
    throw new Error(`Strict JSON validation failed: ${message}`);
  }

  function skipWhitespace() {
    while (/\s/u.test(text[position] ?? "")) position += 1;
  }

  function parseString() {
    if (text[position] !== '"') fail("string was expected");
    const start = position;
    position += 1;
    while (position < text.length) {
      if (text[position] === '"') {
        position += 1;
        return JSON.parse(text.slice(start, position));
      }
      if (text[position] === "\\") {
        position += text[position + 1] === "u" ? 6 : 2;
      } else {
        position += 1;
      }
    }
    fail("string is unterminated");
  }

  function parseValue() {
    skipWhitespace();
    const token = text[position];
    if (token === "{") {
      parseObject();
      return;
    }
    if (token === "[") {
      parseArray();
      return;
    }
    if (token === '"') {
      parseString();
      return;
    }
    const primitive = text
      .slice(position)
      .match(
        /^(?:true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/u,
      )?.[0];
    if (!primitive) fail("value was expected");
    position += primitive.length;
  }

  function parseObject() {
    position += 1;
    skipWhitespace();
    const keys = new Set();
    if (text[position] === "}") {
      position += 1;
      return;
    }
    while (position < text.length) {
      skipWhitespace();
      const key = parseString();
      if (keys.has(key)) fail("JSON contains a duplicate object key");
      keys.add(key);
      skipWhitespace();
      if (text[position] !== ":") fail("object separator is missing");
      position += 1;
      parseValue();
      skipWhitespace();
      if (text[position] === "}") {
        position += 1;
        return;
      }
      if (text[position] !== ",") fail("object is malformed");
      position += 1;
    }
    fail("object is unterminated");
  }

  function parseArray() {
    position += 1;
    skipWhitespace();
    if (text[position] === "]") {
      position += 1;
      return;
    }
    while (position < text.length) {
      parseValue();
      skipWhitespace();
      if (text[position] === "]") {
        position += 1;
        return;
      }
      if (text[position] !== ",") fail("array is malformed");
      position += 1;
    }
    fail("array is unterminated");
  }

  parseValue();
  skipWhitespace();
  if (position !== text.length) fail("document contains trailing content");
}
