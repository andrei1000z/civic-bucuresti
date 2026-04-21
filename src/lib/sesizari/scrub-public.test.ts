import { describe, it, expect } from "vitest";
import { scrubFormalTextForPublic } from "./scrub-public";

const NEW_OPENER = `Bună ziua,

Mă numesc Eduard Andrei Mușat, locuiesc în Strada Novaci 12, Sector 5 și doresc să vă aduc la cunoștință o problemă care afectează siguranța pietonilor pe Calea 13 Septembrie.

În ultima perioadă, am observat că mașinile opresc și parchează pe trotuar.

Cu stimă,
Eduard Andrei Mușat
20 martie 2024`;

const LEGACY_OPENER = `Bună ziua,

Subsemnatul Eduard Andrei Mușat, domiciliat în Strada Novaci 12, Sector 5, vă adresez prezenta sesizare în temeiul OG 27/2002.

Cu respect,
Eduard Andrei Mușat
20 martie 2024`;

describe("scrubFormalTextForPublic", () => {
  it("redacts address in new opener, keeps name when hideName=false", () => {
    const out = scrubFormalTextForPublic(NEW_OPENER, {
      authorName: "Eduard Andrei Mușat",
      hideName: false,
    });
    expect(out).not.toContain("Strada Novaci 12");
    expect(out).not.toContain("Sector 5 și doresc"); // address removed
    expect(out).toContain("[adresă ascunsă]");
    expect(out).toContain("Eduard Andrei Mușat"); // name kept
  });

  it("redacts both address and name when hideName=true", () => {
    const out = scrubFormalTextForPublic(NEW_OPENER, {
      authorName: "Eduard Andrei Mușat",
      hideName: true,
    });
    expect(out).not.toContain("Eduard Andrei Mușat");
    expect(out).not.toContain("Strada Novaci 12");
    expect(out).toContain("Cetățean anonim");
    expect(out).toContain("[adresă ascunsă]");
  });

  it("keeps the 'și doresc...' tail intact after opener scrub", () => {
    const out = scrubFormalTextForPublic(NEW_OPENER, {
      authorName: "Eduard Andrei Mușat",
      hideName: false,
    });
    expect(out).toContain("doresc să vă aduc la cunoștință");
  });

  it("redacts legacy 'Subsemnatul' opener address", () => {
    const out = scrubFormalTextForPublic(LEGACY_OPENER, {
      authorName: "Eduard Andrei Mușat",
      hideName: false,
    });
    expect(out).not.toContain("Strada Novaci 12");
    expect(out).toContain("[adresă ascunsă]");
  });

  it("redacts legacy opener name when hidden", () => {
    const out = scrubFormalTextForPublic(LEGACY_OPENER, {
      authorName: "Eduard Andrei Mușat",
      hideName: true,
    });
    expect(out).not.toContain("Eduard Andrei Mușat");
    expect(out).toContain("Cetățean anonim");
  });

  it("redacts signature when hideName=true", () => {
    const out = scrubFormalTextForPublic(NEW_OPENER, {
      authorName: "Eduard Andrei Mușat",
      hideName: true,
    });
    // Signature line should have the redacted name, not the real one
    const sigMatch = out.match(/Cu stim[ăa],\s*\n([^\n]+)/);
    expect(sigMatch?.[1]).toBe("Cetățean anonim");
  });

  it("handles empty text", () => {
    expect(scrubFormalTextForPublic("", { authorName: "x", hideName: false })).toBe("");
  });

  it("leaves non-identity content untouched", () => {
    const out = scrubFormalTextForPublic(NEW_OPENER, {
      authorName: "Eduard Andrei Mușat",
      hideName: false,
    });
    expect(out).toContain("Calea 13 Septembrie"); // location of problem stays
    expect(out).toContain("mașinile opresc și parchează pe trotuar");
  });

  it("redacts standalone occurrences of the name when hideName=true", () => {
    const text = "Eu, Eduard Andrei Mușat, confirm. Altă mențiune: Eduard Andrei Mușat.";
    const out = scrubFormalTextForPublic(text, {
      authorName: "Eduard Andrei Mușat",
      hideName: true,
    });
    expect(out).not.toContain("Eduard Andrei Mușat");
    expect((out.match(/Cetățean anonim/g) ?? []).length).toBeGreaterThanOrEqual(2);
  });
});
