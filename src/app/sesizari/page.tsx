import type { Metadata } from "next";
import { Tabs } from "@/components/ui/Tabs";
import { SesizareForm } from "@/components/sesizari/SesizareForm";
import { SesizariPublice } from "@/components/sesizari/SesizariPublice";
import { UrmarireSesizare } from "@/components/sesizari/UrmarireSesizare";

export const metadata: Metadata = {
  title: "Sesizări",
  description: "Generează sesizări formale pentru PMB, vezi sesizările publice și urmărește statusul.",
  alternates: { canonical: "/sesizari" },
};

export default function SesizariPage() {
  return (
    <div className="container-narrow py-12 md:py-16">
      <div className="mb-10">
        <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-bold mb-3">
          Sesizări București
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-3xl">
          Generează o sesizare formală, urmărește sesizarea ta sau vezi ce semnalează alți cetățeni în oraș.
        </p>
      </div>

      <Tabs
        variant="pills"
        items={[
          {
            id: "form",
            label: "Fă o sesizare",
            content: <SesizareForm />,
          },
          {
            id: "publice",
            label: "Sesizări publice",
            content: <SesizariPublice />,
          },
          {
            id: "urmareste",
            label: "Urmărește sesizarea",
            content: <UrmarireSesizare />,
          },
        ]}
      />
    </div>
  );
}
