import { describe, expect, it } from "vitest";

import {
  CSRF_COOKIE_NAME,
  createCsrfCookie,
  isUnsafeRequestAuthorized,
} from "./csrf.js";

const token = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

describe("base CSRF", () => {
  it("emite cookie host-only, HttpOnly e estrito", () => {
    expect(createCsrfCookie(token, true)).toBe(
      `${CSRF_COOKIE_NAME}=${token}; Path=/api/v1; HttpOnly; SameSite=Strict; Max-Age=1800; Secure`,
    );
  });

  it("exige origem, cookie e cabecalho com o mesmo token", () => {
    const base = {
      origin: "https://portal.example",
      expectedOrigin: "https://portal.example",
      cookie: `${CSRF_COOKIE_NAME}=${token}`,
      csrfHeader: token,
    };
    expect(isUnsafeRequestAuthorized(base)).toBe(true);
    expect(
      isUnsafeRequestAuthorized({ ...base, origin: "https://evil.example" }),
    ).toBe(false);
    expect(
      isUnsafeRequestAuthorized({ ...base, csrfHeader: `${token}x` }),
    ).toBe(false);
    expect(isUnsafeRequestAuthorized({ ...base, cookie: undefined })).toBe(
      false,
    );
  });
});
