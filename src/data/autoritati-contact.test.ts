import { describe, it, expect } from "vitest";
import {
  PREFECTURI,
  POLITIE,
  PRIMARII,
  POLITIA_LOCALA_JUDET,
  ORASE_IMPORTANTE,
  findCityContact,
  hasAuthorityData,
  hasPolitiaLocala,
  getCityCount,
  getPolitiaLocalaCount,
  getCitiesByCounty,
} from "./autoritati-contact";

describe("autoritati-contact — structural integrity", () => {
  it("has 42 counties in PREFECTURI (41 + București)", () => {
    expect(Object.keys(PREFECTURI).length).toBe(42);
  });

  it("has 42 counties in POLITIE", () => {
    expect(Object.keys(POLITIE).length).toBe(42);
  });

  it("has 42 counties in PRIMARII", () => {
    expect(Object.keys(PRIMARII).length).toBe(42);
  });

  it("has 42 counties in POLITIA_LOCALA_JUDET", () => {
    expect(Object.keys(POLITIA_LOCALA_JUDET).length).toBe(42);
  });

  it("PRIMARII entries either have a valid email OR fallback (phone + website)", () => {
    // Email e best-effort — multe primării n-au email public verificat.
    // MX-ul e validat prin scripts/verify-emails.ts; aici doar verificăm
    // că entries fără email au fallback (cetățeanul are unde să sune).
    for (const [code, entry] of Object.entries(PRIMARII)) {
      if (entry.email) {
        // No placeholder patterns
        expect(entry.email).not.toMatch(/pfre(cluj|ilfov)/i);
        expect(entry.email).not.toMatch(/pfri(a|mi)/i);
        expect(entry.email).not.toMatch(/primariafcsani/i);
        expect(entry.email).not.toMatch(/primarimara/i);
        expect(entry.email).not.toMatch(/tifrugmures/i);
      } else {
        // No email → must have phone or website fallback
        const hasFallback = !!(entry.phone || entry.website);
        expect(hasFallback, `${code} has no email AND no phone/website fallback`).toBe(true);
      }
    }
  });

  it("all POLITIA_LOCALA_JUDET entries have a phone", () => {
    for (const [code, entry] of Object.entries(POLITIA_LOCALA_JUDET)) {
      expect(entry.phone, `${code} missing phone`).toBeDefined();
    }
  });

  it("ORASE_IMPORTANTE — every city references a valid county code", () => {
    const validCounties = new Set(Object.keys(PREFECTURI));
    for (const [slug, city] of Object.entries(ORASE_IMPORTANTE)) {
      expect(
        validCounties.has(city.countyCode),
        `${slug} references invalid county ${city.countyCode}`,
      ).toBe(true);
    }
  });

  it("ORASE_IMPORTANTE has at least 150 cities (major expansion in 2026-04)", () => {
    expect(Object.keys(ORASE_IMPORTANTE).length).toBeGreaterThanOrEqual(150);
  });

  it("ORASE_IMPORTANTE — slugs are ASCII-only lowercase with hyphens", () => {
    for (const slug of Object.keys(ORASE_IMPORTANTE)) {
      expect(slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("ORASE_IMPORTANTE — no duplicate slugs or name clashes per county", () => {
    const seenByCounty = new Map<string, Set<string>>();
    for (const city of Object.values(ORASE_IMPORTANTE)) {
      const byCounty = seenByCounty.get(city.countyCode) ?? new Set<string>();
      const normalized = city.name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
      expect(
        byCounty.has(normalized),
        `duplicate city name "${city.name}" in county ${city.countyCode}`,
      ).toBe(false);
      byCounty.add(normalized);
      seenByCounty.set(city.countyCode, byCounty);
    }
  });

  it("ORASE_IMPORTANTE — all phones follow Romanian landline format", () => {
    for (const [slug, city] of Object.entries(ORASE_IMPORTANTE)) {
      if (city.phone) {
        // Accept: 0256-... or 0256-123-456 or 031-... etc.
        expect(
          /^0[0-9]{2,3}-[0-9]{3}-?[0-9]*$/.test(city.phone),
          `${slug} phone "${city.phone}" doesn't match 0XXX-XXX-XXX pattern`,
        ).toBe(true);
      }
    }
  });
});

describe("findCityContact", () => {
  it("matches a city by its name in free-text location", () => {
    const result = findCityContact("Str. Avram Iancu 10, Turda, jud. Cluj");
    expect(result?.slug).toBe("turda");
    expect(result?.city.countyCode).toBe("CJ");
  });

  it("matches case-insensitively + handles diacritics", () => {
    const result = findCityContact("B-dul Dacia, MIOVENI");
    expect(result?.slug).toBe("mioveni");
  });

  it("returns null when no city match found", () => {
    const result = findCityContact("Satul Cucui, comuna Plopu");
    expect(result).toBeNull();
  });

  it("respects countyHint to avoid false positives", () => {
    // "Roman" could be ambiguous; hint narrows to the Neamț city
    const result = findCityContact("Str. Ștefan cel Mare, Roman", "NT");
    expect(result?.slug).toBe("roman");
    expect(result?.city.countyCode).toBe("NT");
  });

  it("skips cities from other counties when hint is set", () => {
    // Searching "Mioveni" with CJ hint should skip the AG Mioveni
    const result = findCityContact("Mioveni", "CJ");
    expect(result).toBeNull();
  });
});

describe("helper predicates + counts", () => {
  it("hasAuthorityData returns true for valid county", () => {
    expect(hasAuthorityData("CJ")).toBe(true);
    expect(hasAuthorityData("XX")).toBe(false);
  });

  it("hasPolitiaLocala returns true for valid county", () => {
    expect(hasPolitiaLocala("TM")).toBe(true);
    expect(hasPolitiaLocala("XX")).toBe(false);
  });

  it("getCityCount matches ORASE_IMPORTANTE length", () => {
    expect(getCityCount()).toBe(Object.keys(ORASE_IMPORTANTE).length);
  });

  it("getPolitiaLocalaCount matches POLITIA_LOCALA_JUDET length", () => {
    expect(getPolitiaLocalaCount()).toBe(Object.keys(POLITIA_LOCALA_JUDET).length);
  });

  it("getCitiesByCounty groups + sorts alphabetically per county", () => {
    const grouped = getCitiesByCounty();
    // CJ should have multiple cities (Turda, Dej, Câmpia Turzii)
    const cj = grouped["CJ"];
    expect(cj).toBeDefined();
    expect(cj!.length).toBeGreaterThanOrEqual(3);
    // Sorted alphabetically (Câmpia Turzii < Dej < Turda in Romanian)
    const names = cj!.map((c) => c.name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b, "ro"));
    expect(names).toEqual(sorted);
  });
});
