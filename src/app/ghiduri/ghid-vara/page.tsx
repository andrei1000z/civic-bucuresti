import type { Metadata } from "next";
import { GhidLayout, Chapter, Callout } from "@/components/ghiduri/GhidLayout";

export const metadata: Metadata = {
  title: "Ghid de vară — cum supraviețuiești caniculei",
  description: "Cod roșu, hidratare, surse de apă gratuită, parcuri umbroase și cum ajuți persoanele vulnerabile.",
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
      subtitle="Bucureștiul ajunge la 42°C vara. Iată cum treci peste fără probleme de sănătate."
      icon="☀️"
      gradient="from-amber-500 via-orange-600 to-red-700"
      chapters={chapters}
      stats={[
        { label: "Max istoric București", value: "42.4°C" },
        { label: "Fântâni gratuite", value: "10+" },
        { label: "Parcuri mari", value: "7" },
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
          <p>- Autoritățile deschid puncte de prim-ajutor termic în parcuri.</p>
        </Callout>
        <h3>Cum primești alertele</h3>
        <ul>
          <li>Aplicația <strong>RO-Alert</strong> (obligatorie pe telefoanele din România)</li>
          <li>SMS automat de la operatorii telecom când ești în zona afectată</li>
          <li>Aplicația <strong>DIGI Alerte</strong> sau INFP Alert</li>
          <li>Site-ul <a href="https://www.meteoromania.ro" target="_blank" rel="noreferrer">meteoromania.ro</a></li>
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
          PMB a instalat fântâni arteziene în principalele zone publice. Apa e potabilă,
          verificată periodic de ApaNova.
        </p>
        <ul>
          <li>Parcul Cișmigiu — fântâna centrală</li>
          <li>Parcul Herăstrău — intrări multiple</li>
          <li>Parcul Tineretului — lângă terenurile de joacă</li>
          <li>Parcul IOR — aleea centrală</li>
          <li>Parcul Carol — lângă Mausoleu</li>
          <li>Piața Universității — lângă Banca Națională</li>
          <li>Piața Romană — în mijlocul scuarului</li>
          <li>Bulevardul Unirii — pe mijloc</li>
          <li>Parcul Circului — intrarea din Bd. Aviatorilor</li>
          <li>Piața Constituției — în fața Palatului Parlamentului</li>
        </ul>
      </Chapter>

      <Chapter id="parcuri" title="Parcuri cu umbră recomandate" number={4}>
        <p>
          Nu toate parcurile sunt la fel — unele au mai mulți arbori maturi care oferă umbră
          reală. Cele mai bune 4 pentru vara:
        </p>
        <ul>
          <li>
            <strong>Herăstrău (Regele Mihai I)</strong> — 110 ha, cea mai multă umbră și lacul.
          </li>
          <li>
            <strong>IOR (Titan)</strong> — alei bogate în copaci maturi, lac.
          </li>
          <li>
            <strong>Tineretului</strong> — 80 ha, multe zone umbrite.
          </li>
          <li>
            <strong>Carol I</strong> — istoric, umbră densă de platani.
          </li>
        </ul>
      </Chapter>

      <Chapter id="piscine" title="Piscine publice" number={5}>
        <p>Prețuri actuale pentru sezonul estival:</p>
        <ul>
          <li><strong>Complexul Lia Manoliu</strong> — 30-40 lei ziua</li>
          <li><strong>Sala Polivalentă (exterior)</strong> — 25-35 lei</li>
          <li><strong>Bazinul Olimpic Floreasca</strong> — 35 lei</li>
          <li><strong>Ștrand Băneasa</strong> — 45-60 lei</li>
        </ul>
        <Callout type="info" title="Card cetățean">
          Unele primării de sector oferă acces redus sau gratuit la piscine pentru copii sub 14
          ani și pensionari. Întreabă la primăria ta.
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
