import { describe, it, expect } from "vitest";
import { ghiduri } from "./ghiduri";

describe("ghiduri — data integrity", () => {
  it("has at least 10 ghiduri", () => {
    expect(ghiduri.length).toBeGreaterThanOrEqual(10);
  });

  it("all ghiduri have required fields", () => {
    for (const g of ghiduri) {
      expect(g.id, `${g.slug ?? "?"}: id missing`).toBeTruthy();
      expect(g.slug, `${g.id}: slug missing`).toBeTruthy();
      expect(g.titlu, `${g.id}: titlu missing`).toBeTruthy();
      expect(g.descriere, `${g.id}: descriere missing`).toBeTruthy();
      expect(g.icon, `${g.id}: icon missing`).toBeTruthy();
      expect(g.gradient, `${g.id}: gradient missing`).toBeTruthy();
    }
  });

  it("all IDs are unique", () => {
    const ids = ghiduri.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all slugs are unique", () => {
    const slugs = ghiduri.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("all slugs are kebab-case (lowercase + dash only)", () => {
    for (const g of ghiduri) {
      expect(g.slug, `${g.id}: slug not kebab-case`).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("all slugs start with 'ghid-' prefix (route convention)", () => {
    for (const g of ghiduri) {
      expect(g.slug, `${g.id}: slug missing 'ghid-' prefix`).toMatch(/^ghid-/);
    }
  });

  it("dificultate values are from the valid enum", () => {
    const valid = ["usor", "mediu", "greu"];
    for (const g of ghiduri) {
      if (g.dificultate != null) {
        expect(valid, `${g.id}: dificultate "${g.dificultate}" invalid`).toContain(g.dificultate);
      }
    }
  });

  it("capitole are positive integers", () => {
    for (const g of ghiduri) {
      if (g.capitole != null) {
        expect(g.capitole, `${g.id}: capitole non-positive`).toBeGreaterThan(0);
        expect(Number.isInteger(g.capitole)).toBe(true);
      }
    }
  });

  it("timpCitire is in reasonable range (5-90 min)", () => {
    for (const g of ghiduri) {
      if (g.timpCitire != null) {
        expect(g.timpCitire, `${g.id}: timpCitire ${g.timpCitire} suspect`).toBeGreaterThan(4);
        expect(g.timpCitire, `${g.id}: timpCitire ${g.timpCitire} suspect`).toBeLessThanOrEqual(90);
      }
    }
  });

  it("titles are non-trivial (>10 chars) — guard against typos", () => {
    for (const g of ghiduri) {
      expect(g.titlu.length, `${g.id}: titlu prea scurt`).toBeGreaterThan(10);
    }
  });

  it("descriptions are descriptive (>30 chars)", () => {
    for (const g of ghiduri) {
      expect(g.descriere.length, `${g.id}: descriere prea scurtă`).toBeGreaterThan(30);
    }
  });
});
