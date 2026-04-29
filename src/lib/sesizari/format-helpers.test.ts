import { describe, it, expect } from "vitest";
import { capitalizeName, formatAddress } from "./format-helpers";

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
