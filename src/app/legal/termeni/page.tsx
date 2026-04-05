import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Termeni și condiții",
  description: "Termenii de utilizare a platformei Civia.",
};

export default function TermeniPage() {
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
          Termeni și condiții
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-8">
          Ultima actualizare: 5 aprilie 2026
        </p>

        <h2>1. Despre serviciu</h2>
        <p>
          Civia este o platformă gratuită care ajută cetățenii să formuleze și să
          urmărească sesizările către autoritățile locale. Nu suntem afiliați PMB sau altor
          instituții publice.
        </p>

        <h2>2. Conduita utilizatorilor</h2>
        <p>Prin folosirea platformei, te angajezi să:</p>
        <ul>
          <li>Furnizezi informații adevărate și verificabile</li>
          <li>Nu postezi conținut calomnios, vulgar sau ilegal</li>
          <li>Nu folosești platforma pentru spam sau abuz</li>
          <li>Respecți drepturile altor utilizatori</li>
        </ul>

        <h2>3. Responsabilitate</h2>
        <p>
          Tu ești responsabil pentru conținutul sesizărilor tale. Platforma doar facilitează
          comunicarea — nu verificăm acurateția faptelor prezentate. Sesizările false sau abuzive
          vor fi șterse.
        </p>

        <h2>4. Drepturi de proprietate</h2>
        <p>
          Păstrezi drepturile asupra conținutului tău (texte, fotografii). Ne acorzi o licență
          non-exclusivă să afișăm și să arhivăm conținutul pe platformă.
        </p>

        <h2>5. Moderare</h2>
        <p>
          Rezervăm dreptul de a șterge sesizări, comentarii sau conturi care încalcă acești
          termeni, fără notificare prealabilă.
        </p>

        <h2>6. Limitarea răspunderii</h2>
        <p>
          Platforma este oferită "as is". Nu garantăm că autoritățile vor rezolva sesizările.
          Nu suntem responsabili pentru acțiunile sau inacțiunile administrației publice.
        </p>

        <h2>7. Modificări</h2>
        <p>
          Putem modifica acești termeni oricând. Modificările majore vor fi anunțate prin email
          (dacă ai cont).
        </p>

        <h2>8. Legea aplicabilă</h2>
        <p>
          Se aplică legislația română. Orice dispute se rezolvă la instanțele competente din
          București.
        </p>
      </article>
    </div>
  );
}
