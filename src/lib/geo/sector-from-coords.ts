/**
 * Detect București sector from coordinates (approximate but precise-enough).
 * Returns null if point is outside Bucharest city limits.
 *
 * Bucharest sectors are wedges radiating from the center (Piața Unirii).
 * We use angle-from-center + distance-from-center classification.
 * Center: ~44.4268, 26.1025 (Piața Unirii).
 */

type Sector = "S1" | "S2" | "S3" | "S4" | "S5" | "S6";

const CENTER_LAT = 44.4268;
const CENTER_LNG = 26.1025;

// Rough Bucharest city limits bounding box
const BUCHAREST_BBOX = {
  minLat: 44.33,
  maxLat: 44.55,
  minLng: 25.97,
  maxLng: 26.25,
};

/**
 * Bucharest sectors by angle from center (clockwise from North):
 *  - S1: North (315° - 45°)
 *  - S2: North-East (45° - 100°)
 *  - S3: East / South-East (100° - 170°)
 *  - S4: South (170° - 235°)
 *  - S5: South-West (235° - 285°)
 *  - S6: West / North-West (285° - 315°)
 *
 * Angle convention: 0° = North, 90° = East, 180° = South, 270° = West.
 */
function angleFromCenter(lat: number, lng: number): number {
  const dLat = lat - CENTER_LAT;
  const dLng = lng - CENTER_LNG;
  // atan2 with (dLng, dLat) returns angle where 0 = North, clockwise-positive
  const rad = Math.atan2(dLng, dLat);
  let deg = (rad * 180) / Math.PI;
  if (deg < 0) deg += 360;
  return deg;
}

export function detectSectorFromCoords(lat: number, lng: number): Sector | null {
  // Check if point is inside Bucharest bbox
  if (
    lat < BUCHAREST_BBOX.minLat ||
    lat > BUCHAREST_BBOX.maxLat ||
    lng < BUCHAREST_BBOX.minLng ||
    lng > BUCHAREST_BBOX.maxLng
  ) {
    return null;
  }

  const angle = angleFromCenter(lat, lng);

  // Special case for center (very small distance)
  const dLat = lat - CENTER_LAT;
  const dLng = lng - CENTER_LNG;
  if (Math.abs(dLat) < 0.001 && Math.abs(dLng) < 0.001) {
    return "S3"; // centrul istoric e sector 3
  }

  // Classify by angle (clockwise from North)
  if (angle >= 315 || angle < 45) return "S1";   // North
  if (angle >= 45 && angle < 100) return "S2";   // North-East
  if (angle >= 100 && angle < 170) return "S3";  // East / South-East
  if (angle >= 170 && angle < 235) return "S4";  // South
  if (angle >= 235 && angle < 285) return "S5";  // South-West
  if (angle >= 285 && angle < 315) return "S6";  // West / North-West

  return null; // unreachable
}

/**
 * Label helper
 */
export function sectorLabel(s: Sector | null): string {
  if (!s) return "În afara Bucureștiului";
  return `Sector ${s.slice(1)}`;
}
