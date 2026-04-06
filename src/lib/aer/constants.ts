// Romania bounding box for API queries
export const RO_BOUNDS = {
  south: 43.5,
  north: 48.3,
  west: 20.2,
  east: 30.0,
};

export const RO_CENTER: [number, number] = [45.9432, 24.9668];
export const DEFAULT_ZOOM = 7;

// Refresh interval (ms)
export const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Cache duration (seconds)
export const CACHE_SECONDS = 300; // 5 minutes

// Deduplication radius (meters)
export const DEDUP_RADIUS_M = 50;

// IDW parameters
export const IDW_POWER = 2;
export const IDW_MAX_RADIUS_KM = 50;
