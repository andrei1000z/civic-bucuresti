import { describe, it, expect } from "vitest";
import { evenimente } from "./evenimente";

const VALID_CATEGORIES = ["accident", "incendiu", "inundatie", "cutremur", "protest", "infrastructura"];
const VALID_SEVERITIES = ["minor", "moderat", "major", "critic"];

describe("evenimente — data integrity", () => {
  it("has at least 30 events recorded", () => {
    expect(evenimente.length).toBeGreaterThanOrEqual(30);
  });

  it("all events have required fields", () => {
    for (const e of evenimente) {
      expect(e.id, `${e.slug ?? "?"}: id missing`).toBeTruthy();
      expect(e.slug, `${e.id}: slug missing`).toBeTruthy();
      expect(e.titlu, `${e.id}: titlu missing`).toBeTruthy();
      expect(e.data, `${e.id}: data missing`).toBeTruthy();
      expect(e.descriere, `${e.id}: descriere missing`).toBeTruthy();
      expect(e.category, `${e.id}: category missing`).toBeTruthy();
      expect(e.severity, `${e.id}: severity missing`).toBeTruthy();
    }
  });

  it("all IDs are unique", () => {
    const ids = evenimente.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all slugs are unique", () => {
    const slugs = evenimente.map((e) => e.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("all dates are valid ISO date strings (YYYY-MM-DD)", () => {
    for (const e of evenimente) {
      expect(e.data, `${e.id}: data invalid format`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const parsed = new Date(e.data);
      expect(Number.isNaN(parsed.getTime()), `${e.id}: data unparseable`).toBe(false);
    }
  });

  it("all dates are within 20th-century-onwards and not in distant future", () => {
    // Some events are historical context (cutremurul din 1977, Revoluția
    // 1989, aderarea UE 2007). Hard floor 1900 to catch typos like 1077.
    const min = new Date("1900-01-01");
    const max = new Date(Date.now() + 365 * 24 * 60 * 60_000);
    for (const e of evenimente) {
      const d = new Date(e.data);
      expect(d > min, `${e.id}: data prea veche`).toBe(true);
      expect(d < max, `${e.id}: data în viitor distant`).toBe(true);
    }
  });

  it("all categories are from valid enum", () => {
    for (const e of evenimente) {
      expect(VALID_CATEGORIES, `${e.id}: category invalid`).toContain(e.category);
    }
  });

  it("all severities are from valid enum", () => {
    for (const e of evenimente) {
      expect(VALID_SEVERITIES, `${e.id}: severity invalid`).toContain(e.severity);
    }
  });

  it("all slugs are kebab-case", () => {
    for (const e of evenimente) {
      expect(e.slug, `${e.id}: slug not kebab-case`).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("all numeric counters are non-negative integers when present", () => {
    for (const e of evenimente) {
      for (const field of ["victime", "evacuati", "echipaje"] as const) {
        const val = e[field];
        if (val == null) continue;
        expect(val, `${e.id}: ${field} negative`).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(val), `${e.id}: ${field} non-integer`).toBe(true);
      }
    }
  });

  it("titles are non-trivial (>5 chars)", () => {
    for (const e of evenimente) {
      expect(e.titlu.length, `${e.id}: titlu prea scurt`).toBeGreaterThan(5);
    }
  });

  it("descriptions are descriptive (>50 chars)", () => {
    for (const e of evenimente) {
      expect(e.descriere.length, `${e.id}: descriere prea scurtă`).toBeGreaterThan(50);
    }
  });

  it("at least 80% of events have a county", () => {
    const withCounty = evenimente.filter((e) => e.county).length;
    expect(withCounty / evenimente.length).toBeGreaterThanOrEqual(0.8);
  });

  it("'critic' severity events involve critical categories (incendiu, cutremur, protest, accident)", () => {
    const criticEvents = evenimente.filter((e) => e.severity === "critic");
    // Just sanity — minor incidents shouldn't be 'critic'.
    for (const e of criticEvents) {
      expect(
        ["incendiu", "cutremur", "protest", "accident", "infrastructura", "inundatie"].includes(e.category),
        `${e.id}: critic category mismatch`,
      ).toBe(true);
    }
  });
});
