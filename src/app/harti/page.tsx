import type { Metadata } from "next";
import { HartiMap } from "@/components/maps/HartiMap";

export const metadata: Metadata = {
  title: "Hărți de mobilitate",
  description:
    "Hartă interactivă cu piste de biciclete, linii STB, metrou, trasee pe jos și statistici pentru București.",
};

export default function HartiPage() {
  return <HartiMap />;
}
