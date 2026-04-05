"use client";

import { Marker, Popup, Circle } from "react-leaflet";
import { createColoredIcon } from "./LeafletMap";

interface EvenimentMarkerProps {
  coords: [number, number];
  label: string;
  color: string;
}

export default function EvenimentMarker({ coords, label, color }: EvenimentMarkerProps) {
  return (
    <>
      <Circle
        center={coords}
        radius={200}
        pathOptions={{
          color,
          fillColor: color,
          fillOpacity: 0.2,
          weight: 2,
        }}
      />
      <Marker position={coords} icon={createColoredIcon(color, 36)}>
        <Popup>
          <p className="font-semibold">{label}</p>
        </Popup>
      </Marker>
    </>
  );
}
