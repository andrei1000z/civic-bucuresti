import type { Metadata } from "next";
import { HartiMap } from "@/components/maps/HartiMap";

export const metadata: Metadata = {
  title: "Piste de biciclete România — Hartă",
  description: "Hartă interactivă cu toate pistele de biciclete și benzile marcate din România. Date OpenStreetMap.",
  alternates: { canonical: "/harti/bicicleta" },
};

export default function BicicletaPage() {
  return (
    <>
      <h1 className="sr-only">Piste de biciclete România</h1>
      <HartiMap defaultTab="bicicleta" />
    </>
  );
}
