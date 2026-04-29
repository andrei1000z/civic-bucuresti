import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Code, Database, Shield, Zap } from "lucide-react";
import { SITE_URL } from "@/lib/constants";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DatasetJsonLd } from "@/components/FaqJsonLd";

export const metadata: Metadata = {
  title: "API public pentru dezvoltatori — Civia",
  description:
    "API public CORS-enabled pentru toate sesizările publice din România. Deschis pentru jurnaliști, cercetători, ONG-uri. Licență CC BY 4.0.",
  alternates: { canonical: "/dezvoltatori" },
};

export default function ApiDocsPage() {
  return (
    <div className="container-narrow py-12 md:py-16">
      <DatasetJsonLd
        name="Civia — Sesizări civice România (API public)"
        description="Toate sesizările publice și aprobate trimise prin civia.ro către primării și autorități. Date civice deschise: tip problemă, locație, status (nou/în-lucru/rezolvat), județ/sector, data depunerii. Acces JSON CORS-enabled, fără autentificare. Licență CC BY 4.0."
        url={`${SITE_URL}/dezvoltatori`}
        keywords={["api", "open-data", "sesizari", "romania", "civic-tech", "transparenta", "cc-by-4.0"]}
      />
      <Badge className="mb-4">v1 · stabil</Badge>
      <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-extrabold mb-4">
        API public Civia
      </h1>
      <p className="text-lg text-[var(--color-text-muted)] max-w-3xl mb-10 leading-relaxed">
        Toate sesizările publice și aprobate sunt accesibile prin API deschis, fără autentificare.
        CORS complet deschis, rate-limit generos (120 req/min per IP). Licență{" "}
        <a
          href="https://creativecommons.org/licenses/by/4.0/deed.ro"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--color-primary)] hover:underline"
        >
          CC BY 4.0
        </a>{" "}
        — folosește cum vrei, cită-ne ca sursă.
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-12">
        <Card accentColor="#1C4ED8">
          <Database size={24} className="text-[var(--color-primary)] mb-3" aria-hidden="true" />
          <h3 className="font-bold mb-1">Date actualizate</h3>
          <p className="text-sm text-[var(--color-text-muted)]">
            Sesizări noi propagate în API în &lt;1 minut. Stats actualizate la 5 min.
          </p>
        </Card>
        <Card accentColor="#10b981">
          <Shield size={24} className="text-emerald-600 mb-3" aria-hidden="true" />
          <h3 className="font-bold mb-1">Zero autentificare</h3>
          <p className="text-sm text-[var(--color-text-muted)]">
            Fără cheie API, fără înregistrare. Doar sesizări publice (cu consimțământul autorilor).
          </p>
        </Card>
        <Card accentColor="#f59e0b">
          <Zap size={24} className="text-amber-600 mb-3" aria-hidden="true" />
          <h3 className="font-bold mb-1">Rate limit generos</h3>
          <p className="text-sm text-[var(--color-text-muted)]">
            120 cereri/min per IP. Dacă ai nevoie de mai mult, ne scrii.
          </p>
        </Card>
        <Card accentColor="#8b5cf6">
          <Code size={24} className="text-violet-600 mb-3" aria-hidden="true" />
          <h3 className="font-bold mb-1">CORS deschis</h3>
          <p className="text-sm text-[var(--color-text-muted)]">
            Fetch direct din browser. Funcționează în orice aplicație web, notebook sau script.
          </p>
        </Card>
      </div>

      {/* Endpoint 1 */}
      <section className="mb-12">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl md:text-3xl font-bold mb-4">
          GET <code className="text-[var(--color-primary)]">/api/v1/sesizari</code>
        </h2>
        <p className="text-[var(--color-text-muted)] mb-5">
          Listare paginată a sesizărilor publice. Ordonate după dată (descendent).
        </p>

        <h3 className="font-bold mb-2">Query params</h3>
        <div className="rounded-[var(--radius-xs)] border border-[var(--color-border)] overflow-x-auto mb-5 -mx-4 sm:mx-0">
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-[var(--color-surface-2)]">
              <tr>
                <th className="text-left px-4 py-2">Parametru</th>
                <th className="text-left px-4 py-2">Tip</th>
                <th className="text-left px-4 py-2">Descriere</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-[var(--color-border)]">
                <td className="px-4 py-2 font-mono text-xs">county</td>
                <td className="px-4 py-2 text-xs text-[var(--color-text-muted)]">string</td>
                <td className="px-4 py-2">Cod județ: B, CJ, IS, CT, TM, ...</td>
              </tr>
              <tr className="border-t border-[var(--color-border)]">
                <td className="px-4 py-2 font-mono text-xs">tip</td>
                <td className="px-4 py-2 text-xs text-[var(--color-text-muted)]">string</td>
                <td className="px-4 py-2">groapa, trotuar, iluminat, copac, gunoi, parcare, canalizare, ...</td>
              </tr>
              <tr className="border-t border-[var(--color-border)]">
                <td className="px-4 py-2 font-mono text-xs">status</td>
                <td className="px-4 py-2 text-xs text-[var(--color-text-muted)]">string</td>
                <td className="px-4 py-2">nou · in-lucru · rezolvat · respins</td>
              </tr>
              <tr className="border-t border-[var(--color-border)]">
                <td className="px-4 py-2 font-mono text-xs">sector</td>
                <td className="px-4 py-2 text-xs text-[var(--color-text-muted)]">string</td>
                <td className="px-4 py-2">S1..S6 (doar pentru București)</td>
              </tr>
              <tr className="border-t border-[var(--color-border)]">
                <td className="px-4 py-2 font-mono text-xs">from / to</td>
                <td className="px-4 py-2 text-xs text-[var(--color-text-muted)]">ISO date</td>
                <td className="px-4 py-2">Filtrare după data creării (2025-01-01)</td>
              </tr>
              <tr className="border-t border-[var(--color-border)]">
                <td className="px-4 py-2 font-mono text-xs">limit</td>
                <td className="px-4 py-2 text-xs text-[var(--color-text-muted)]">1-100</td>
                <td className="px-4 py-2">Default 50</td>
              </tr>
              <tr className="border-t border-[var(--color-border)]">
                <td className="px-4 py-2 font-mono text-xs">offset</td>
                <td className="px-4 py-2 text-xs text-[var(--color-text-muted)]">≥0</td>
                <td className="px-4 py-2">Default 0. Folosește <code>meta.next</code> pentru pagina următoare.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="font-bold mb-2">Exemplu — toate sesizările rezolvate din Cluj</h3>
        <pre className="bg-[var(--color-surface-2)] border border-[var(--color-border)] sm:rounded-[var(--radius-xs)] p-4 text-xs overflow-x-auto mb-5 -mx-4 sm:mx-0">
          <code>{`curl "${SITE_URL}/api/v1/sesizari?county=CJ&status=rezolvat&limit=20"`}</code>
        </pre>

        <h3 className="font-bold mb-2">Exemplu — Response</h3>
        <pre className="bg-[var(--color-surface-2)] border border-[var(--color-border)] sm:rounded-[var(--radius-xs)] p-4 text-xs overflow-x-auto -mx-4 sm:mx-0">
          <code>{`{
  "meta": {
    "version": "v1",
    "count": 342,
    "limit": 20,
    "offset": 0,
    "next": 20,
    "license": "CC BY 4.0",
    "source": "https://civia.ro",
    "docs": "https://civia.ro/dezvoltatori"
  },
  "data": [
    {
      "id": "uuid",
      "code": "AB1234",
      "tip": "groapa",
      "titlu": "Groapă adâncă pe str. Memorandumului",
      "locatie": "Str. Memorandumului 12, Cluj-Napoca",
      "sector": null,
      "county": "CJ",
      "locality": "Cluj-Napoca",
      "lat": 46.770439,
      "lng": 23.591423,
      "status": "rezolvat",
      "resolved_at": "2026-03-15T10:23:00Z",
      "created_at": "2026-02-20T14:15:00Z",
      "updated_at": "2026-03-15T10:23:00Z",
      "voturi_net": 42,
      "nr_comentarii": 7
    }
  ]
}`}</code>
        </pre>
      </section>

      {/* Endpoint 2 */}
      <section className="mb-12">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl md:text-3xl font-bold mb-4">
          GET <code className="text-[var(--color-primary)]">/api/v1/stats</code>
        </h2>
        <p className="text-[var(--color-text-muted)] mb-5">
          Statistici agregate naționale. Fără parametri.
        </p>

        <pre className="bg-[var(--color-surface-2)] border border-[var(--color-border)] sm:rounded-[var(--radius-xs)] p-4 text-xs overflow-x-auto -mx-4 sm:mx-0">
          <code>{`curl "${SITE_URL}/api/v1/stats"

{
  "meta": { "version": "v1", "license": "CC BY 4.0", ... },
  "data": {
    "total": 12453,
    "resolved": 4212,
    "in_progress": 2031,
    "by_type": { "groapa": 3421, "iluminat": 2102, ... },
    "by_county": { "B": 5621, "CJ": 1203, "IS": 891, ... }
  }
}`}</code>
        </pre>
      </section>

      {/* JS example */}
      <section className="mb-12">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl md:text-3xl font-bold mb-4">
          Exemplu JavaScript
        </h2>
        <pre className="bg-[var(--color-surface-2)] border border-[var(--color-border)] sm:rounded-[var(--radius-xs)] p-4 text-xs overflow-x-auto -mx-4 sm:mx-0">
          <code>{`// Works directly in browser — CORS is open
const res = await fetch("${SITE_URL}/api/v1/sesizari?county=B&status=rezolvat&limit=10");
const { meta, data } = await res.json();
console.log(\`Arătat \${data.length}/\${meta.count} sesizări rezolvate din București\`);
data.forEach((s) => console.log(\`#\${s.code} — \${s.titlu}\`));`}</code>
        </pre>
      </section>

      {/* License */}
      <section className="mb-12 p-6 rounded-[var(--radius-card)] bg-[var(--color-primary-soft)] border border-[var(--color-primary)]/20">
        <h3 className="font-bold mb-2">Atribuire (CC BY 4.0)</h3>
        <p className="text-sm text-[var(--color-text-muted)] mb-3">
          Poți folosi datele oriunde — blog, cercetare, articol, aplicație. Tot ce îți cerem:
          menționează sursa și linkează către <Link href="/" className="text-[var(--color-primary)] hover:underline">civia.ro</Link>.
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">
          Exemplu atribuire: <em>„Date: civia.ro (CC BY 4.0)"</em>
        </p>
      </section>

      <div className="text-center">
        <Link
          href="/impact"
          className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline font-medium"
        >
          Vezi dashboard-ul public <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
