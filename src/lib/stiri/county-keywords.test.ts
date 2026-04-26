import { describe, it, expect } from "vitest";
import { detectCounties, COUNTY_KEYWORDS } from "./county-keywords";

describe("detectCounties — RSS article → county tagging", () => {
  it("detects București from explicit name", () => {
    expect(detectCounties("PMB anunță buget nou pentru Capitală")).toContain("B");
    expect(detectCounties("Trafic blocat pe Splaiul Unirii în București")).toContain("B");
  });

  it("detects București from sector mentions alone", () => {
    expect(detectCounties("Sector 3 anunță reabilitări pe Theodor Pallady")).toContain("B");
  });

  it("detects Cluj from city + Hungarian name", () => {
    expect(detectCounties("Emil Boc inaugurează tramvai nou la Cluj-Napoca")).toContain("CJ");
    // Hungarian/historical Kolozsvár also tagged
    expect(detectCounties("Article in Kolozsvár local press")).toContain("CJ");
  });

  it("detects multiple counties when an article spans regions", () => {
    const text = "Drum modernizat pe ruta Cluj — Brașov — București trece prin Sibiu";
    const r = detectCounties(text);
    expect(r).toEqual(expect.arrayContaining(["CJ", "BV", "B", "SB"]));
  });

  it("returns empty array when no county is mentioned", () => {
    expect(detectCounties("Generic news without any place reference")).toEqual([]);
  });

  it("is case-insensitive", () => {
    expect(detectCounties("PLOIEȘTI - traficul reluat")).toContain("PH");
    expect(detectCounties("Ploiești - traficul reluat")).toContain("PH");
    expect(detectCounties("ploiești - traficul reluat")).toContain("PH");
  });

  it("detects Iași from both diacritic and ascii forms", () => {
    expect(detectCounties("Mihai Chirica anunță bugetul Iași")).toContain("IS");
    expect(detectCounties("Anunț din Iasi pe seama traficului")).toContain("IS");
  });

  it("detects Mehedinți capital (Drobeta)", () => {
    expect(detectCounties("Stație nouă în Drobeta-Turnu Severin")).toContain("MH");
  });
});

describe("COUNTY_KEYWORDS — data integrity", () => {
  it("covers all 41 counties + B (Bucharest)", () => {
    expect(Object.keys(COUNTY_KEYWORDS).length).toBeGreaterThanOrEqual(42);
  });

  it("each county has at least one keyword", () => {
    for (const [id, kws] of Object.entries(COUNTY_KEYWORDS)) {
      expect(kws.length, `${id} has no keywords`).toBeGreaterThan(0);
    }
  });

  it("all keywords are non-empty strings", () => {
    for (const [id, kws] of Object.entries(COUNTY_KEYWORDS)) {
      for (const kw of kws) {
        expect(typeof kw, `${id} has non-string keyword`).toBe("string");
        expect(kw.length, `${id} has empty keyword`).toBeGreaterThan(0);
      }
    }
  });

  it("București includes all 6 sector forms", () => {
    const b = COUNTY_KEYWORDS.B;
    expect(b).toBeDefined();
    if (!b) return;
    for (let i = 1; i <= 6; i++) {
      expect(b).toContain(`sector ${i}`);
    }
  });
});
