import { timingSafeEqual } from "node:crypto";

export const CSRF_COOKIE_NAME = "portal_dp_csrf";

export function createCsrfCookie(token: string, secure: boolean): string {
  const attributes = [
    `${CSRF_COOKIE_NAME}=${token}`,
    "Path=/api/v1",
    "HttpOnly",
    "SameSite=Strict",
    "Max-Age=1800",
  ];
  if (secure) attributes.push("Secure");
  return attributes.join("; ");
}

export function isUnsafeRequestAuthorized(input: {
  origin: string | string[] | undefined;
  expectedOrigin: string;
  cookie: string | undefined;
  csrfHeader: string | string[] | undefined;
}): boolean {
  if (
    typeof input.origin !== "string" ||
    input.origin !== input.expectedOrigin
  ) {
    return false;
  }
  if (typeof input.csrfHeader !== "string") return false;
  const cookieToken = readCookie(input.cookie, CSRF_COOKIE_NAME);
  if (!cookieToken) return false;

  // A mutação exige origem confiável e o mesmo token no cookie e no cabeçalho;
  // a comparação em tempo constante reduz vazamento por temporização.
  const cookieBytes = Buffer.from(cookieToken, "utf8");
  const headerBytes = Buffer.from(input.csrfHeader, "utf8");
  return (
    cookieBytes.byteLength === headerBytes.byteLength &&
    timingSafeEqual(cookieBytes, headerBytes)
  );
}

function readCookie(header: string | undefined, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 1) continue;
    if (part.slice(0, separator).trim() !== name) continue;
    const value = part.slice(separator + 1).trim();
    if (/^[A-Za-z0-9_-]{32,200}$/u.test(value)) return value;
    return null;
  }
  return null;
}
