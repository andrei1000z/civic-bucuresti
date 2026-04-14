import { describe, it, expect } from "vitest";
import { sanitizeStr, sanitizeKey, sanitizeId } from "./sanitize";

describe("sanitizeStr", () => {
  it("returns empty string for non-string input", () => {
    expect(sanitizeStr(null)).toBe("");
    expect(sanitizeStr(undefined)).toBe("");
    expect(sanitizeStr(123)).toBe("");
    expect(sanitizeStr({})).toBe("");
    expect(sanitizeStr([])).toBe("");
  });

  it("trims whitespace", () => {
    expect(sanitizeStr("  hello  ")).toBe("hello");
  });

  it("strips control characters", () => {
    expect(sanitizeStr("hello\nworld")).toBe("helloworld");
    expect(sanitizeStr("a\rb\tc\0d")).toBe("abcd");
  });

  it("enforces max length", () => {
    expect(sanitizeStr("abcdef", 3)).toBe("abc");
    expect(sanitizeStr("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", 10)).toBe("xxxxxxxxxx");
  });

  it("defaults maxLen to 100", () => {
    const input = "x".repeat(250);
    expect(sanitizeStr(input).length).toBe(100);
  });

  it("handles empty string", () => {
    expect(sanitizeStr("")).toBe("");
  });
});

describe("sanitizeKey", () => {
  it("strips Redis-dangerous characters", () => {
    expect(sanitizeKey("foo:bar")).toBe("foobar");
    expect(sanitizeKey("foo*bar?baz")).toBe("foobarbaz");
    expect(sanitizeKey("foo[bar]baz{qux}")).toBe("foobarbazqux");
  });

  it("keeps slashes, dots, commas, dashes (pathnames and locations)", () => {
    expect(sanitizeKey("/impact/cluj")).toBe("/impact/cluj");
    expect(sanitizeKey("București, RO")).toBe("București, RO");
    expect(sanitizeKey("sesizare-123")).toBe("sesizare-123");
  });

  it("combines with sanitizeStr cleanup", () => {
    expect(sanitizeKey("  a:b  ")).toBe("ab");
    expect(sanitizeKey("a\n:b")).toBe("ab");
  });

  it("applies max length before stripping (sanitizeStr first, then replace)", () => {
    // "a:b:c:d:e" sliced to 3 → "a:b" → colons stripped → "ab"
    expect(sanitizeKey("a:b:c:d:e", 3)).toBe("ab");
  });

  it("returns empty for non-string", () => {
    expect(sanitizeKey(null)).toBe("");
    expect(sanitizeKey(42)).toBe("");
  });
});

describe("sanitizeId", () => {
  it("keeps only alphanumeric + dash + underscore", () => {
    expect(sanitizeId("v-abc123_xyz")).toBe("v-abc123_xyz");
  });

  it("strips special characters", () => {
    expect(sanitizeId("user@example.com")).toBe("userexamplecom");
    expect(sanitizeId("id with spaces")).toBe("idwithspaces");
    expect(sanitizeId("a/b\\c;d")).toBe("abcd");
  });

  it("hard caps at 64 chars", () => {
    const input = "a".repeat(100);
    expect(sanitizeId(input).length).toBe(64);
  });

  it("returns empty for non-string", () => {
    expect(sanitizeId(null)).toBe("");
    expect(sanitizeId({ id: "foo" })).toBe("");
  });

  it("handles UUID format", () => {
    const uuid = "550e8400-e29b-41d4-a716-446655440000";
    expect(sanitizeId(uuid)).toBe(uuid);
  });

  it("strips control characters that survive via non-whitelist", () => {
    expect(sanitizeId("abc\ndef")).toBe("abcdef");
  });
});
