import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Autentificare eșuată",
  robots: { index: false, follow: false },
};

export default function AuthErrorPage() {
  return (
    <div className="container-narrow py-20 max-w-md text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
        <AlertTriangle size={28} className="text-red-600 dark:text-red-400" />
      </div>
      <h1 className="font-[family-name:var(--font-sora)] text-2xl font-extrabold mb-2">
        Autentificare eșuată
      </h1>
      <p className="text-[var(--color-text-muted)] mb-6">
        Link-ul a expirat sau este invalid. Încearcă din nou.
      </p>
      <Link
        href="/"
        className="inline-flex h-11 px-5 rounded-[var(--radius-xs)] bg-[var(--color-primary)] text-white text-sm font-medium items-center"
      >
        Înapoi la pagina principală
      </Link>
    </div>
  );
}
