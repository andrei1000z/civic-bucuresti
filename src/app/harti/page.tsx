import type { Metadata } from "next";
import { HartiMap } from "@/components/maps/HartiMap";

export const metadata: Metadata = {
  title: "Hărți de mobilitate",
  description:
    "Hartă interactivă cu piste de biciclete, linii STB, metrou, trasee pe jos și statistici pentru București.",
  alternates: { canonical: "/harti" },
};

export default function HartiPage() {
  return (
    <>
      <h1 className="sr-only">Hărți de mobilitate București — piste, metrou, STB, trasee</h1>
      <HartiMap />
    </>
  );
}
