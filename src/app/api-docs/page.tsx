import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Code, Download } from "lucide-react";

export const metadata: Metadata = {
  title: "API public pentru dezvoltatori",
  description: "API gratuit cu datele Civia — pentru jurnaliști, cercetători, dezvoltatori.",
  alternates: { canonical: "/api-docs" },
  robots: { index: false, follow: true },
};

export default function ApiDocsPage() {
  return (
    <div className="container-narrow py-12 md:py-16 max-w-3xl">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] mb-6"
      >
        <ChevronLeft size={16} /> Înapoi
      </Link>

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] text-xs font-semibold mb-4">
          <Code size={12} />
          API PUBLIC · CC BY 4.0
        </div>
        <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-bold mb-3">
          API pentru dezvoltatori
        </h1>
        <p className="text-lg text-[var(--color-text-muted)]">
          Datele noastre sunt gratuite, deschise și accesibile oricui vrea să construiască ceva
          util cetățenilor Bucureștiului.
        </p>
      </div>

      <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6 mb-6">
        <h2 className="font-[family-name:var(--font-sora)] font-bold text-xl mb-2">Sesizări publice</h2>
        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          Returnează lista sesizărilor aprobate și publice, cu filtre opționale.
        </p>
        <code className="block p-3 rounded-[8px] bg-[var(--color-surface-2)] text-sm font-mono break-all mb-4">
          GET /api/public/sesizari
        </code>
        <h3 className="font-semibold text-sm mb-2">Parametri query (toate opționale)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-surface-2)]">
              <tr>
                <th className="text-left p-2">Parametru</th>
                <th className="text-left p-2">Tip</th>
                <th className="text-left p-2">Exemplu</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-[var(--color-border)]">
                <td className="p-2 font-mono">status</td>
                <td className="p-2 text-xs">nou | in-lucru | rezolvat</td>
                <td className="p-2 font-mono text-xs">?status=nou</td>
              </tr>
              <tr className="border-t border-[var(--color-border)]">
                <td className="p-2 font-mono">sector</td>
                <td className="p-2 text-xs">S1 ... S6</td>
                <td className="p-2 font-mono text-xs">?sector=S3</td>
              </tr>
              <tr className="border-t border-[var(--color-border)]">
                <td className="p-2 font-mono">tip</td>
                <td className="p-2 text-xs">groapa | iluminat | ...</td>
                <td className="p-2 font-mono text-xs">?tip=groapa</td>
              </tr>
              <tr className="border-t border-[var(--color-border)]">
                <td className="p-2 font-mono">limit</td>
                <td className="p-2 text-xs">number (max 500)</td>
                <td className="p-2 font-mono text-xs">?limit=100</td>
              </tr>
              <tr className="border-t border-[var(--color-border)]">
                <td className="p-2 font-mono">offset</td>
                <td className="p-2 text-xs">number</td>
                <td className="p-2 font-mono text-xs">?offset=100</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="font-semibold text-sm mt-4 mb-2">Exemplu cerere (fetch)</h3>
        <pre className="p-4 rounded-[8px] bg-[var(--color-surface-2)] text-xs font-mono overflow-x-auto">
{`const res = await fetch(
  "https://civia.ro/api/public/sesizari?sector=S3&status=nou&limit=50"
);
const { data, meta } = await res.json();
console.log(data); // [{ code, titlu, descriere, locatie, sector, lat, lng, ... }]`}
        </pre>

        <h3 className="font-semibold text-sm mt-4 mb-2">Exemplu răspuns</h3>
        <pre className="p-4 rounded-[8px] bg-[var(--color-surface-2)] text-xs font-mono overflow-x-auto">
{`{
  "data": [
    {
      "code": "SES-2026-0042",
      "titlu": "Groapă mare pe Calea Victoriei",
      "descriere": "...",
      "locatie": "Calea Victoriei 45",
      "sector": "S1",
      "lat": 44.4419,
      "lng": 26.0977,
      "tip": "groapa",
      "status": "nou",
      "created_at": "2026-04-02T09:23:00Z",
      "voturi_net": 47,
      "nr_comentarii": 12
    }
  ],
  "meta": {
    "count": 1,
    "limit": 50,
    "offset": 0,
    "license": "CC BY 4.0",
    "docs": "https://civia.ro/api-docs"
  }
}`}
        </pre>
      </section>

      <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6 mb-6">
        <h2 className="font-[family-name:var(--font-sora)] font-bold text-xl mb-2">
          Export CSV
        </h2>
        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          Pentru analize în Excel/Python/R, cu filtre similare.
        </p>
        {/* API endpoint download — not a Next route */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/api/sesizari/export?limit=1000"
          download
          className="inline-flex items-center gap-2 h-10 px-4 rounded-[8px] bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)]"
        >
          <Download size={14} />
          Descarcă 1000 sesizări CSV
        </a>
      </section>

      <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6 mb-6">
        <h2 className="font-[family-name:var(--font-sora)] font-bold text-xl mb-2">RSS Feed</h2>
        <p className="text-sm text-[var(--color-text-muted)] mb-3">
          Ultimele 50 sesizări în format RSS 2.0.
        </p>
        <code className="block p-3 rounded-[8px] bg-[var(--color-surface-2)] text-sm font-mono break-all">
          GET /feed.xml
        </code>
      </section>

      <section className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-[12px] p-5">
        <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">
          📝 Licență & atribuire
        </h3>
        <p className="text-sm text-amber-800 dark:text-amber-300">
          Datele sunt disponibile sub licența <strong>Creative Commons BY 4.0</strong>.
          Poți să le folosești liber, inclusiv comercial, cu condiția să atribui sursa:
          <em> &quot;Date furnizate de Civia (civia.ro)&quot;</em>.
        </p>
      </section>

      <section className="mt-8 p-5 bg-[var(--color-surface-2)] rounded-[12px] text-sm">
        <p className="text-[var(--color-text-muted)]">
          <strong>Rate limiting:</strong> 60 cereri/minut per IP. Pentru volume mai mari, contactează-ne la{" "}
          <a href="mailto:api@civia.ro" className="text-[var(--color-primary)]">api@civia.ro</a>.
        </p>
      </section>
    </div>
  );
}
