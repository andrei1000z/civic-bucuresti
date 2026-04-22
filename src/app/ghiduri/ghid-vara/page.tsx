import type { Metadata } from "next";
import { GhidLayout, Chapter, Callout } from "@/components/ghiduri/GhidLayout";

export const metadata: Metadata = {
  title: "Ghid de vară — cum supraviețuiești caniculei",
  description: "Cod roșu, hidratare, surse de apă gratuită, parcuri umbroase și cum ajuți persoanele vulnerabile.",
  alternates: { canonical: "/ghiduri/ghid-vara" },
};

const chapters = [
  { id: "cod-rosu", title: "Ce e codul roșu de caniculă" },
  { id: "hidratare", title: "Hidratare și protecție" },
  { id: "apa", title: "Surse de apă gratuită" },
  { id: "parcuri", title: "Parcuri cu umbră" },
  { id: "piscine", title: "Piscine publice" },
  { id: "vulnerabili", title: "Cum ajuți persoanele vulnerabile" },
];

export default function GhidVaraPage() {
  return (
    <GhidLayout
      title="Ghid de vară — cum supraviețuiești caniculei"
      subtitle="Temperaturi de peste 40°C în multe zone ale României. Iată cum treci peste fără probleme de sănătate."
      icon="☀️"
      gradient="from-amber-500 via-orange-600 to-red-700"
      chapters={chapters}
      stats={[
        { label: "Max istoric România", value: "44.5°C" },
        { label: "Fântâni în parcuri", value: "Verifică local" },
        { label: "Telefon urgențe", value: "112" },
      ]}
    >
      <Chapter id="cod-rosu" title="Ce e codul roșu de caniculă" number={1}>
        <p>
          ANM (Administrația Națională de Meteorologie) emite coduri de caniculă bazate pe
          temperatura aerului și umiditate:
        </p>
        <ul>
          <li><strong>Cod galben:</strong> temperatura depășește 35°C cel puțin 2 zile consecutive.</li>
          <li><strong>Cod portocaliu:</strong> temperatura depășește 37°C minimum 3 zile consecutive.</li>
          <li><strong>Cod roșu:</strong> temperatura depășește 39°C + nopți tropicale (peste 23°C). Se cheamă pericol maxim.</li>
        </ul>
        <Callout type="warning" title="Ce înseamnă cod roșu pentru tine">
          <p>- Evită deplasările între 11:00-18:00.</p>
          <p>- Nu faci efort fizic afară.</p>
          <p>- Fii foarte atent la copii și vârstnici.</p>
          <p>- Autoritățile locale deschid puncte de prim-ajutor termic în parcuri și instituții publice.</p>
        </Callout>
        <h3>Cum primești alertele</h3>
        <ul>
          <li>Aplicația <strong>RO-Alert</strong> (obligatorie pe telefoanele din România)</li>
          <li>SMS automat de la operatorii telecom când ești în zona afectată</li>
          <li>Aplicația <strong>DIGI Alerte</strong> sau INFP Alert</li>
          <li>Site-ul <a href="https://www.meteoromania.ro" target="_blank" rel="noopener noreferrer">meteoromania.ro</a></li>
        </ul>
      </Chapter>

      <Chapter id="hidratare" title="Hidratare și protecție" number={2}>
        <p>
          Corpul unui adult sedentar pierde 1.5-2L de apă zilnic doar prin transpirație și
          respirație. Într-o zi caniculară cantitatea crește la 3-4L.
        </p>
        <h3>Reguli de hidratare</h3>
        <ul>
          <li>Bea <strong>300-500 ml la fiecare oră</strong>, nu 2L odată.</li>
          <li>Evită alcoolul și cofeina — deshidratează.</li>
          <li>Bea apă plată, apă minerală, ceai răcit, supă rece.</li>
          <li>Sucurile carbogazoase și berea nu hidratează eficient.</li>
        </ul>
        <h3>Îmbrăcăminte</h3>
        <ul>
          <li>Culori deschise (alb, bej, galben pal)</li>
          <li>Materiale naturale (bumbac, in)</li>
          <li>Pălărie cu bor larg sau cască/șapcă</li>
          <li>Ochelari de soare cu protecție UV 400</li>
        </ul>
        <Callout type="tip" title="Semne de deshidratare">
          Ameţeală, cap uscat, urină închisă la culoare, oboseală bruscă. Dacă apar, mergi
          imediat la umbră, bea apă cu o linguriță de sare și puțin zahăr.
        </Callout>
      </Chapter>

      <Chapter id="apa" title="Surse de apă gratuită" number={3}>
        <p>
          Multe primării au instalat fântâni arteziene în parcuri și zone publice centrale.
          Apa este potabilă, verificată periodic de operatorul local de apă.
        </p>
        <h3>Unde găsești apă gratuită</h3>
        <ul>
          <li>Fântâni publice din parcurile centrale ale orașului</li>
          <li>Puncte de hidratare amenajate de primărie în perioadele de caniculă</li>
          <li>Instituții publice (primărie, bibliotecă, muzee) — poți cere un pahar de apă</li>
          <li>Biserici și lăcașuri de cult — multe au fântâni în curte</li>
          <li>Piețe agroalimentare — au de regulă robinete publice</li>
        </ul>
        <Callout type="tip" title="Verifică pe site-ul primăriei">
          În perioadele de caniculă, multe primării publică o hartă cu punctele de distribuție
          gratuită a apei și cu centrele de răcire. Urmărește anunțurile locale.
        </Callout>
      </Chapter>

      <Chapter id="parcuri" title="Parcuri cu umbră recomandate" number={4}>
        <p>
          Nu toate parcurile sunt la fel — unele au mai mulți arbori maturi care oferă umbră
          reală. Caută parcuri cu aceste caracteristici:
        </p>
        <ul>
          <li>
            <strong>Arbori maturi și deși:</strong> parcurile mai vechi au de obicei platani, tei
            și stejari care oferă umbră densă.
          </li>
          <li>
            <strong>Prezența apei:</strong> parcurile cu lac sau râu sunt cu câteva grade mai
            răcoroase în perioadele de caniculă.
          </li>
          <li>
            <strong>Zone cu iarbă:</strong> iarba reflectă mai puțină căldură decât betonul sau
            asfaltul — caută zone verzi.
          </li>
          <li>
            <strong>Fântâni și jocuri de apă:</strong> excelente pentru copii și pentru a te
            răcori rapid.
          </li>
        </ul>
      </Chapter>

      <Chapter id="piscine" title="Piscine publice" number={5}>
        <p>
          Majoritatea orașelor mari din România au cel puțin o piscină publică sau un ștrand.
          Prețurile variază de obicei între 20 și 60 lei pe zi.
        </p>
        <h3>Cum afli ce opțiuni ai</h3>
        <ul>
          <li>Verifică site-ul primăriei locale pentru lista piscinelor și ștrandurilor publice</li>
          <li>Caută pe Google Maps &quot;piscină publică&quot; sau &quot;ștrand&quot; în zona ta</li>
          <li>Cluburile sportive municipale au adesea prețuri accesibile</li>
          <li>Unele primării oferă acces gratuit pentru copii și pensionari în perioadele de caniculă</li>
        </ul>
        <Callout type="info" title="Reduceri și gratuități">
          Prin lege, primăriile pot oferi acces redus sau gratuit la piscine pentru copii sub 14
          ani și pensionari. Întreabă la primăria ta sau la direcția de sport locală.
        </Callout>
      </Chapter>

      <Chapter id="vulnerabili" title="Cum ajuți persoanele vulnerabile" number={6}>
        <h3>Vârstnici</h3>
        <ul>
          <li>Sună-i zilnic, verifică dacă beau suficientă apă.</li>
          <li>Adu-le fructe (pepene, castraveți, roșii).</li>
          <li>Verifică că au ventilator/AC funcțional.</li>
          <li>Dacă sunt singuri, lasă informația la vecini să verifice și ei.</li>
        </ul>
        <h3>Copii</h3>
        <ul>
          <li>Nu-i lăsa să se joace afară 11:00-18:00.</li>
          <li>Loțiune cu SPF 50+ reaplicată la 2 ore.</li>
          <li>Hidratează înainte să le fie sete.</li>
        </ul>
        <h3>Animale</h3>
        <ul>
          <li>
            <strong>Niciodată nu lăsa câinele în mașină</strong> — 10 minute la 30°C afară înseamnă
            50°C în habitaclu.
          </li>
          <li>Plimbările dimineața devreme sau seara târziu.</li>
          <li>Asfaltul fierbinte arde labele — atinge-l cu palma 5 secunde. Dacă nu rezisti, nu
            poate nici câinele.</li>
        </ul>
        <Callout type="warning" title="Sună 112 pentru">
          Persoane în stare de confuzie pe stradă în caniculă, copii/animale închise în mașini,
          bătrâni care nu răspund la ușă de mai multe zile.
        </Callout>
      </Chapter>
    </GhidLayout>
  );
}
