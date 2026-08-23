import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import test from "node:test";

import {
  createProhibitedDataInspection,
  inspectProhibitedData,
} from "../../scripts/prohibited-data-content-scan.mjs";

const execute = promisify(execFile);
const repositoryRoot = resolve(import.meta.dirname, "../..");
const script = resolve(repositoryRoot, "scripts/sanitize-cyclonedx-sboms.mjs");

function userAtHost(user, host = "github.com") {
  return [user, host].join("@");
}

function componentIdentity(component) {
  return {
    type: component.type,
    group: component.group,
    name: component.name,
    version: component.version,
    purl: component.purl,
    bomRef: component["bom-ref"],
  };
}

function dependency({ index = 0, ...overrides } = {}) {
  const purl = `pkg:npm/dependency-${index}@1.0.0`;
  return {
    type: "library",
    name: `dependency-${index}`,
    version: "1.0.0",
    purl,
    "bom-ref": purl,
    ...overrides,
  };
}

function sbom(index, components = [dependency({ index })]) {
  const rootPurl = `pkg:npm/root-${index}@1.0.0`;
  return {
    $schema: "http://cyclonedx.org/schema/bom-1.7.schema.json",
    bomFormat: "CycloneDX",
    specVersion: "1.7",
    serialNumber: `urn:uuid:00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
    version: 1,
    metadata: {
      component: {
        type: "library",
        name: `root-${index}`,
        version: "1.0.0",
        purl: rootPurl,
        "bom-ref": rootPurl,
      },
    },
    components,
    dependencies: [
      { ref: rootPurl, dependsOn: components.map((item) => item.purl) },
      ...components.map((item) => ({ ref: item.purl, dependsOn: [] })),
    ],
  };
}

async function fixture(
  documents = Array.from({ length: 11 }, (_, index) => sbom(index)),
) {
  const directory = await mkdtemp(join(tmpdir(), "portal-dp-sbom-sanitize-"));
  for (const [index, document] of documents.entries()) {
    await writeFile(
      join(directory, `${String(index).padStart(2, "0")}.cdx.json`),
      typeof document === "string"
        ? document
        : `${JSON.stringify(document, null, 2)}\n`,
    );
  }
  return directory;
}

async function run(directory) {
  return execute(process.execPath, [script, "--directory", directory], {
    cwd: repositoryRoot,
  });
}

test("remove somente e-mails de autores terceiros e preserva o inventario", async () => {
  const publicEmail = ["maintainer", "package.dev"].join("@");
  const secondPublicEmail = ["author", "library.dev"].join("@");
  const legacyEmail = ["legacy", "package.dev"].join("@");
  const rootEmail = ["root", "empresa.com.br"].join("@");
  const internalEmail = ["internal", "empresa.com.br"].join("@");
  const arbitraryEmail = ["arbitrary", "empresa.com.br"].join("@");
  const websiteEmail = ["website", "empresa.com.br"].join("@");
  const external = dependency({
    index: 0,
    description: `Contato de negocio: ${arbitraryEmail}`,
    author: `Legacy <${legacyEmail}> token-que-deve-permanecer`,
    authors: [
      { name: `Maintainer <${publicEmail}>` },
      {
        name: "Second maintainer",
        email: secondPublicEmail,
        phone: "+1 555 0100",
      },
    ],
    externalReferences: [
      {
        type: "vcs",
        url: `${userAtHost("git")}:example/scp-repository.git`,
      },
      {
        type: "vcs",
        url: `git+ssh://${userAtHost("git")}/example/ssh-repository.git`,
      },
      {
        type: "vcs",
        url: `git+https://${userAtHost("human-login")}/example/https-repository.git`,
      },
      {
        type: "website",
        url: `https://example.invalid/contact/${websiteEmail}`,
      },
      {
        type: "distribution",
        url: "https://registry.npmjs.org/dependency/-/dependency-1.0.0.tgz",
        hashes: [{ alg: "SHA-512", content: "a".repeat(128) }],
      },
    ],
  });
  const internalPurl = "pkg:npm/%40portal-dp/contracts@1.0.0";
  const internal = dependency({
    index: 1,
    name: "contracts",
    group: "@portal-dp",
    purl: internalPurl,
    "bom-ref": internalPurl,
    authors: [{ name: internalEmail }],
  });
  const documents = Array.from({ length: 11 }, (_, index) => sbom(index));
  documents[0] = sbom(0, [external, internal]);
  documents[0].metadata.component.authors = [{ name: rootEmail }];
  const originalInventory = structuredClone(documents[0].dependencies);
  const originalComponentIdentities =
    documents[0].components.map(componentIdentity);
  const originalNonVcsReferences = documents[0].components.map((component) =>
    structuredClone(
      (component.externalReferences ?? []).filter(
        (reference) => reference.type !== "vcs",
      ),
    ),
  );
  const directory = await fixture(documents);
  try {
    const result = await run(directory);
    assert.equal(result.stderr, "");
    assert.deepEqual(JSON.parse(result.stdout), {
      sanitized: true,
      documentCount: 11,
      regeneratedSerialNumberCount: 11,
      redactedEmailCount: 3,
      normalizedVcsReferenceCount: 3,
    });

    const output = await readFile(join(directory, "00.cdx.json"), "utf8");
    const document = JSON.parse(output);
    assert.deepEqual(document.dependencies, originalInventory);
    assert.deepEqual(
      document.components.map(componentIdentity),
      originalComponentIdentities,
    );
    assert.deepEqual(
      document.components.map((component) =>
        (component.externalReferences ?? []).filter(
          (reference) => reference.type !== "vcs",
        ),
      ),
      originalNonVcsReferences,
    );
    assert.equal(document.components.length, 2);
    assert.equal(output.includes(publicEmail), false);
    assert.equal(output.includes(secondPublicEmail), false);
    assert.equal(output.includes(legacyEmail), false);
    assert.equal(output.includes("token-que-deve-permanecer"), true);
    assert.equal(output.includes(rootEmail), true);
    assert.equal(output.includes(internalEmail), true);
    assert.equal(output.includes(arbitraryEmail), true);
    assert.equal(output.includes(websiteEmail), true);
    assert.deepEqual(
      document.components[0].externalReferences.map((item) => item.url),
      [
        "https://github.com/example/scp-repository.git",
        "https://github.com/example/ssh-repository.git",
        "https://github.com/example/https-repository.git",
        `https://example.invalid/contact/${websiteEmail}`,
        "https://registry.npmjs.org/dependency/-/dependency-1.0.0.tgz",
      ],
    );
    assert.deepEqual(document.components[0].authors, [
      { name: "Maintainer <[contato-publico-removido]>" },
      { name: "Second maintainer", phone: "+1 555 0100" },
    ]);

    const inspection = createProhibitedDataInspection();
    inspectProhibitedData(
      Buffer.from(output),
      "inventory.cdx.json",
      inspection,
    );
    assert.equal(inspection.findingCount, 4);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("regenera UUID aleatorio que coincide com CPF e preserva unicidade", async () => {
  const cpf = "52998224725";
  const documents = Array.from({ length: 11 }, (_, index) => sbom(index));
  documents[0].serialNumber = `urn:uuid:12345678-1234-4123-8123-a${cpf}`;
  const directory = await fixture(documents);
  try {
    const result = JSON.parse((await run(directory)).stdout);
    assert.equal(result.regeneratedSerialNumberCount, 11);

    const serialNumbers = [];
    for (const index of documents.keys()) {
      const output = await readFile(
        join(directory, `${String(index).padStart(2, "0")}.cdx.json`),
        "utf8",
      );
      const document = JSON.parse(output);
      assert.match(
        document.serialNumber,
        /^urn:uuid:[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/iu,
      );
      assert.equal(document.serialNumber.includes(cpf), false);
      const inspection = createProhibitedDataInspection();
      inspectProhibitedData(
        Buffer.from(document.serialNumber),
        "cyclonedx-serial.txt",
        inspection,
      );
      assert.equal(inspection.findingCount, 0);
      serialNumbers.push(document.serialNumber);
    }
    assert.equal(new Set(serialNumbers).size, 11);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("normaliza a distribuicao Linux observada de vinte e cinco VCS sem perder componentes", async () => {
  const formats = [
    ...Array.from({ length: 16 }, () => "scp"),
    ...Array.from({ length: 6 }, () => "ssh"),
    ...Array.from({ length: 3 }, () => "https"),
  ];
  const groupSizes = [7, 7, 11];
  const documents = Array.from({ length: 11 }, (_, index) => sbom(index));
  let cursor = 0;
  for (const [documentIndex, groupSize] of groupSizes.entries()) {
    const components = [];
    for (let index = 0; index < groupSize; index += 1) {
      const sequence = cursor + index;
      const format = formats[sequence];
      const repository = `owner/repository-${sequence}.git`;
      const url =
        format === "scp"
          ? `${userAtHost("git")}:${repository}`
          : format === "ssh"
            ? `git+ssh://${userAtHost("git")}/${repository}`
            : `git+https://${userAtHost(`human-${sequence}`)}/${repository}`;
      components.push(
        dependency({
          index: sequence,
          externalReferences: [{ type: "vcs", url }],
        }),
      );
    }
    cursor += groupSize;
    documents[documentIndex] = sbom(documentIndex, components);
  }
  const expectedGraphs = documents.map((document) =>
    structuredClone(document.dependencies),
  );
  const expectedComponentIdentities = documents.map((document) =>
    document.components.map(componentIdentity),
  );
  const directory = await fixture(documents);
  try {
    const result = JSON.parse((await run(directory)).stdout);
    assert.equal(result.normalizedVcsReferenceCount, 25);
    assert.equal(result.redactedEmailCount, 0);
    let prohibitedFindingCount = 0;
    for (const index of documents.keys()) {
      const output = await readFile(
        join(directory, `${String(index).padStart(2, "0")}.cdx.json`),
        "utf8",
      );
      const document = JSON.parse(output);
      assert.deepEqual(document.dependencies, expectedGraphs[index]);
      assert.deepEqual(
        document.components.map(componentIdentity),
        expectedComponentIdentities[index],
      );
      assert.equal(
        document.components.length,
        documents[index].components.length,
      );
      assert.doesNotMatch(output, /git@github\.com/iu);
      assert.doesNotMatch(output, /git\+https:\/\//iu);
      assert.doesNotMatch(output, /git\+ssh:\/\//iu);
      const inspection = createProhibitedDataInspection();
      inspectProhibitedData(
        Buffer.from(output),
        `${index}.cdx.json`,
        inspection,
      );
      prohibitedFindingCount += inspection.findingCount;
    }
    assert.equal(prohibitedFindingCount, 0);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("falha antes de escrever quando algum SBOM e JSON malformado", async () => {
  const documents = Array.from({ length: 11 }, (_, index) => sbom(index));
  documents[10] = '{"bomFormat":"CycloneDX"';
  const directory = await fixture(documents);
  try {
    const firstPath = join(directory, "00.cdx.json");
    const before = await readFile(firstPath, "utf8");
    await assert.rejects(run(directory), /document is not valid JSON/u);
    assert.equal(await readFile(firstPath, "utf8"), before);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("rejeita chaves duplicadas mesmo quando a segunda usa escape Unicode", async () => {
  const documents = Array.from({ length: 11 }, (_, index) => sbom(index));
  documents[0].components[0].authors = [{ name: "Maintainer" }];
  const raw = JSON.stringify(documents[0]).replace(
    '"name":"Maintainer"',
    '"name":"Maintainer","\\u006eame":"Shadow"',
  );
  documents[0] = raw;
  const directory = await fixture(documents);
  try {
    await assert.rejects(run(directory), /duplicate object key/u);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("rejeita formato inesperado de autor e identidade interna ambigua", async () => {
  for (const component of [
    dependency({ index: 0, authors: [{ name: "Maintainer", role: "owner" }] }),
    dependency({ index: 0, group: "@portal-dp" }),
  ]) {
    const documents = Array.from({ length: 11 }, (_, index) => sbom(index));
    documents[0] = sbom(0, [component]);
    const directory = await fixture(documents);
    try {
      await assert.rejects(
        run(directory),
        /unexpected shape|ambiguous internal identity/u,
      );
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }
});

test("rejeita userinfo VCS fora da gramatica publica permitida", async () => {
  for (const url of [
    `${userAtHost("git", "empresa.com")}:business/repository.git`,
    `${userAtHost("git", "10.0.0.1")}:business/repository.git`,
    `${userAtHost("token+tag", "10.0.0.1")}:business/repository.git`,
    `ssh://${userAtHost("git", "host.local")}/business/repository.git`,
    `git+ssh://${userAtHost("usuario")}/example/repository.git`,
    `git+ssh://git:${userAtHost("password")}/example/repository.git`,
    `git+ssh://${userAtHost("git")}:22/example/repository.git`,
    `git+https://${userAtHost("git")}/example/repository.git?token=valor`,
  ]) {
    const documents = Array.from({ length: 11 }, (_, index) => sbom(index));
    documents[0] = sbom(0, [
      dependency({
        index: 0,
        externalReferences: [{ type: "vcs", url }],
      }),
    ]);
    const directory = await fixture(documents);
    try {
      await assert.rejects(run(directory), /unsupported user information/u);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }
});

test("exige exatamente o conjunto canonico de onze SBOMs", async () => {
  const directory = await fixture(
    Array.from({ length: 10 }, (_, index) => sbom(index)),
  );
  try {
    await assert.rejects(run(directory), /exactly 11 CycloneDX documents/u);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
