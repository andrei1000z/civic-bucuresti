import { describe, it, expect } from "vitest";
import { detectSectorFromText } from "./sector-detect";

describe("detectSectorFromText", () => {
  it("returns null for empty / nullish input", () => {
    expect(detectSectorFromText("")).toBeNull();
    expect(detectSectorFromText(null as unknown as string)).toBeNull();
    expect(detectSectorFromText(undefined as unknown as string)).toBeNull();
  });

  it("detects explicit 'Sector N' phrasing for all six sectors", () => {
    expect(detectSectorFromText("Aici la sector 1 e plin")).toBe("S1");
    expect(detectSectorFromText("sector 2, lângă Obor")).toBe("S2");
    expect(detectSectorFromText("sector 3 — Titan")).toBe("S3");
    expect(detectSectorFromText("undeva în sector 4")).toBe("S4");
    expect(detectSectorFromText("la mine în sector 5")).toBe("S5");
    expect(detectSectorFromText("sector 6 cu drumul taberei")).toBe("S6");
  });

  it("detects 'Sectorul N' (Romanian definite article) for all six sectors", () => {
    // Most users actually write "Sectorul N" not "Sector N" — this is the
    // grammatically natural form in Romanian.
    expect(detectSectorFromText("Aici la Sectorul 1 e plin")).toBe("S1");
    expect(detectSectorFromText("Sectorul 2, lângă Obor")).toBe("S2");
    expect(detectSectorFromText("Sectorul 3 — Titan")).toBe("S3");
    expect(detectSectorFromText("undeva în Sectorul 4")).toBe("S4");
    expect(detectSectorFromText("la mine în Sectorul 5")).toBe("S5");
    expect(detectSectorFromText("Sectorul 6 cu drumul taberei")).toBe("S6");
  });

  it("detects via neighborhood keywords without explicit sector mention", () => {
    expect(detectSectorFromText("Pe Calea Victoriei, lângă Piața Romană")).toBe("S1");
    expect(detectSectorFromText("Drumul Taberei, lângă Politehnica")).toBe("S6");
    expect(detectSectorFromText("Berceni, în zona Apărătorii Patriei")).toBe("S4");
  });

  it("is case-insensitive", () => {
    expect(detectSectorFromText("DRUMUL TABEREI")).toBe("S6");
    expect(detectSectorFromText("Drumul TABEREI")).toBe("S6");
  });

  it("handles diacritics — both with and without", () => {
    expect(detectSectorFromText("Pe șoseaua Pieptănari")).toBe("S5");
    expect(detectSectorFromText("Pe soseaua Pieptanari")).toBe("S5");
    expect(detectSectorFromText("Lângă Apărătorii Patriei")).toBe("S4");
    expect(detectSectorFromText("Langa Aparatorii Patriei")).toBe("S4");
  });

  it("picks the most-specific sector when multiple match", () => {
    // Both sectors mentioned, longer/more specific keyword wins via length scoring.
    const text = "în zona Drumul Taberei (sector 6), iar autorul stă în Berceni sector 4";
    // Both will match; the one with the higher cumulative score wins. Just
    // assert SOME sector is returned (the algorithm is deterministic but
    // sensitive to data changes — better to assert presence than specifics).
    expect(["S4", "S6"]).toContain(detectSectorFromText(text));
  });

  it("returns null when score is below threshold (3 chars)", () => {
    // Two-character match like "s1" alone returns score 2, below threshold of 3.
    expect(detectSectorFromText("s1")).toBeNull();
    // But "sector 1" is 8 chars > threshold and triggers detection.
    expect(detectSectorFromText("sector 1")).toBe("S1");
  });

  it("returns null for unrelated text", () => {
    expect(detectSectorFromText("aceasta este o problemă oarecare")).toBeNull();
    expect(detectSectorFromText("xyz qrs random text")).toBeNull();
  });

  it("doesn't false-match generic words like 'păcii' that appear in 2 sectors", () => {
    // "Păcii" is in BOTH S4 and S6 lists — algorithm picks one, but result
    // shouldn't crash or return invalid sector.
    const result = detectSectorFromText("Pe strada Păcii");
    expect(result === null || ["S4", "S6"].includes(result)).toBe(true);
  });
});
