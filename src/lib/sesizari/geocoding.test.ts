import { describe, it, expect } from "vitest";
import { extractGeocodeQueries } from "./geocoding";

describe("extractGeocodeQueries", () => {
  it("pulls 'Calea X' from a verbose sesizare text and adds București when sector is mentioned", () => {
    const text =
      "Pe trotuarul aferent arterei Calea 13 Septembrie, mai exact pe segmentul cuprins între intersecția cu Șoseaua Panduri și intersecția cu Strada Mihail Cioranu (pe partea cu sucursalele BRD). Sectorul 5.";
    const out = extractGeocodeQueries(text);
    expect(out).toEqual(expect.arrayContaining([
      expect.stringMatching(/^Calea 13 Septembrie, București, România$/),
      expect.stringMatching(/^Șoseaua Panduri, București, România$/),
    ]));
    // City-only fallback is always appended last
    expect(out[out.length - 1]).toBe("București, România");
  });

  it("uses the explicit county hint when no sector is in the text", () => {
    const text = "Bulevardul Eroilor 12";
    const out = extractGeocodeQueries(text, "Cluj");
    expect(out[0]).toMatch(/Bulevardul Eroilor 12, Cluj, România/);
  });

  it("handles Str. abbreviation + street number", () => {
    const text = "Str. Florilor nr. 44";
    const out = extractGeocodeQueries(text, "Cluj");
    expect(out[0]).toMatch(/Str\. Florilor 44, Cluj, România/);
  });

  it("returns empty when text has no street prefix and no county hint", () => {
    const out = extractGeocodeQueries("Undeva pe lângă parc.");
    expect(out).toEqual([]);
  });

  it("ignores ALL-CAPS sesizare titles and still extracts street", () => {
    const text = "SA ELIBEREZE. Calea Victoriei 120, București";
    const out = extractGeocodeQueries(text);
    expect(out.some((q) => q.startsWith("Calea Victoriei"))).toBe(true);
  });

  it("de-duplicates repeated street mentions", () => {
    const text = "Calea Victoriei, la capătul cu Calea Victoriei, în București.";
    const out = extractGeocodeQueries(text);
    const victorias = out.filter((q) => q.toLowerCase().includes("calea victoriei"));
    expect(victorias.length).toBe(1);
  });
});
