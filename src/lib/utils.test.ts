import { describe, it, expect } from "vitest";
import { cn, slugify, truncate, clamp, formatCurrency, formatNumber, randomInt } from "./utils";

describe("cn (className merger)", () => {
  it("combines multiple classes", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });
  it("handles falsy values", () => {
    expect(cn("a", false, undefined, "b")).toBe("a b");
  });
  it("merges conflicting tailwind classes via twMerge", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
  it("respects conditional classes", () => {
    expect(cn("base", { active: true, disabled: false })).toBe("base active");
  });
});

describe("slugify", () => {
  it("converts Romanian diacritics correctly", () => {
    expect(slugify("Bucureşti")).toBe("bucuresti");
    expect(slugify("București")).toBe("bucuresti");
    expect(slugify("Piața Victoriei")).toBe("piata-victoriei");
    expect(slugify("Şoseaua Ştefan")).toBe("soseaua-stefan");
  });
  it("handles punctuation and spaces", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
    expect(slugify("  multiple   spaces  ")).toBe("multiple-spaces");
  });
  it("lowercases everything", () => {
    expect(slugify("UPPERCASE")).toBe("uppercase");
  });
  it("removes leading/trailing hyphens", () => {
    expect(slugify("---test---")).toBe("test");
  });
});

describe("truncate", () => {
  it("returns original when under limit", () => {
    expect(truncate("short", 20)).toBe("short");
  });
  it("truncates and adds ellipsis", () => {
    const result = truncate("this is a very long string", 10);
    expect(result).toBe("this is a…");
    expect(result.length).toBeLessThanOrEqual(11); // 10 chars + ellipsis
  });
  it("handles exact length", () => {
    expect(truncate("exact", 5)).toBe("exact");
  });
});

describe("clamp", () => {
  it("returns value in range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });
  it("clamps to min", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });
  it("clamps to max", () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });
  it("handles equal min and max", () => {
    expect(clamp(5, 3, 3)).toBe(3);
  });
});

describe("formatCurrency", () => {
  it("formats RON by default", () => {
    const result = formatCurrency(100);
    expect(result).toContain("100");
    expect(result.toLowerCase()).toMatch(/ron|lei/);
  });
  it("formats zero", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0");
  });
});

describe("formatNumber", () => {
  it("adds separators for thousands (Romanian locale)", () => {
    const result = formatNumber(1234567);
    // Romanian uses "." as thousands separator
    expect(result.length).toBeGreaterThan(7);
    expect(result).toContain("1");
    expect(result).toContain("234");
  });
});

describe("randomInt", () => {
  it("returns value in range", () => {
    for (let i = 0; i < 100; i++) {
      const result = randomInt(1, 10);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(10);
    }
  });
  it("returns integer", () => {
    const result = randomInt(1, 100);
    expect(Number.isInteger(result)).toBe(true);
  });
});
