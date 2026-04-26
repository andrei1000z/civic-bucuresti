import { describe, it, expect } from "vitest";
import { ALL_COUNTIES, getCountyBySlug, getCountyById } from "./counties";

describe("ALL_COUNTIES — data integrity", () => {
  it("includes all 41 counties + B (Bucharest) = 42", () => {
    expect(ALL_COUNTIES).toHaveLength(42);
  });

  it("all county IDs are unique", () => {
    const ids = ALL_COUNTIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all slugs are unique", () => {
    const slugs = ALL_COUNTIES.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("all slugs are lowercase id", () => {
    for (const c of ALL_COUNTIES) {
      expect(c.slug, `${c.id}: slug not lowercase id`).toBe(c.id.toLowerCase());
    }
  });

  it("all centers are within Romania bounding box", () => {
    for (const c of ALL_COUNTIES) {
      const [lat, lng] = c.center;
      expect(lat, `${c.id}: lat out of RO range`).toBeGreaterThanOrEqual(43.5);
      expect(lat, `${c.id}: lat out of RO range`).toBeLessThanOrEqual(48.3);
      expect(lng, `${c.id}: lng out of RO range`).toBeGreaterThanOrEqual(20.2);
      expect(lng, `${c.id}: lng out of RO range`).toBeLessThanOrEqual(29.7);
    }
  });

  it("all populations are positive integers", () => {
    for (const c of ALL_COUNTIES) {
      expect(c.population, `${c.id}: population invalid`).toBeGreaterThan(0);
      expect(Number.isInteger(c.population), `${c.id}: population non-integer`).toBe(true);
    }
  });

  it("Bucharest is the most populous (sanity check on data)", () => {
    const sorted = [...ALL_COUNTIES].sort((a, b) => b.population - a.population);
    expect(sorted[0]?.id).toBe("B");
  });

  it("total population is in 18.5-22M range (RO is ~19M; data source may vary)", () => {
    // RO 2021 census = ~19.05M, but our data uses slightly older county-level
    // estimates that sum to ~18.7M. Wide bounds catch only catastrophic drift
    // (e.g., a county dropped to 0 or jumped to 50M from a typo).
    const total = ALL_COUNTIES.reduce((sum, c) => sum + c.population, 0);
    expect(total).toBeGreaterThan(18_500_000);
    expect(total).toBeLessThan(22_000_000);
  });

  it("all county names use Romanian diacritics (no missing ș/ț/ă/â/î)", () => {
    // Spot check: counties whose names HAVE diacritics use them (no ascii fallback).
    const pairs: [string, string][] = [
      ["BC", "Bacău"],
      ["BR", "Brăila"],
      ["BV", "Brașov"],
      ["BZ", "Buzău"],
      ["IS", "Iași"],
      ["MM", "Maramureș"],
      ["MS", "Mureș"],
      ["BT", "Botoșani"],
      ["VN", "Vrancea"],
    ];
    for (const [id, expected] of pairs) {
      const c = ALL_COUNTIES.find((c) => c.id === id);
      expect(c?.name).toBe(expected);
    }
  });
});

describe("getCountyBySlug", () => {
  it("returns county for valid slug", () => {
    const c = getCountyBySlug("cj");
    expect(c?.id).toBe("CJ");
    expect(c?.name).toBe("Cluj");
  });

  it("is case-insensitive", () => {
    expect(getCountyBySlug("CJ")?.id).toBe("CJ");
    expect(getCountyBySlug("Cj")?.id).toBe("CJ");
  });

  it("returns undefined for unknown slug", () => {
    expect(getCountyBySlug("xx")).toBeUndefined();
    expect(getCountyBySlug("")).toBeUndefined();
  });
});

describe("getCountyById", () => {
  it("returns county for valid id", () => {
    expect(getCountyById("B")?.name).toBe("București");
    expect(getCountyById("CJ")?.name).toBe("Cluj");
  });

  it("is case-insensitive", () => {
    expect(getCountyById("b")?.id).toBe("B");
    expect(getCountyById("cj")?.id).toBe("CJ");
  });

  it("returns undefined for unknown id", () => {
    expect(getCountyById("ZZ")).toBeUndefined();
    expect(getCountyById("")).toBeUndefined();
  });
});
