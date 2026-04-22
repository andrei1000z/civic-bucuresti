import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Politica de confidențialitate",
  description: "Politica de confidențialitate Civia: ce date colectăm, cum le folosim, drepturile tale GDPR și cum exerciți acces, rectificare, ștergere.",
  alternates: { canonical: "/legal/confidentialitate" },
};

export default function ConfidentialitatePage() {
  return (
    <div className="container-narrow py-12 md:py-16 max-w-3xl">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] mb-6"
      >
        <ChevronLeft size={16} /> Înapoi
      </Link>
      <article className="prose-civic">
        <h1 className="font-[family-name:var(--font-sora)] text-4xl font-bold mb-2">
          Politica de confidențialitate
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-8">
          Ultima actualizare: 5 aprilie 2026
        </p>

        <h2>Cine suntem</h2>
        <p>
          Civia este o platformă civică independentă, neafiliată niciunei autorități
          publice. Scopul nostru e să facilitam comunicarea între cetățeni și administrația locală.
        </p>

        <h2>Ce date colectăm</h2>
        <ul>
          <li>
            <strong>Pentru sesizări:</strong> numele, adresa (opțională), emailul (opțional),
            locația problemei, descrierea, fotografiile încărcate.
          </li>
          <li>
            <strong>Pentru cont:</strong> adresa de email (folosită pentru magic link auth),
            numele afișat, adresa salvată (dacă alegi).
          </li>
          <li>
            <strong>Tehnic:</strong> adresa IP (temporar, pentru rate limiting), cookie-uri de
            autentificare Supabase.
          </li>
        </ul>

        <h2>Cum folosim datele</h2>
        <ul>
          <li>Afișăm public sesizările (cu numele tău) doar dacă ai bifat "Publică pe platformă".</li>
          <li>Nu vindem și nu transmitem datele tale către terți.</li>
          <li>Email-urile către autorități le compui tu, nu le trimitem noi.</li>
          <li>AI-ul Groq primește doar textul descrierii pentru a genera sesizarea formală — nu stochează.</li>
        </ul>

        <h2>Drepturile tale (GDPR)</h2>
        <ul>
          <li>
            <strong>Acces:</strong> poți vedea toate datele din contul tău pe{" "}
            <Link href="/cont" className="text-[var(--color-primary)]">/cont</Link>.
          </li>
          <li>
            <strong>Rectificare:</strong> poți edita numele, adresa, telefonul oricând.
          </li>
          <li>
            <strong>Ștergere:</strong> butonul "Șterge contul" din pagina /cont șterge definitiv
            toate datele tale (sesizările tale rămân anonime).
          </li>
          <li>
            <strong>Portabilitate:</strong> butonul "Export date" din /cont descarcă JSON cu tot
            ce avem despre tine.
          </li>
        </ul>

        <h2>Cookies</h2>
        <p>
          Folosim doar cookies esențiale pentru autentificare (Supabase session) și preferința
          temei dark/light. Nu folosim cookies de tracking sau publicitate.
        </p>

        <h2>Securitate</h2>
        <ul>
          <li>Toate datele sunt stocate în Supabase EU (conform GDPR).</li>
          <li>Parolele nu există — folosim magic link prin email.</li>
          <li>Conexiunile sunt criptate HTTPS.</li>
          <li>Avem rate limiting și protecție anti-bot.</li>
        </ul>

        <h2>Contact</h2>
        <p>
          Pentru întrebări sau solicitări GDPR, deschide un issue pe{" "}
          <a href="https://github.com/andrei1000z/civic-bucuresti/issues" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)]">
            GitHub
          </a>.
        </p>
      </article>
    </div>
  );
}
