import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { CookiePreferencesButton } from "./FooterClientLinks";
import { FooterFeedback } from "./FooterFeedback";

const linkCls =
  "text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors";

export function Footer() {
  return (
    <footer className="bg-[var(--color-surface-soft)] border-t border-[var(--color-border)] mt-auto">
      <div className="container-narrow py-12">
        {/* Brand + 2 link sections (Despre Civia + Resurse oficiale).
            User a cerut: scoatem complet „Folosește platforma" + „Ghiduri
            practice" — sunt deja accesibile din navbar/Altele dropdown. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Column 1 — Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div
                className="w-9 h-9 rounded-[var(--radius-button)] bg-gradient-to-br from-[var(--color-primary)] to-emerald-900 flex items-center justify-center text-white font-[family-name:var(--font-sora)] font-semibold text-2xl leading-none"
                aria-hidden="true"
                style={{ paddingRight: "10%", paddingBottom: "8%" }}
              >
                C
              </div>
              <span className="font-[family-name:var(--font-sora)] font-bold text-lg">
                {SITE_NAME}
              </span>
            </Link>
            <p className="text-sm text-[var(--color-text-muted)] mb-4 max-w-xs">
              Platformă civică independentă. Gratuită, fără politică — pentru cetățenii din România.
            </p>
          </div>

          {/* Column 2 — Despre Civia (legal + about) */}
          <div>
            <h4 className="font-semibold mb-3 text-[var(--color-text)] text-sm">
              Despre Civia
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/impact" className={linkCls}>Ce s-a rezolvat prin Civia</Link></li>
              <li><Link href="/dezvoltatori" className={linkCls}>API public — pentru jurnaliști</Link></li>
              <li><Link href="/accesibilitate" className={linkCls}>Accesibilitate (WCAG 2.1)</Link></li>
              <li><Link href="/legal/confidentialitate" className={linkCls}>Confidențialitate și GDPR</Link></li>
              <li><Link href="/legal/termeni" className={linkCls}>Termenii de utilizare</Link></li>
              <li><CookiePreferencesButton /></li>
            </ul>
          </div>

          {/* Column 3 — Resurse oficiale */}
          <div>
            <h4 className="font-semibold mb-3 text-[var(--color-text)] text-sm">
              Resurse oficiale
            </h4>
            <ul className="space-y-2 text-sm">
              <li><a href="https://data.gov.ro" target="_blank" rel="noopener noreferrer" className={linkCls}>Portalul datelor publice</a></li>
              <li><a href="https://www.ghiseul.ro" target="_blank" rel="noopener noreferrer" className={linkCls}>Plăți taxe (Ghișeul.ro)</a></li>
              <li><a href="https://www.anpm.ro" target="_blank" rel="noopener noreferrer" className={linkCls}>Agenția de Mediu</a></li>
              <li><a href="https://www.politiaromana.ro" target="_blank" rel="noopener noreferrer" className={linkCls}>Poliția Română</a></li>
            </ul>
          </div>
        </div>

        {/* Feedback + newsletter */}
        <FooterFeedback />

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-text-muted)] text-center">
            &copy; 2026 Civia.ro — Platformă civică independentă · Făcută cu{" "}
            <span aria-hidden="true">❤️</span>
            <span className="sr-only">dragoste</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
