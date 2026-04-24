"use client";

import dynamic from "next/dynamic";

const EvenimentMap = dynamic(
  () => import("@/components/maps/EvenimentMap").then((m) => m.EvenimentMap),
  { ssr: false },
);

export function MapClient(props: {
  coords: [number, number];
  label: string;
  color: string;
  zoom?: number;
  height?: string;
}) {
  return <EvenimentMap {...props} />;
}
