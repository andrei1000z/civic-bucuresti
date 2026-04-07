import type { Metadata } from "next";
import { HartiMap } from "@/components/maps/HartiMap";

export const metadata: Metadata = {
  title: "Drumuri România — Hartă",
  description: "Hartă interactivă cu rețeaua rutieră din România. Date OpenStreetMap.",
  alternates: { canonical: "/harti/auto" },
};

export default function AutoPage() {
  return (
    <>
      <h1 className="sr-only">Drumuri România</h1>
      <HartiMap defaultTab="auto" />
    </>
  );
}
