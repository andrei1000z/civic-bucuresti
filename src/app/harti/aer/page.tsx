import type { Metadata } from "next";
import { HartiMap } from "@/components/maps/HartiMap";

export const metadata: Metadata = {
  title: "Calitate aer România — Hartă",
  description: "Hartă cu calitatea aerului în timp real din România. Date OpenStreetMap.",
  alternates: { canonical: "/harti/aer" },
};

export default function Page() {
  return (
    <>
      <h1 className="sr-only">Calitate aer România</h1>
      <HartiMap defaultTab="statistici" />
    </>
  );
}
