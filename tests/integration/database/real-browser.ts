import { execFile } from "node:child_process";
import { constants } from "node:fs";
import { access, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

function browserCandidates(): string[] {
  const configured = [
    process.env["BROWSER_EXECUTABLE_PATH"],
    process.env["CHROME_BIN"],
    process.env["CHROME_PATH"],
  ].filter((value): value is string => Boolean(value?.trim()));

  if (process.platform === "win32") {
    return [
      ...configured,
      join(
        process.env["PROGRAMFILES"] ?? "C:\\Program Files",
        "Google/Chrome/Application/chrome.exe",
      ),
      join(
        process.env["PROGRAMFILES(X86)"] ?? "C:\\Program Files (x86)",
        "Microsoft/Edge/Application/msedge.exe",
      ),
      join(
        process.env["PROGRAMFILES"] ?? "C:\\Program Files",
        "Microsoft/Edge/Application/msedge.exe",
      ),
    ];
  }
  if (process.platform === "darwin") {
    return [
      ...configured,
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
    ];
  }
  return [
    ...configured,
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/snap/bin/chromium",
  ];
}

async function findBrowserExecutable(): Promise<string> {
  for (const candidate of browserCandidates()) {
    try {
      await access(candidate, constants.X_OK);
      return candidate;
    } catch {
      // A lista contém caminhos próprios de vários sistemas operacionais.
    }
  }
  throw new Error(
    "Nenhum Chrome, Edge ou Chromium real foi encontrado. " +
      "Defina BROWSER_EXECUTABLE_PATH sem instalar o navegador durante o teste.",
  );
}

/**
 * Carrega uma URL em navegador real e devolve o DOM produzido após o JavaScript.
 * O perfil efêmero impede que o teste leia ou altere dados do navegador do usuário.
 */
export async function renderPageInRealBrowser(url: string): Promise<string> {
  const target = new URL(url);
  const localHosts = new Set(["127.0.0.1", "localhost", "[::1]"]);
  if (target.protocol !== "http:" || !localHosts.has(target.hostname)) {
    throw new Error(
      "A prova de navegador aceita somente uma URL HTTP local e sintética.",
    );
  }

  const executable = await findBrowserExecutable();
  const profileDirectory = await mkdtemp(
    join(tmpdir(), "portal-dp-browser-proof-"),
  );
  const sandboxOverride =
    process.env["BROWSER_DISABLE_SANDBOX"] === "true" ? ["--no-sandbox"] : [];

  try {
    const { stdout } = await execFileAsync(
      executable,
      [
        "--headless=new",
        "--disable-background-networking",
        "--disable-component-update",
        "--disable-default-apps",
        "--disable-dev-shm-usage",
        "--disable-extensions",
        "--disable-gpu",
        "--disable-sync",
        "--metrics-recording-only",
        "--no-default-browser-check",
        "--no-first-run",
        "--no-proxy-server",
        // A desativação do sandbox é opt-in e serve somente a executores já
        // isolados que não conseguem iniciar o sandbox nativo do navegador.
        ...sandboxOverride,
        `--user-data-dir=${profileDirectory}`,
        "--virtual-time-budget=5000",
        "--dump-dom",
        url,
      ],
      {
        encoding: "utf8",
        maxBuffer: 4 * 1024 * 1024,
        timeout: 20_000,
        windowsHide: true,
      },
    );

    if (!stdout.includes("<html")) {
      throw new Error("O navegador não devolveu um documento HTML válido.");
    }
    return stdout;
  } finally {
    await rm(profileDirectory, { recursive: true, force: true });
  }
}
