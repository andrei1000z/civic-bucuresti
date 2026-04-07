import type { Metadata } from "next";
import { HartiMap } from "@/components/maps/HartiMap";

export const metadata: Metadata = {
  title: "Piste biciclete România — Hartă",
  description: "Piste de biciclete și benzi marcate din România. Date OpenStreetMap.",
  alternates: { canonical: "/harti/bicicleta" },
};

export default function Page() {
  return (
    <>
      <h1 className="sr-only">Piste biciclete România</h1>
      <HartiMap defaultTab="bicicleta" />
    </>
  );
}
