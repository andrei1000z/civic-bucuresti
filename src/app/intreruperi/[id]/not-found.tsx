import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-narrow py-20 text-center">
      <div className="text-6xl mb-4">🕵️</div>
      <h1 className="font-[family-name:var(--font-sora)] text-3xl font-extrabold mb-3">
        Întrerupere negăsită
      </h1>
      <p className="text-base text-[var(--color-text-muted)] mb-8 max-w-md mx-auto">
        Entry-ul nu mai există în catalog — poate s-a finalizat sau a fost șters
        de operator. Vezi lista curentă actualizată.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/intreruperi"
          className="inline-flex items-center gap-2 h-11 px-5 rounded-[var(--radius-xs)] bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          <ArrowLeft size={16} /> Toate întreruperile
        </Link>
      </div>
    </div>
  );
}
