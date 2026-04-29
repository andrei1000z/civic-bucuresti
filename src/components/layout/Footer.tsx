import Link from "next/link";
import { MapPin } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";
import { CookiePreferencesButton } from "./FooterClientLinks";
import { FooterFeedback } from "./FooterFeedback";

const linkCls =
  "text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors";

export function Footer() {
  return (
    <footer className="bg-[var(--color-surface-soft)] border-t border-[var(--color-border)] mt-auto">
      <div className="container-narrow py-12">
        {/* ── 5-column grid ─────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1 — Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-[var(--radius-button)] bg-gradient-to-br from-[var(--color-primary)] to-emerald-900 flex items-center justify-center text-white">
                <MapPin size={18} strokeWidth={2.5} aria-hidden="true" />
              </div>
              <span className="font-[family-name:var(--font-sora)] font-bold text-lg">
                {SITE_NAME}
              </span>
            </Link>
            <p className="text-sm text-[var(--color-text-muted)] mb-4 max-w-xs">
              Platformă civică independentă. Gratuită, fără politică, open-source — pentru cetățenii din România.
            </p>
          </div>

          {/* Column 2 — Platformă */}
          <div>
            <h4 className="font-semibold mb-3 text-[var(--color-text)] text-sm">
              Folosește platforma
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/sesizari" className={linkCls}>Trimite o sesizare</Link></li>
              <li><Link href="/sesizari-publice" className={linkCls}>Sesizări publice</Link></li>
              <li><Link href="/harti" className={linkCls}>Hărți interactive</Link></li>
              <li><Link href="/aer" className={linkCls}>Calitatea aerului — live</Link></li>
              <li><Link href="/stiri" className={linkCls}>Știri locale</Link></li>
              <li><Link href="/calendar-civic" className={linkCls}>Calendar civic</Link></li>
              <li><Link href="/judete" className={linkCls}>Toate cele 42 de județe</Link></li>
              <li><Link href="/autoritati" className={linkCls}>Autorități publice — contacte</Link></li>
              <li><Link href="/intreruperi" className={linkCls}>Întreruperi apă/caldură/curent</Link></li>
              <li><Link href="/compara" className={linkCls}>Compară două județe</Link></li>
            </ul>
          </div>

          {/* Column 3 — Ghiduri */}
          <div>
            <h4 className="font-semibold mb-3 text-[var(--color-text)] text-sm">
              Ghiduri practice
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/ghiduri/ghid-sesizari" className={linkCls}>Cum faci o sesizare</Link></li>
              <li><Link href="/ghiduri/ghid-contestatie-amenda" className={linkCls}>Cum contești o amendă</Link></li>
              <li><Link href="/ghiduri/ghid-legea-544" className={linkCls}>Informații publice (L 544)</Link></li>
              <li><Link href="/ghiduri/ghid-cetatean" className={linkCls}>Drepturile cetățeanului</Link></li>
              <li><Link href="/ghiduri/ghid-cutremur" className={linkCls}>Pregătire cutremur</Link></li>
              <li><Link href="/ghiduri/ghid-vara" className={linkCls}>Caniculă și vară</Link></li>
              <li><Link href="/ghiduri/ghid-transport" className={linkCls}>Transport public</Link></li>
              <li><Link href="/ghiduri/ghid-biciclist" className={linkCls}>Biciclist în oraș</Link></li>
            </ul>
          </div>

          {/* Column 4 — Legal */}
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
            <h4 className="font-semibold mt-5 mb-3 text-[var(--color-text)] text-sm">
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

        {/* Feedback + newsletter — pinned above the copyright bar so
            they get decent engagement without hijacking the fold. */}
        <FooterFeedback />

        {/* ── Bottom bar ────────────────────────────────────── */}
        <div className="mt-10 pt-6 border-t border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-text-muted)] text-center">
            &copy; 2026 Civia — platformă civică independentă · Fără reclame · Fără politică · Open-source
          </p>
        </div>
      </div>
    </footer>
  );
}
