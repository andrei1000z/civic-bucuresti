"use client";

import { useEffect, useState, useRef } from "react";
import { GeoJSON } from "react-leaflet";
import type { PathOptions, LeafletMouseEvent, Layer } from "leaflet";
import type { Feature, GeoJsonObject } from "geojson";

// Module-level cache — avoids re-fetching when user switches tabs and returns.
const dataCache = new Map<string, GeoJsonObject>();

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
  const [data, setData] = useState<GeoJsonObject | null>(() => dataCache.get(url) ?? null);
  const urlRef = useRef(url);

  useEffect(() => {
    urlRef.current = url;
    const cached = dataCache.get(url);
    if (cached) {
      setData(cached);
      return;
    }

    // Clear stale data immediately when URL changes (prevents ghost layers)
    setData(null);

    const ctrl = new AbortController();
    fetch(url, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((j: GeoJsonObject) => {
        dataCache.set(url, j);
        // Only commit if URL hasn't changed since fetch started
        if (!ctrl.signal.aborted && urlRef.current === url) {
          setData(j);
        }
      })
      .catch(() => {
        if (!ctrl.signal.aborted && urlRef.current === url) setData(null);
      });

    return () => {
      ctrl.abort();
    };
  }, [url]);

  if (!data) return null;

  // key={url} forces React to unmount+remount the layer when URL changes,
  // which guarantees Leaflet cleans up the old one.
  return (
    <GeoJSON
      key={url}
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
