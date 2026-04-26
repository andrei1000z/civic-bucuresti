import { describe, it, expect } from "vitest";
import { aqiFromPm25, aqiFromPm10, calculateAqi } from "./aqi-calculator";

describe("aqiFromPm25 (US EPA breakpoints)", () => {
  it("returns 0 at the lowest concentration", () => {
    expect(aqiFromPm25(0)).toBe(0);
  });

  it("12 µg/m³ → 50 (top of Good range)", () => {
    expect(aqiFromPm25(12)).toBe(50);
  });

  it("35.4 µg/m³ → 100 (top of Moderate range)", () => {
    expect(aqiFromPm25(35.4)).toBe(100);
  });

  it("55.4 µg/m³ → 150 (top of Unhealthy for Sensitive)", () => {
    expect(aqiFromPm25(55.4)).toBe(150);
  });

  it("returns 500 above the max breakpoint (clamps to ceiling)", () => {
    expect(aqiFromPm25(700)).toBe(500);
    expect(aqiFromPm25(500)).toBe(500);
  });

  it("interpolates linearly within a band", () => {
    // 24.05 µg is the midpoint of 12.1-35.4 range, mapped to 51-100.
    // Expected ~75.5 → rounded.
    const result = aqiFromPm25(24.05);
    expect(result).toBeGreaterThanOrEqual(74);
    expect(result).toBeLessThanOrEqual(76);
  });
});

describe("aqiFromPm10 (US EPA breakpoints)", () => {
  it("returns 0 at zero concentration", () => {
    expect(aqiFromPm10(0)).toBe(0);
  });

  it("54 µg/m³ → 50 (top of Good range)", () => {
    expect(aqiFromPm10(54)).toBe(50);
  });

  it("154 µg/m³ → 100 (top of Moderate)", () => {
    expect(aqiFromPm10(154)).toBe(100);
  });

  it("clamps to 500 above max breakpoint", () => {
    expect(aqiFromPm10(1000)).toBe(500);
  });

  it("interpolates linearly within a band", () => {
    // 27 µg is the midpoint of 0-54, mapped to 0-50.
    const result = aqiFromPm10(27);
    expect(result).toBeGreaterThanOrEqual(24);
    expect(result).toBeLessThanOrEqual(26);
  });
});

describe("calculateAqi (worst-of-all-pollutants)", () => {
  it("returns null when no pollutant data provided", () => {
    expect(calculateAqi({})).toBeNull();
    expect(calculateAqi({ pm25: null, pm10: null })).toBeNull();
  });

  it("returns the higher AQI when both pollutants are present", () => {
    // pm25=20 → ~67 AQI; pm10=200 → ~125 AQI; expect 125.
    const r = calculateAqi({ pm25: 20, pm10: 200 });
    expect(r).toBeGreaterThanOrEqual(120);
    expect(r).toBeLessThanOrEqual(130);
  });

  it("falls back to single pollutant when only one is provided", () => {
    expect(calculateAqi({ pm25: 12 })).toBe(50);
    expect(calculateAqi({ pm10: 54 })).toBe(50);
  });

  it("ignores negative concentrations (sensor error)", () => {
    // pm25 invalid, pm10 valid → result derived only from pm10.
    expect(calculateAqi({ pm25: -1, pm10: 54 })).toBe(50);
    // both invalid → null
    expect(calculateAqi({ pm25: -5, pm10: -10 })).toBeNull();
  });

  it("handles zero values without returning null", () => {
    // 0 is valid (clean air), null/undefined is missing data.
    expect(calculateAqi({ pm25: 0, pm10: 0 })).toBe(0);
  });
});
