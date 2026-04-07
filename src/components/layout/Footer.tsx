import Link from "next/link";
import { MapPin } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";

const linkCls =
  "text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors";

export function Footer() {
  return (
    <footer className="bg-[var(--color-surface)] border-t border-[var(--color-border)] mt-auto">
      <div className="container-narrow py-12">
        {/* ── 5-column grid ─────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Column 1 — Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-[var(--radius-button)] bg-gradient-to-br from-[var(--color-primary)] to-indigo-900 flex items-center justify-center text-white">
                <MapPin size={18} strokeWidth={2.5} />
              </div>
              <span className="font-[family-name:var(--font-sora)] font-bold text-lg">
                {SITE_NAME}
              </span>
            </Link>
            <p className="text-sm text-[var(--color-text-muted)] mb-4 max-w-xs">
              Platformă civică independentă pentru cetățenii din România.
            </p>
          </div>

          {/* Column 2 — Platformă */}
          <div>
            <h4 className="font-semibold mb-3 text-[var(--color-text)] text-sm">
              Platformă
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/sesizari" className={linkCls}>Sesizări</Link></li>
              <li><Link href="/aer" className={linkCls}>Calitate aer</Link></li>
              <li><Link href="/harti" className={linkCls}>Hărți</Link></li>
              <li><Link href="/statistici" className={linkCls}>Statistici</Link></li>
              <li><Link href="/stiri" className={linkCls}>Știri</Link></li>
              <li><Link href="/evenimente" className={linkCls}>Evenimente</Link></li>
            </ul>
          </div>

          {/* Column 3 — Ghiduri */}
          <div>
            <h4 className="font-semibold mb-3 text-[var(--color-text)] text-sm">
              Ghiduri
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/ghiduri/ghid-cetatean" className={linkCls}>Drepturile cetățeanului</Link></li>
              <li><Link href="/ghiduri/ghid-sesizari" className={linkCls}>Ghid sesizări</Link></li>
              <li><Link href="/ghiduri/ghid-biciclist" className={linkCls}>Ghidul biciclistului</Link></li>
              <li><Link href="/ghiduri/ghid-vara" className={linkCls}>Ghid de vară</Link></li>
              <li><Link href="/ghiduri/ghid-cutremur" className={linkCls}>Ghid cutremur</Link></li>
              <li><Link href="/ghiduri/ghid-transport" className={linkCls}>Ghid transport</Link></li>
            </ul>
          </div>

          {/* Column 4 — Mai mult */}
          <div>
            <h4 className="font-semibold mb-3 text-[var(--color-text)] text-sm">
              Mai mult
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/judete" className={linkCls}>Județe</Link></li>
              <li><Link href="/cum-functioneaza" className={linkCls}>Administrația</Link></li>
              <li><Link href="/istoric" className={linkCls}>Istoric</Link></li>
              <li><Link href="/autoritati" className={linkCls}>Autorități</Link></li>
              <li><Link href="/bilete" className={linkCls}>Bilete transport</Link></li>
            </ul>
          </div>

          {/* Column 5 — Legal */}
          <div>
            <h4 className="font-semibold mb-3 text-[var(--color-text)] text-sm">
              Legal
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/legal/confidentialitate" className={linkCls}>Confidențialitate</Link></li>
              <li><Link href="/legal/termeni" className={linkCls}>Termeni</Link></li>
            </ul>
            <h4 className="font-semibold mt-5 mb-3 text-[var(--color-text)] text-sm">
              Resurse oficiale
            </h4>
            <ul className="space-y-2 text-sm">
              <li><a href="https://data.gov.ro" target="_blank" rel="noreferrer" className={linkCls}>data.gov.ro</a></li>
              <li><a href="https://www.anpm.ro" target="_blank" rel="noreferrer" className={linkCls}>anpm.ro</a></li>
              <li><a href="https://www.politiaromana.ro" target="_blank" rel="noreferrer" className={linkCls}>politiaromana.ro</a></li>
              <li><a href="https://www.ghiseul.ro" target="_blank" rel="noreferrer" className={linkCls}>ghiseul.ro</a></li>
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ────────────────────────────────────── */}
        <div className="mt-10 pt-6 border-t border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-text-muted)] text-center">
            &copy; 2026 Civia.ro
          </p>
        </div>
      </div>
    </footer>
  );
}
