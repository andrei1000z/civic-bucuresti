import { describe, it, expect } from "vitest";
import { capitalizeName, formatAddress, normalizeRoLocation } from "./format-helpers";

describe("capitalizeName", () => {
  it("capitalizes single word", () => {
    expect(capitalizeName("ion")).toBe("Ion");
  });

  it("capitalizes multi-word names", () => {
    expect(capitalizeName("ion popescu")).toBe("Ion Popescu");
  });

  it("downcases ALL CAPS input", () => {
    expect(capitalizeName("ION POPESCU")).toBe("Ion Popescu");
  });

  it("collapses multiple spaces", () => {
    expect(capitalizeName("ion   popescu")).toBe("Ion Popescu");
  });

  it("trims surrounding whitespace", () => {
    expect(capitalizeName("  Ion  ")).toBe("Ion");
  });

  it("handles empty input", () => {
    expect(capitalizeName("")).toBe("");
  });

  it("preserves Romanian diacritics", () => {
    expect(capitalizeName("ștefan munteanu")).toBe("Ștefan Munteanu");
  });

  it("handles 3+ word names", () => {
    expect(capitalizeName("maria ileana popescu")).toBe("Maria Ileana Popescu");
  });
});

describe("formatAddress", () => {
  it("capitalizes first letter", () => {
    expect(formatAddress("strada matei voievod")).toBe("Strada matei voievod");
  });

  it("trims surrounding whitespace", () => {
    expect(formatAddress("  Strada Matei  ")).toBe("Strada Matei");
  });

  it("handles empty input", () => {
    expect(formatAddress("")).toBe("");
  });

  it("handles whitespace-only input", () => {
    expect(formatAddress("   ")).toBe("");
  });

  it("preserves rest of the string casing", () => {
    expect(formatAddress("strada IOAN nr. 12")).toBe("Strada IOAN nr. 12");
  });

  it("handles single character", () => {
    expect(formatAddress("a")).toBe("A");
  });
});

describe("normalizeRoLocation", () => {
  it("fixes the real-world Vasile Lascar case", () => {
    expect(
      normalizeRoLocation("strada Vasile Lascar in capat cu Bulevardul Stefan cel Mare"),
    ).toBe("Strada Vasile Lascar în capătul cu Bulevardul Ștefan cel Mare");
  });

  it("title-cases street types", () => {
    expect(normalizeRoLocation("strada matei voievod 12")).toBe("Strada matei voievod 12");
    expect(normalizeRoLocation("bulevardul magheru")).toBe("Bulevardul magheru");
    expect(normalizeRoLocation("calea victoriei")).toBe("Calea victoriei");
    expect(normalizeRoLocation("soseaua kiseleff")).toBe("Șoseaua kiseleff");
    expect(normalizeRoLocation("piata victoriei")).toBe("Piața victoriei");
  });

  it("adds diacritics to common Romanian intersection words", () => {
    expect(normalizeRoLocation("la intersectia cu strada X")).toBe(
      "La intersecția cu Strada X",
    );
    expect(normalizeRoLocation("colt cu calea Mosilor")).toBe("Colț cu Calea Mosilor");
    expect(normalizeRoLocation("in dreptul scolii")).toBe("În dreptul scolii");
    expect(normalizeRoLocation("pe langa parc")).toBe("Pe lângă parc");
  });

  it("fixes proper nouns", () => {
    expect(normalizeRoLocation("Strada Stefan cel Mare")).toBe("Strada Ștefan cel Mare");
    expect(normalizeRoLocation("Iasi, Bulevardul X")).toBe("Iași, Bulevardul X");
    expect(normalizeRoLocation("Targu Mures")).toBe("Târgu Mureș");
  });

  it("does not corrupt already-diacritic input", () => {
    expect(normalizeRoLocation("Strada Vasile Lascăr, în capătul cu Bulevardul Ștefan cel Mare")).toBe(
      "Strada Vasile Lascăr, în capătul cu Bulevardul Ștefan cel Mare",
    );
  });

  it("handles empty input", () => {
    expect(normalizeRoLocation("")).toBe("");
  });

  it("trims whitespace", () => {
    expect(normalizeRoLocation("  strada Y  ")).toBe("Strada Y");
  });

  it("does not mangle standalone 'in' inside other words", () => {
    expect(normalizeRoLocation("Linus Pauling in capat")).toBe("Linus Pauling în capăt");
  });
});
