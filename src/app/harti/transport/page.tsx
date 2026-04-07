import type { Metadata } from "next";
import { HartiMap } from "@/components/maps/HartiMap";

export const metadata: Metadata = {
  title: "Transport public România — Hartă",
  description: "Metrou, tramvai și transport public din România. Date OpenStreetMap.",
  alternates: { canonical: "/harti/transport" },
};

export default function Page() {
  return (
    <>
      <h1 className="sr-only">Transport public România</h1>
      <HartiMap defaultTab="transport" />
    </>
  );
}
