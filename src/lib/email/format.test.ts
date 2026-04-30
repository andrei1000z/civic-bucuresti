import { describe, expect, test } from "vitest";
import { buildSalutation, formatRecipientName } from "./format";

describe("formatRecipientName", () => {
  test("returns first capitalized name when fullName is a real human name", () => {
    expect(formatRecipientName({ fullName: "Eduard Musat" })).toBe("Eduard");
    expect(formatRecipientName({ fullName: "Maria-Elena Popescu" })).toBe("Maria-Elena");
  });

  test("normalizes case (ALL CAPS / lowercase → Title Case)", () => {
    expect(formatRecipientName({ fullName: "EDUARD" })).toBe("Eduard");
    expect(formatRecipientName({ fullName: "andrei" })).toBe("Andrei");
  });

  test("Romanian diacritics survive case normalization", () => {
    expect(formatRecipientName({ fullName: "ștefan" })).toBe("Ștefan");
    expect(formatRecipientName({ fullName: "țiganu Mihai" })).toBe("Țiganu");
  });

  test("returns null when displayName equals the email local part", () => {
    expect(
      formatRecipientName({
        displayName: "musateduardandrei10",
        email: "musateduardandrei10@gmail.com",
      }),
    ).toBeNull();
  });

  test("returns null when the only candidate has digits in it", () => {
    expect(formatRecipientName({ displayName: "andrei1000z" })).toBeNull();
    expect(formatRecipientName({ fullName: "user42" })).toBeNull();
  });

  test("returns null for placeholder values", () => {
    expect(formatRecipientName({ displayName: "Cetățean" })).toBeNull();
    expect(formatRecipientName({ fullName: "Cetățean anonim" })).toBeNull();
    expect(formatRecipientName({ displayName: "user" })).toBeNull();
  });

  test("prefers fullName over displayName", () => {
    expect(
      formatRecipientName({ fullName: "Eduard Pop", displayName: "andrei1000z" }),
    ).toBe("Eduard");
  });

  test("falls back to displayName when fullName is missing or rejected", () => {
    expect(formatRecipientName({ fullName: null, displayName: "Maria" })).toBe("Maria");
    expect(
      formatRecipientName({ fullName: "user42", displayName: "Andrei" }),
    ).toBe("Andrei");
  });

  test("rejects single-letter or oversized words", () => {
    expect(formatRecipientName({ fullName: "A" })).toBeNull();
    expect(formatRecipientName({ fullName: "x".repeat(35) })).toBeNull();
  });

  test("rejects names that look like emails or URLs (non-letter chars)", () => {
    expect(formatRecipientName({ fullName: "andrei@civia.ro" })).toBeNull();
    expect(formatRecipientName({ fullName: "https://civia.ro" })).toBeNull();
  });

  test("returns null when both candidates are empty", () => {
    expect(formatRecipientName({})).toBeNull();
    expect(formatRecipientName({ fullName: "  ", displayName: "" })).toBeNull();
  });
});

describe("buildSalutation", () => {
  test('returns "Salut, Eduard," with comma when a name is found', () => {
    expect(buildSalutation({ fullName: "Eduard Pop" })).toBe("Salut, Eduard,");
  });

  test("appends a wave emoji when withEmoji is set", () => {
    expect(buildSalutation({ fullName: "Eduard", withEmoji: true })).toBe("Salut, Eduard 👋");
  });

  test('returns "Bună!" when no clean name is available', () => {
    expect(
      buildSalutation({
        displayName: "musateduardandrei10",
        email: "musateduardandrei10@gmail.com",
      }),
    ).toBe("Bună!");
  });

  test("never emits Salut + email-local-part", () => {
    const out = buildSalutation({
      displayName: "andrei1000z",
      email: "andrei1000z@github.com",
    });
    expect(out).not.toContain("andrei1000z");
    expect(out).toBe("Bună!");
  });
});
