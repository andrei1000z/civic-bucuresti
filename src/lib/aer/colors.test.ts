import { describe, it, expect } from "vitest";
import { getAqiLevel, getAqiColor, AQI_LEVELS } from "./colors";

describe("getAqiLevel", () => {
  it("returns Bun for null/undefined/negative AQI (no data fallback)", () => {
    expect(getAqiLevel(null).label).toBe("Bun");
    expect(getAqiLevel(-1).label).toBe("Bun");
  });

  it("returns Bun for AQI 0-50", () => {
    expect(getAqiLevel(0).label).toBe("Bun");
    expect(getAqiLevel(25).label).toBe("Bun");
    expect(getAqiLevel(50).label).toBe("Bun");
  });

  it("returns Moderat for 51-100", () => {
    expect(getAqiLevel(51).label).toBe("Moderat");
    expect(getAqiLevel(100).label).toBe("Moderat");
  });

  it("returns 'Nesănătos pt. sensibili' for 101-150", () => {
    expect(getAqiLevel(125).label).toBe("Nesănătos pt. sensibili");
  });

  it("returns Nesănătos for 151-200", () => {
    expect(getAqiLevel(175).label).toBe("Nesănătos");
  });

  it("returns 'Foarte nesănătos' for 201-300", () => {
    expect(getAqiLevel(250).label).toBe("Foarte nesănătos");
  });

  it("returns Periculos for 301-500", () => {
    expect(getAqiLevel(400).label).toBe("Periculos");
    expect(getAqiLevel(500).label).toBe("Periculos");
  });

  it("clamps to Periculos above 500 (sensor over-reports shouldn't crash)", () => {
    expect(getAqiLevel(9999).label).toBe("Periculos");
  });

  it("is exclusive at upper boundary (51 != Bun)", () => {
    expect(getAqiLevel(50).label).toBe("Bun");
    expect(getAqiLevel(51).label).toBe("Moderat");
  });
});

describe("getAqiColor", () => {
  it("returns hex color matching the level", () => {
    expect(getAqiColor(25)).toBe("#00E400"); // green
    expect(getAqiColor(75)).toBe("#FFFF00"); // yellow
    expect(getAqiColor(175)).toBe("#FF0000"); // red
  });

  it("returns Bun color for null", () => {
    expect(getAqiColor(null)).toBe("#00E400");
  });
});

describe("AQI_LEVELS data integrity", () => {
  it("levels are contiguous (no gaps in coverage)", () => {
    for (let i = 1; i < AQI_LEVELS.length; i++) {
      const prev = AQI_LEVELS[i - 1];
      const cur = AQI_LEVELS[i];
      if (!prev || !cur) continue;
      expect(cur.min).toBe(prev.max + 1);
    }
  });

  it("first level starts at 0", () => {
    expect(AQI_LEVELS[0]?.min).toBe(0);
  });

  it("last level extends to 500 (US EPA max)", () => {
    expect(AQI_LEVELS[AQI_LEVELS.length - 1]?.max).toBe(500);
  });

  it("all levels have non-empty label, color, bg, emoji", () => {
    for (const lvl of AQI_LEVELS) {
      expect(lvl.label.length).toBeGreaterThan(0);
      expect(lvl.color).toMatch(/^#[0-9A-F]{6}$/i);
      expect(lvl.bg).toMatch(/^bg-/);
      expect(lvl.emoji.length).toBeGreaterThan(0);
    }
  });
});
