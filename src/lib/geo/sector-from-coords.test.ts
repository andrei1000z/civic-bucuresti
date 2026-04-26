import { describe, it, expect } from "vitest";
import { detectSectorFromCoords, sectorLabel } from "./sector-from-coords";

describe("detectSectorFromCoords", () => {
  it("returns null for points outside Bucharest bbox", () => {
    // Cluj-Napoca
    expect(detectSectorFromCoords(46.77, 23.6)).toBeNull();
    // Marea Neagră (Constanța)
    expect(detectSectorFromCoords(44.18, 28.65)).toBeNull();
    // Timișoara
    expect(detectSectorFromCoords(45.75, 21.22)).toBeNull();
  });

  it("returns null just outside the bbox (boundary)", () => {
    // 0.01° below south boundary (44.33)
    expect(detectSectorFromCoords(44.32, 26.1)).toBeNull();
    // 0.01° above north boundary (44.55)
    expect(detectSectorFromCoords(44.56, 26.1)).toBeNull();
  });

  it("returns S3 at the very center (Piața Unirii)", () => {
    // Centrul istoric e mapat tradițional la S3
    expect(detectSectorFromCoords(44.4268, 26.1025)).toBe("S3");
  });

  // Coordinates picked geometrically (not by real-world landmark) to land
  // squarely inside each sector's angular wedge from center 44.4268, 26.1025.
  // The algorithm's wedge boundaries don't exactly match real city sector
  // borders, so testing against landmark coords is fragile.
  it("S1 for clear North wedge (angle ≈ 0°)", () => {
    expect(detectSectorFromCoords(44.5, 26.1025)).toBe("S1");
  });

  it("S2 for North-East wedge (angle ≈ 70°)", () => {
    // dLat=+0.02, dLng=+0.05 → angle ≈ atan2(0.05, 0.02) ≈ 68°
    expect(detectSectorFromCoords(44.4468, 26.1525)).toBe("S2");
  });

  it("S3 for East/South-East wedge (angle ≈ 135°)", () => {
    // dLat=-0.04, dLng=+0.04 → angle ≈ atan2(0.04, -0.04) ≈ 135°
    expect(detectSectorFromCoords(44.3868, 26.1425)).toBe("S3");
  });

  it("S4 for South wedge (angle ≈ 195°)", () => {
    // dLat=-0.04, dLng=-0.01 → angle ≈ atan2(-0.01, -0.04) ≈ 194°
    expect(detectSectorFromCoords(44.3868, 26.0925)).toBe("S4");
  });

  it("S5 for South-West wedge (angle ≈ 260°)", () => {
    // dLat=-0.01, dLng=-0.05 → angle ≈ atan2(-0.05, -0.01) ≈ 259°
    expect(detectSectorFromCoords(44.4168, 26.0525)).toBe("S5");
  });

  it("S6 for West/North-West wedge (angle ≈ 300°)", () => {
    // dLat=+0.02, dLng=-0.04 → angle ≈ atan2(-0.04, 0.02) ≈ 297°
    expect(detectSectorFromCoords(44.4468, 26.0625)).toBe("S6");
  });

  it("never returns null for points inside the bbox (full angular coverage)", () => {
    // Sample many points inside bbox; every one should produce a sector.
    for (let lat = 44.34; lat <= 44.54; lat += 0.05) {
      for (let lng = 25.98; lng <= 26.24; lng += 0.05) {
        const r = detectSectorFromCoords(lat, lng);
        expect(r, `(${lat}, ${lng})`).not.toBeNull();
      }
    }
  });
});

describe("sectorLabel", () => {
  it("formats S1-S6 as 'Sector N'", () => {
    expect(sectorLabel("S1")).toBe("Sector 1");
    expect(sectorLabel("S6")).toBe("Sector 6");
  });

  it("returns 'În afara Bucureștiului' for null", () => {
    expect(sectorLabel(null)).toBe("În afara Bucureștiului");
  });
});
