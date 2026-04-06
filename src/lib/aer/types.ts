export interface UnifiedSensor {
  id: string;
  source: "sensor-community" | "openaq" | "uradmonitor" | "waqi" | "purpleair";
  lat: number;
  lng: number;
  aqi: number | null;
  pm25: number | null;
  pm10: number | null;
  pm1: number | null;
  no2: number | null;
  so2: number | null;
  o3: number | null;
  co: number | null;
  temperature: number | null;
  humidity: number | null;
  pressure: number | null;
  noise: number | null;
  updatedAt: string;
  stationName: string | null;
  sensorType: string | null;
  isOfficial: boolean;
}

export interface AirDataResponse {
  sensors: UnifiedSensor[];
  meta: {
    total: number;
    bySource: Record<string, number>;
    avgAqi: number | null;
    lastUpdate: string;
  };
}

export interface AqiBreakpoint {
  cLow: number;
  cHigh: number;
  aqiLow: number;
  aqiHigh: number;
}
