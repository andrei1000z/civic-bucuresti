import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calitatea aerului în România — Hartă live",
  description:
    "Hartă interactivă cu calitatea aerului în timp real din toată România. Date de la sute de senzori: Sensor.Community, OpenAQ, WAQI.",
  alternates: { canonical: "/aer" },
  openGraph: {
    title: "Calitatea aerului în România — Civia",
    description: "Verifică calitatea aerului în orașul tău. Hartă live cu toți senzorii din România.",
  },
};

// ISR — sensor data lives behind /api/aer which has its own 5-min cache.
// The page itself is a thin shell around AerMapWrapper (client-only).
export const revalidate = 3600;

// Wrapper that imports the client map lazily to avoid SSR window issues
import { AerMapWrapper } from "./AerMapWrapper";

export default function AerPage() {
  return (
    <div className="h-[calc(100vh-64px)] relative">
      <AerMapWrapper />
    </div>
  );
}
