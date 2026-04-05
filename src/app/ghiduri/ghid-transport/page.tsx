import type { Metadata } from "next";
import { GhidLayout, Chapter, Callout } from "@/components/ghiduri/GhidLayout";

export const metadata: Metadata = {
  title: "Ghid transport public București",
  description: "Metrou, STB, Ilfov, carduri, abonamente, aplicații și trucuri pentru călătorii eficiente.",
  alternates: { canonical: "/ghiduri/ghid-transport" },
};

const chapters = [
  { id: "operatori", title: "Operatorii de transport" },
  { id: "carduri", title: "Carduri și bilete" },
  { id: "metrou", title: "Metrou — cum folosești Metrorex" },
  { id: "stb", title: "Autobuze, tramvaie, troleibuze" },
  { id: "ilfov", title: "Ilfov & Voluntari" },
  { id: "aplicatii", title: "Aplicații mobile" },
  { id: "sfaturi", title: "Sfaturi pentru călători" },
];

export default function GhidTransportPage() {
  return (
    <GhidLayout
      title="Ghid transport public București"
      subtitle="Cum te descurci cu STB, Metrorex și liniile metropolitane — de la primul bilet la abonament inteligent."
      icon="🚇"
      gradient="from-blue-600 via-indigo-700 to-indigo-900"
      chapters={chapters}
      stats={[
        { label: "Linii STB", value: "200+" },
        { label: "Stații metrou", value: "64" },
        { label: "Bilet single", value: "3 lei" },
      ]}
    >
      <Chapter id="operatori" title="Operatorii de transport" number={1}>
        <p>Transportul public în zona metropolitană București e gestionat de:</p>
        <ul>
          <li><strong>STB S.A.</strong> — autobuze, tramvaie, troleibuze (integrate tarifar).</li>
          <li><strong>Metrorex</strong> — rețeaua de metrou (5 magistrale).</li>
          <li><strong>TPBI (Transport Public Bucuresti-Ilfov)</strong> — linii metropolitane.</li>
          <li><strong>Primăria Voluntari</strong> — linii proprii pentru Ilfov.</li>
        </ul>
        <Callout type="info" title="Integrare tarifară">
          STB-ul a introdus abonamentul integrat cu metroul în 2023. Cu un singur abonament lunar
          poți folosi autobuz + metrou fără bilete separate. Costuri: 150 lei/lună.
        </Callout>
      </Chapter>

      <Chapter id="carduri" title="Carduri și bilete" number={2}>
        <h3>Card Activ STB</h3>
        <ul>
          <li>Gratuit, reîncărcabil</li>
          <li>Se face la ghișee STB cu CI</li>
          <li>Poate avea bilete (pe număr) sau abonament</li>
          <li>Se reîncarcă online sau la chioșcuri</li>
        </ul>

        <h3>Card Metrou</h3>
        <ul>
          <li>10 lei depozit rambursabil</li>
          <li>Se reîncarcă la automate sau ghișee</li>
          <li>Poate avea 1, 2 sau 10 călătorii, sau abonament lunar</li>
        </ul>

        <h3>Plată contactless cu cardul bancar</h3>
        <p>
          Începând cu 2024, la toate barierele de metrou și în autobuzele STB poți plăti direct
          cu cardul bancar contactless. Prețul este același ca biletul single.
        </p>
      </Chapter>

      <Chapter id="metrou" title="Metrou — cum folosești Metrorex" number={3}>
        <h3>Cum intri</h3>
        <ol>
          <li>Apropii cardul sau cardul bancar contactless de bariera automatizată.</li>
          <li>Verde = intrare permisă. Roșu = verifică soldul.</li>
          <li>Nu ai nevoie de validare la ieșire.</li>
        </ol>

        <h3>Cele 5 magistrale</h3>
        <ul>
          <li><strong>M1 (portocaliu):</strong> Pantelimon - Dristor 2 (circulă în buclă)</li>
          <li><strong>M2 (albastru):</strong> Pipera - Berceni</li>
          <li><strong>M3 (roșu):</strong> Anghel Saligny - Preciziei</li>
          <li><strong>M4 (verde):</strong> Gara de Nord - Străulești</li>
          <li><strong>M5 (mov):</strong> Drumul Taberei - Eroilor</li>
        </ul>
        <Callout type="tip" title="Stații de transfer">
          Transferuri importante: Piața Victoriei (M1+M2), Piața Unirii (M1+M2+M3), Eroilor
          (M1+M3+M5), Gara de Nord (M1+M4), Basarab (M1+M4).
        </Callout>
      </Chapter>

      <Chapter id="stb" title="Autobuze, tramvaie, troleibuze" number={4}>
        <h3>Validare</h3>
        <p>
          Urci <strong>pe oricare ușă</strong> și validezi la aparatul de pe perete. La controlor,
          nu ai voie să treci fără validare — amendă 100 lei pe loc sau 20 lei prin poștă în 48h.
        </p>
        <h3>Linii importante</h3>
        <ul>
          <li>Linia 41 (tramvai) — una dintre cele mai aglomerate</li>
          <li>Liniile 1, 21 (tramvaie) — trec prin centru</li>
          <li>Linia 104 — Băneasa</li>
          <li>Linia 232 — directă către Aeroport Otopeni</li>
          <li>Liniile N112, N116, N125 — nocturne</li>
        </ul>
      </Chapter>

      <Chapter id="ilfov" title="Ilfov & Voluntari" number={5}>
        <ul>
          <li><strong>Linia 460</strong> — Voluntari ↔ București (Piața Romană)</li>
          <li><strong>Linia 780</strong> — Buftea ↔ Gara de Nord</li>
          <li><strong>Linia 423</strong> — Pipera ↔ Voluntari</li>
        </ul>
        <p>
          Biletele se pot cumpăra la bord (bar code) sau cu card. Nu sunt integrate complet cu
          STB — verifică tarifele separate.
        </p>
      </Chapter>

      <Chapter id="aplicatii" title="Aplicații mobile" number={6}>
        <ul>
          <li><strong>24pay</strong> — aplicația oficială STB. Cumperi bilete, abonamente, vezi orarul.</li>
          <li><strong>M24</strong> — Metrorex. Trasee, bilete, rute.</li>
          <li><strong>Moovit</strong> — aplicație internațională, planificare trasee.</li>
          <li><strong>Google Maps</strong> — include linii STB+Metrorex actualizate.</li>
          <li><strong>Info STB</strong> — ore live de sosire în stații (crowd-sourced).</li>
        </ul>
      </Chapter>

      <Chapter id="sfaturi" title="Sfaturi pentru călători" number={7}>
        <ul>
          <li>La orele de vârf (07:30-09:00, 17:00-19:00), alege metrou în loc de autobuz — e mai predictibil.</li>
          <li>Abonamentul lunar devine economic de la ~35 călătorii/lună.</li>
          <li>Verifică orarul în weekend — multe linii au frecvențe reduse.</li>
          <li>Controlează soldul cardului înainte să urci (nu poți reîncărca în autobuz).</li>
          <li>Nu pui bicicleta în autobuz/tramvai — doar pliabilă și împachetată.</li>
        </ul>
        <Callout type="warning" title="Fraudă comună">
          Dacă cineva îți oferă un card Activ &quot;la preț bun&quot; în stradă, probabil e furat sau
          blocat. Fă-ți propriul card gratuit la ghișeu.
        </Callout>
      </Chapter>
    </GhidLayout>
  );
}
