import Link from "next/link";
import { MapPin, Mail } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-[var(--color-surface)] border-t border-[var(--color-border)] mt-auto">
      <div className="container-narrow py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-[var(--radius-button)] bg-gradient-to-br from-[var(--color-primary)] to-indigo-900 flex items-center justify-center text-white">
                <MapPin size={18} strokeWidth={2.5} />
              </div>
              <span className="font-[family-name:var(--font-sora)] font-bold text-lg">{SITE_NAME}</span>
            </Link>
            <p className="text-sm text-[var(--color-text-muted)] mb-4 max-w-xs">
              Platformă civică independentă pentru cetățenii Bucureștiului.
            </p>
            <a
              href="mailto:contact@civia.ro"
              className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
            >
              <Mail size={14} /> contact@civia.ro
            </a>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-[var(--color-text)] text-sm">Navigare</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/harti" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">Hărți</Link></li>
              <li><Link href="/sesizari" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">Sesizări</Link></li>
              <li><Link href="/bilete" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">Bilete</Link></li>
              <li><Link href="/statistici" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">Statistici</Link></li>
              <li><Link href="/stiri" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">Știri</Link></li>
              <li><Link href="/istoric" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">Istoric</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-[var(--color-text)] text-sm">Ghiduri</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/ghiduri/ghid-biciclist" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">Biciclist</Link></li>
              <li><Link href="/ghiduri/ghid-vara" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">Vara</Link></li>
              <li><Link href="/ghiduri/ghid-cutremur" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">Cutremur</Link></li>
              <li><Link href="/ghiduri/ghid-transport" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">Transport</Link></li>
              <li><Link href="/cum-functioneaza" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">Cum funcționează primăria</Link></li>
              <li><Link href="/api-docs" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">API dezvoltatori</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-[var(--color-text)] text-sm">Resurse oficiale</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="https://www.pmb.ro" target="_blank" rel="noreferrer" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">pmb.ro</a></li>
              <li><a href="https://stbsa.ro" target="_blank" rel="noreferrer" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">stbsa.ro</a></li>
              <li><a href="https://www.metrorex.ro" target="_blank" rel="noreferrer" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">metrorex.ro</a></li>
              <li><a href="https://data.gov.ro" target="_blank" rel="noreferrer" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">data.gov.ro</a></li>
              <li><a href="https://www.igsu.ro" target="_blank" rel="noreferrer" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">igsu.ro</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--color-border)] flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <p className="text-xs text-[var(--color-text-muted)] max-w-3xl">
            <strong className="text-[var(--color-text)]">Disclaimer:</strong> {SITE_NAME} este o platformă independentă, neafiliată Primăriei Municipiului București sau oricărei autorități locale. Datele afișate sunt agregate din surse publice și comunitate. Pentru informații oficiale, vă rugăm să consultați site-urile instituționale.
          </p>
          <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
            <Link href="/legal/confidentialitate" className="hover:text-[var(--color-primary)]">
              Confidențialitate
            </Link>
            <Link href="/legal/termeni" className="hover:text-[var(--color-primary)]">
              Termeni
            </Link>
            <span className="whitespace-nowrap">© 2026 {SITE_NAME}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
