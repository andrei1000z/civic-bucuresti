import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Mail, MapPin, Shield, ArrowRight, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Contribuie — Completează baza de date Civia",
  description: "Ajută-ne să colectăm emailurile oficiale ale primăriilor și instituțiilor din toată România. Fiecare contribuție contează.",
  alternates: { canonical: "/contribuie" },
};

export default function ContribuiePage() {
  return (
    <div className="container-narrow py-12 md:py-16">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-primary-soft)] flex items-center justify-center">
          <Heart size={28} className="text-[var(--color-primary)]" />
        </div>
        <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-bold mb-4">
          Construim împreună
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
          Civia funcționează cu date de la comunitate. Ajută-ne să colectăm emailurile oficiale ale primăriilor
          și instituțiilor din toată România — fiecare contribuție face platforma mai utilă pentru toți.
        </p>
      </div>

      {/* Ce puți contribui */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6">
          <Mail size={24} className="text-[var(--color-primary)] mb-3" />
          <h3 className="font-semibold mb-2">Emailuri primării</h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            Știi emailul oficial al primăriei din localitatea ta? Adaugă-l în baza noastră de date.
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            Trebuie să fie pe domeniu oficial (.ro)
          </p>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6">
          <MapPin size={24} className="text-emerald-500 mb-3" />
          <h3 className="font-semibold mb-2">Verificare date</h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            Verifică dacă emailurile existente din județul tău sunt corecte și funcționale.
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            Ajută la calitatea bazei de date
          </p>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6">
          <Shield size={24} className="text-amber-500 mb-3" />
          <h3 className="font-semibold mb-2">Raportare erori</h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            Un email e greșit? O primărie lipsește? Raportează și corectăm.
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            Fiecare corecție ajută
          </p>
        </div>
      </div>

      {/* Cum contribui */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-8 mb-12">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold mb-6">
          Cum contribui
        </h2>
        <div className="space-y-4">
          {[
            {
              step: 1,
              title: "Găsește emailul primăriei",
              desc: "Caută pe site-ul primăriei din localitatea ta (de obicei în secțiunea \"Contact\" sau \"Petiții\"). Emailul trebuie să fie pe domeniu .ro oficial.",
            },
            {
              step: 2,
              title: "Trimite-ne datele",
              desc: "Scrie un email la contact@civia.ro cu: Numele localității, Județul, Emailul primăriei, și opțional: telefonul și site-ul.",
            },
            {
              step: 3,
              title: "Noi verificăm și adăugăm",
              desc: "Verificăm că emailul e funcțional și pe domeniu oficial, apoi îl adăugăm în baza de date. Contribuția ta va fi creditată.",
            },
          ].map((s) => (
            <div key={s.step} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold shrink-0">
                {s.step}
              </div>
              <div>
                <p className="font-semibold">{s.title}</p>
                <p className="text-sm text-[var(--color-text-muted)]">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats + ce lipsește */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[12px] p-6 text-white">
          <h3 className="font-bold text-lg mb-3">Ce avem deja</h3>
          <ul className="space-y-2 text-sm text-white/90">
            <li className="flex items-center gap-2"><CheckCircle2 size={14} /> 42 IPJ-uri cu email verificat</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={14} /> 42 prefecturi</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={14} /> Autorități București (PMB, ALPAB, STB...)</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={14} /> 6 sectoare cu autorități mapate</li>
          </ul>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-[12px] p-6 text-white">
          <h3 className="font-bold text-lg mb-3">Ce ne lipsește</h3>
          <ul className="space-y-2 text-sm text-white/90">
            <li>~3.000 de primării fără email</li>
            <li>Emailuri consilii județene (30+ lipsă)</li>
            <li>Emailuri ISU, DSP, APM per județ</li>
            <li>Poliții locale (doar orașele mari)</li>
            <li>Numere de telefon actualizate</li>
          </ul>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <a
          href="mailto:contact@civia.ro?subject=Contribuție%20date%20Civia&body=Județul:%20%0ALocalitatea:%20%0AEmail%20primărie:%20%0ATelefon:%20%0ASite%20web:%20"
          className="inline-flex items-center gap-2 h-12 px-6 rounded-[8px] bg-[var(--color-primary)] text-white font-semibold hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          <Mail size={18} />
          Trimite contribuția ta
        </a>
        <p className="text-xs text-[var(--color-text-muted)] mt-3">
          Sau deschide un issue pe{" "}
          <a href="https://github.com/andrei1000z/civic-bucuresti" target="_blank" rel="noreferrer" className="text-[var(--color-primary)] hover:underline">
            GitHub
          </a>
        </p>
      </div>
    </div>
  );
}
