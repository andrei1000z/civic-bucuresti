import type { Metadata } from "next";
import { HartiMap } from "@/components/maps/HartiMap";

export const metadata: Metadata = {
  title: "Drumuri România — Hartă",
  description: "Autostrăzi, drumuri naționale, județene și străzi din România. Date OpenStreetMap.",
  alternates: { canonical: "/harti/cumasina" },
};

export default function Page() {
  return (
    <>
      <h1 className="sr-only">Drumuri România</h1>
      <HartiMap defaultTab="auto" />
    </>
  );
}
