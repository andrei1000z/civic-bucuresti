import type { Metadata } from "next";
import { HartiMap } from "@/components/maps/HartiMap";

export const metadata: Metadata = {
  title: "Transport public România — Hartă",
  description: "Hartă interactivă cu metrou, tramvai și transport public din România.",
  alternates: { canonical: "/harti/transport" },
};

export default function TransportPage() {
  return (
    <>
      <h1 className="sr-only">Transport public România</h1>
      <HartiMap defaultTab="transport" />
    </>
  );
}
