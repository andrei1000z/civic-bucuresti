import type { Metadata } from "next";
import { HartiMap } from "@/components/maps/HartiMap";

export const metadata: Metadata = {
  title: "Trasee pedestre România — Hartă",
  description: "Parcuri, zone pietonale și trotuare din România. Date OpenStreetMap.",
  alternates: { canonical: "/harti/pejos" },
};

export default function Page() {
  return (
    <>
      <h1 className="sr-only">Trasee pedestre România</h1>
      <HartiMap defaultTab="pejos" />
    </>
  );
}
