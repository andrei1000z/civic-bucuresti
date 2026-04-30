// Romania bounding box for API queries
export const RO_BOUNDS = {
  south: 43.5,
  north: 48.3,
  west: 20.2,
  east: 30.0,
};

export const RO_CENTER: [number, number] = [45.9432, 24.9668];
export const DEFAULT_ZOOM = 7;

// Refresh interval (ms) — 1 minute. Mirrors Sensor.Community's own
// reporting cadence. The map only polls while the tab is visible
// (visibilitychange listener), so a pinned background tab doesn't
// burn battery / mobile data.
export const REFRESH_INTERVAL = 60 * 1000;

// Cache duration (seconds)
export const CACHE_SECONDS = 60;

// Deduplication radius (meters). 25m strikes a balance between „two
// sensors mounted on opposite walls of the same building should
// collapse" (official stations) and „two private rooftops 40m apart
// in a dense neighborhood should both show" (citizen network). At
// 50m we were silently dropping ~10–15% of legitimately distinct
// sensors in dense Bucharest sectors.
export const DEDUP_RADIUS_M = 25;

// IDW parameters
export const IDW_POWER = 2;
export const IDW_MAX_RADIUS_KM = 50;
