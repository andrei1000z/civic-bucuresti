import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, MapPin, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { BileteTabs } from "@/components/bilete/BileteTabs";
import { TariffCalculator } from "@/components/bilete/TariffCalculator";
import { LastUpdated } from "@/components/data/LastUpdated";
import { bilete, linii, DATE_VERIFIED } from "@/data/bilete";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Bilete & Abonamente transport",
  description:
    "Toate tarifele pentru STB, Metrorex, linii Ilfov - bilete, abonamente, card Activ.",
  alternates: { canonical: "/bilete" },
};

// Tarifele se schimbă rar — ISR 24h e safe.
export const revalidate = 86400;

function OperatorSection({ operator }: { operator: "stb" | "metrorex" | "ilfov" }) {
  const items = bilete.filter((b) => b.operator === operator);
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map((bilet) => (
        <Card key={bilet.id} hover className="flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="text-3xl">{bilet.icon}</div>
            <Badge variant="primary">
              {bilet.pret === 0 ? "Gratuit" : formatCurrency(bilet.pret)}
            </Badge>
          </div>
          <h3 className="font-semibold text-lg mb-1">{bilet.nume}</h3>
          <p className="text-xs text-[var(--color-text-muted)] mb-3">
            Valabilitate: {bilet.validitate}
          </p>
          <p className="text-sm text-[var(--color-text)] mb-4 flex-1">{bilet.descriere}</p>
          <div className="space-y-2 mb-4">
            <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              Unde cumperi
            </p>
            {bilet.undeCumperi.map((loc) => (
              <div key={loc} className="flex items-center gap-2 text-sm">
                <MapPin size={14} className="text-[var(--color-primary)] shrink-0" />
                <span>{loc}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs">
            {bilet.accepteCardBancar ? (
              <>
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span className="text-[var(--color-text-muted)]">Acceptă card bancar</span>
              </>
            ) : (
              <>
                <XCircle size={14} className="text-red-500" />
                <span className="text-[var(--color-text-muted)]">Numerar doar</span>
              </>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function BiletePage() {
  return (
    <div className="container-narrow py-12 md:py-16">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-extrabold mb-4">
          Bilete & Abonamente STB / Metrorex {new Date().getFullYear()}
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] mb-3">
          Tarife, abonamente și puncte de vânzare pentru toate operatorii de transport public.
        </p>
        <p className="text-xs text-[var(--color-text-muted)] mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
          ⚠️ Prețurile se pot modifica. Verifică pe{" "}
          <a href="https://stbsa.ro/tarife" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline font-medium">stbsa.ro/tarife</a>
          {" "}/{" "}
          <a href="https://metrorex.ro" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline font-medium">metrorex.ro</a>
          .
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="https://stbsa.ro"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--color-primary)] hover:underline"
          >
            stbsa.ro <ExternalLink size={12} />
          </a>
          <a
            href="https://metrorex.ro"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--color-primary)] hover:underline"
          >
            metrorex.ro <ExternalLink size={12} />
          </a>
          <a
            href="https://primariavoluntari.ro"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--color-primary)] hover:underline"
          >
            voluntari.ro <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Operator Tabs */}
      <BileteTabs
        stbContent={<OperatorSection operator="stb" />}
        metrorexContent={<OperatorSection operator="metrorex" />}
        ilfovContent={<OperatorSection operator="ilfov" />}
      />

      {/* Calculator */}
      <section className="mt-16">
        <h2 className="font-[family-name:var(--font-sora)] text-3xl font-bold mb-2">
          🧮 Calculator tarife personalizat
        </h2>
        <p className="text-[var(--color-text-muted)] mb-6">
          Compară toate opțiunile pentru stilul tău de călătorie și economisește.
        </p>
        <TariffCalculator />
      </section>

      {/* Comparator */}
      <section className="mt-20">
        <h2 className="font-[family-name:var(--font-sora)] text-3xl font-bold mb-6">
          Comparator operatori
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-[var(--color-surface)] rounded-[var(--radius-md)] overflow-hidden border border-[var(--color-border)]">
            <thead>
              <tr className="bg-[var(--color-surface-2)]">
                <th className="text-left p-4 text-sm font-semibold">Operator</th>
                <th className="text-left p-4 text-sm font-semibold">Tip</th>
                <th className="text-left p-4 text-sm font-semibold">Preț</th>
                <th className="text-left p-4 text-sm font-semibold">Valabilitate</th>
                <th className="text-left p-4 text-sm font-semibold">Card bancar</th>
              </tr>
            </thead>
            <tbody>
              {bilete.map((b, i) => (
                <tr
                  key={b.id}
                  className={i % 2 === 0 ? "bg-[var(--color-surface)]" : "bg-[var(--color-surface-2)]/50"}
                >
                  <td className="p-4 text-sm font-medium">
                    {b.operator === "stb" ? "STB" : b.operator === "metrorex" ? "Metrorex" : "Ilfov"}
                  </td>
                  <td className="p-4 text-sm">{b.nume}</td>
                  <td className="p-4 text-sm font-bold text-[var(--color-primary)]">
                    {b.pret === 0 ? "Gratuit" : formatCurrency(b.pret)}
                  </td>
                  <td className="p-4 text-sm text-[var(--color-text-muted)]">{b.validitate}</td>
                  <td className="p-4 text-sm">
                    {b.accepteCardBancar ? (
                      <CheckCircle2 size={18} className="text-emerald-600" />
                    ) : (
                      <XCircle size={18} className="text-red-500" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Linii principale STB */}
      <section className="mt-20">
        <h2 className="font-[family-name:var(--font-sora)] text-3xl font-bold mb-6">
          Linii principale STB
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {linii.map((linie) => (
            <Card key={linie.id} hover>
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                  style={{ background: linie.culoare }}
                >
                  {linie.numar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="neutral" className="text-[10px] uppercase">
                      {linie.tip}
                    </Badge>
                  </div>
                  <p className="text-sm text-[var(--color-text)] mb-2 line-clamp-2">
                    {linie.traseu.join(" → ")}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
                    <span>Frecvență: {linie.frecventa}</span>
                    <span>{linie.primaCursa} - {linie.ultimaCursa}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Cum îți faci card Activ */}
      <section className="mt-20 mb-8">
        <h2 className="font-[family-name:var(--font-sora)] text-3xl font-bold mb-2">
          Cum îți faci Card Activ STB
        </h2>
        <p className="text-[var(--color-text-muted)] mb-8">
          5 pași simpli pentru a obține cardul reîncărcabil.
        </p>
        <div className="grid md:grid-cols-5 gap-4">
          {[
            { nr: 1, titlu: "Mergi la ghișeu STB", desc: "Oricare ghișeu Activ." },
            { nr: 2, titlu: "Pregătește actele", desc: "Buletin sau CI valid." },
            { nr: 3, titlu: "Pozează gratuit", desc: "Se face pe loc, direct la ghișeu." },
            { nr: 4, titlu: "Primești cardul", desc: "Imediat, fără costuri." },
            { nr: 5, titlu: "Reîncarci online", desc: "Pe stb.ro sau în aplicație." },
          ].map((step) => (
            <div
              key={step.nr}
              className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-5"
            >
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-sm font-bold mb-3">
                {step.nr}
              </div>
              <h3 className="font-semibold text-sm mb-1">{step.titlu}</h3>
              <p className="text-xs text-[var(--color-text-muted)]">{step.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Link
            href="/ghiduri/ghid-transport"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            Vezi ghidul complet de transport public →
          </Link>
        </div>
      </section>

      <LastUpdated
        date={DATE_VERIFIED}
        sources={["stb.ro", "metrorex.ro", "ctp-ploiesti.ro", "ratb.ro / app 24pay"]}
        note="Tarifele pot diferi în zilele de modificare oficială — verifică pe site-ul operatorului înainte de cumpărare."
      />
    </div>
  );
}
