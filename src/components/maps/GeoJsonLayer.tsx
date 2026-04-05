"use client";

import { useEffect, useState } from "react";
import { GeoJSON } from "react-leaflet";
import type { PathOptions, LeafletMouseEvent, Layer } from "leaflet";
import type { Feature, GeoJsonObject } from "geojson";

interface GeoJsonLayerProps {
  url: string;
  style?: PathOptions | ((feature?: Feature) => PathOptions);
  onFeatureClick?: (feature: Feature) => void;
  popupFormatter?: (feature: Feature) => string;
  pointToLayer?: (feature: Feature, latlng: [number, number]) => Layer;
}

export function GeoJsonLayer({
  url,
  style,
  onFeatureClick,
  popupFormatter,
}: GeoJsonLayerProps) {
  const [data, setData] = useState<GeoJsonObject | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(url)
      .then((r) => r.json())
      .then((j: GeoJsonObject) => {
        if (!cancelled) setData(j);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      });
    return () => { cancelled = true; };
  }, [url]);

  if (!data) return null;

  return (
    <GeoJSON
      data={data}
      style={style as PathOptions}
      onEachFeature={(feature, layer) => {
        if (popupFormatter) {
          layer.bindPopup(popupFormatter(feature));
        }
        if (onFeatureClick) {
          layer.on("click", (e: LeafletMouseEvent) => {
            e.originalEvent?.stopPropagation?.();
            onFeatureClick(feature);
          });
        }
      }}
    />
  );
}
