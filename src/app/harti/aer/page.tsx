import type { Metadata } from "next";
import { HartiMap } from "@/components/maps/HartiMap";

export const metadata: Metadata = {
  title: "Calitate aer România — Hartă",
  description: "Hartă interactivă cu calitatea aerului în timp real din toată România. Senzori live, heatmap IDW.",
  alternates: { canonical: "/harti/aer" },
};

export default function AerMapPage() {
  return (
    <>
      <h1 className="sr-only">Calitate aer România — Hartă live</h1>
      <HartiMap defaultTab="statistici" />
    </>
  );
}
