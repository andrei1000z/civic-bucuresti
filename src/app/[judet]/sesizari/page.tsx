import type { Metadata } from "next";
import { getCountyBySlug } from "@/data/counties";
import { getCountyStats } from "@/data/statistici-judete";
import { Tabs } from "@/components/ui/Tabs";
import { SesizareForm } from "@/components/sesizari/SesizareForm";
import { SesizariPublice } from "@/components/sesizari/SesizariPublice";
import { UrmarireSesizare } from "@/components/sesizari/UrmarireSesizare";
import { FileText, CheckCircle2, Clock, Users } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ judet: string }>;
}): Promise<Metadata> {
  const { judet } = await params;
  const county = getCountyBySlug(judet);
  if (!county) return {};
  return {
    title: "Sesizări",
    description: `Generează sesizări formale cu AI, vezi sesizările publice și urmărește statusul în ${county.name}.`,
    alternates: { canonical: `/${county.slug}/sesizari` },
  };
}

export default async function SesizariPage({
  params,
}: {
  params: Promise<{ judet: string }>;
}) {
  const { judet } = await params;
  const county = getCountyBySlug(judet);
  const countyName = county?.name ?? judet;
  const stats = county ? getCountyStats(county.id) : null;

  const resolvedPct = stats
    ? Math.round((stats.sesizariRezolvate / stats.sesizariTotal) * 100)
    : 0;

  return (
    <div className="container-narrow py-12 md:py-16">
      {/* Hero */}
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-bold mb-3">
          Sesizări — {countyName}
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-3xl mb-6">
          Generează o sesizare formală cu AI, urmărește-o sau vezi ce semnalează alți cetățeni în {countyName}.
        </p>

        {/* Stats bar */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[10px] p-4 flex items-center gap-3">
              <FileText size={20} className="text-blue-500 shrink-0" />
              <div>
                <p className="text-xl font-bold">{stats.sesizariTotal.toLocaleString("ro-RO")}</p>
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Sesizări estimate</p>
              </div>
            </div>
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[10px] p-4 flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
              <div>
                <p className="text-xl font-bold text-emerald-600">{resolvedPct}%</p>
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Rata rezolvare</p>
              </div>
            </div>
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[10px] p-4 flex items-center gap-3">
              <Clock size={20} className="text-amber-500 shrink-0" />
              <div>
                <p className="text-xl font-bold">30 zile</p>
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Termen legal</p>
              </div>
            </div>
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[10px] p-4 flex items-center gap-3">
              <Users size={20} className="text-purple-500 shrink-0" />
              <div>
                <p className="text-xl font-bold truncate">{stats.primarName}</p>
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Primar ({stats.primarPartid})</p>
              </div>
            </div>
          </div>
        )}
        <p className="text-[10px] text-[var(--color-text-muted)] mb-4">
          Conform OG 27/2002, autoritățile au obligația să răspundă în 30 de zile calendaristice.
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
