import type { Metadata } from "next";
import { GhidLayout, Chapter, Callout } from "@/components/ghiduri/GhidLayout";

export const metadata: Metadata = {
  title: "Ghidul biciclistului în România",
  description: "Ghid complet pentru bicicliști: cum alegi bicicleta, echipament, reguli, trasee, întreținere.",
  alternates: { canonical: "/ghiduri/ghid-biciclist" },
};

const chapters = [
  { id: "de-ce", title: "De ce bicicletă?" },
  { id: "alegere", title: "Cum îți alegi bicicleta după buget" },
  { id: "echipament", title: "Echipamentul obligatoriu și recomandat" },
  { id: "reguli", title: "Regulile de circulație" },
  { id: "piste", title: "Cum mergi pe pistele din orașul tău" },
  { id: "transport", title: "Bicicleta în transport în comun" },
  { id: "parcare", title: "Unde parchezi bicicleta" },
  { id: "intretinere", title: "Întreținere de bază" },
  { id: "aplicatii", title: "Aplicații utile" },
  { id: "accident", title: "Ce faci dacă ai accident" },
];

export default function GhidBiciclistPage() {
  return (
    <GhidLayout
      title="Ghidul biciclistului în România"
      subtitle="De la alegerea primei biciclete, până la circulația sigură în trafic. Tot ce trebuie să știi."
      icon="🚲"
      gradient="from-emerald-600 via-teal-700 to-emerald-900"
      chapters={chapters}
      stats={[
        { label: "Cod Rutier", value: "Obligatoriu" },
        { label: "Bicicliști estimați", value: "500k+" },
        { label: "Parcare bicicletă", value: "0 lei" },
      ]}
    >
      <Chapter id="de-ce" title="De ce bicicletă?" number={1}>
        <p>
          Orașele din România se confruntă cu trafic congestionat, lipsa parcărilor,
          poluare și costuri crescute. Bicicleta rezolvă majoritatea acestor probleme.
        </p>
        <p>Sunt patru motive principale pentru care merită să începi:</p>
        <ul>
          <li><strong>Sănătate:</strong> 30 de minute de mers pe bicicletă zilnic reduc riscul cardiovascular cu 50%.</li>
          <li><strong>Economii:</strong> eliminați RCA, revizii, carburant, taxe parcare — aproximativ 5.000-8.000 lei pe an.</li>
          <li><strong>Timp:</strong> pe distanțe sub 7 km, bicicleta e aproape întotdeauna mai rapidă decât mașina în oraș.</li>
          <li><strong>Mediu:</strong> 0 emisii, reduci ambuteiajele — și pentru ceilalți.</li>
        </ul>
        <Callout type="info" title="Situația din România">
          Infrastructura pentru bicicliști e în dezvoltare în majoritatea orașelor. Există zone
          cu piste dedicate, dar și zone periculoase (intersecții mari, zone cu linii de tramvai).
          Cu pregătire potrivită, poți pedala sigur oriunde.
        </Callout>
      </Chapter>

      <Chapter id="alegere" title="Cum îți alegi bicicleta după buget" number={2}>
        <p>
          Bicicleta potrivită depinde de unde vei merge (centru / zone cu pietre / trasee lungi),
          de cât de des, și — evident — de bugetul disponibil.
        </p>

        <h3>Sub 1.000 lei — entry level city</h3>
        <p>
          Biciclete urbane simple, fără suspensie, cu 6-7 viteze. Branduri recomandate:{" "}
          <strong>DHS</strong>, <strong>Velors</strong>, <strong>Ferrini</strong>. Sunt perfecte
          pentru deplasări scurte pe asfalt.
        </p>
        <Callout type="warning" title="De evitat">
          Bicicletele de 600-700 lei din hipermarket au adesea componente foarte slabe care se
          strică în câteva luni. Caută măcar frâne pe jantă V-brake și un cadru din aluminiu, nu
          oțel greu.
        </Callout>

        <h3>1.000 - 2.500 lei — city mid-range</h3>
        <p>
          Aici începi să ai componente decente, cadru ușor, posibil chiar furca cu suspensie.
          Branduri:{" "}
          <strong>Cube</strong>, <strong>Ghost</strong>, <strong>B&apos;twin (Decathlon)</strong>.
          Pentru străzile imperfecte din orașele românești, acest buget oferă cel mai bun raport
          calitate-preț.
        </p>

        <h3>2.500 - 5.000 lei — sport / hibrid</h3>
        <p>
          Biciclete hibrid sau cu transmisie de nivel mediu (Shimano Alivio/Deore). Branduri:{" "}
          <strong>Trek</strong> (gama FX), <strong>Giant</strong> (Escape), <strong>Specialized</strong>{" "}
          (Sirrus). Pentru navetiști serioși și trasee mai lungi în afara orașului.
        </p>

        <h3>Peste 5.000 lei — performanță</h3>
        <p>
          Intri în zona bicicletelor sport adevărate: carbon sau aluminiu premium, transmisie
          Shimano XT/SLX sau SRAM GX+, roți decente. Branduri:{" "}
          <strong>Trek Domane</strong>, <strong>Cannondale Quick/SuperSix</strong>,{" "}
          <strong>Scott Speedster</strong>. Alegi asta doar dacă rulezi 100+ km săptămânal.
        </p>

        <div className="overflow-x-auto my-6">
          <table className="w-full border-collapse bg-[var(--color-surface)] rounded-[12px] overflow-hidden border border-[var(--color-border)] text-sm">
            <thead>
              <tr className="bg-[var(--color-surface-2)]">
                <th className="text-left p-3 font-semibold">Tip</th>
                <th className="text-left p-3 font-semibold">Teren recomandat</th>
                <th className="text-left p-3 font-semibold">Buget</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="p-3">City entry</td><td className="p-3">Asfalt neted, centru</td><td className="p-3 font-semibold">&lt; 1.000 lei</td></tr>
              <tr className="bg-[var(--color-surface-2)]/50"><td className="p-3">City mid</td><td className="p-3">Oraș + trotuare ocazional</td><td className="p-3 font-semibold">1.000 - 2.500 lei</td></tr>
              <tr><td className="p-3">Hibrid / trekking</td><td className="p-3">Oraș + trasee periurbane</td><td className="p-3 font-semibold">2.500 - 5.000 lei</td></tr>
              <tr className="bg-[var(--color-surface-2)]/50"><td className="p-3">Sport / gravel</td><td className="p-3">Trasee lungi, curse</td><td className="p-3 font-semibold">&gt; 5.000 lei</td></tr>
            </tbody>
          </table>
        </div>

        <Callout type="tip" title="Second hand">
          Pe OLX și grupurile de Facebook dedicate bicicliștilor din zona ta găsești biciclete
          second-hand la 60-70% din preț. Verifică lanțul, roțile, cadrul pentru fisuri.
        </Callout>
      </Chapter>

      <Chapter id="echipament" title="Echipamentul obligatoriu și recomandat" number={3}>
        <h3>Esențiale — nu pleci de acasă fără</h3>
        <ul>
          <li>
            <strong>Cască:</strong> nu este obligatorie legal pentru adulți, dar <em>moral</em> da.
            Caută una certificată CE EN 1078. Preț: 80-400 lei. Modele bune: Uvex Active, Giro
            Register.
          </li>
          <li>
            <strong>Lumini față & spate:</strong> <strong>obligatorii legal</strong> noaptea. LED
            USB reîncărcabile costă 60-150 lei setul. Amendă: până la 870 lei fără lumini.
          </li>
          <li>
            <strong>Lacăt:</strong> un U-lock Kryptonite sau Abus costă 150-300 lei și salvează
            bicicletă de 2.000 lei. Cablurile simple se taie în 15 secunde.
          </li>
          <li>
            <strong>Pompă portabilă + kit reparații:</strong> 80-150 lei. Include cheie dedicată, scule
            alen, plasture camere.
          </li>
        </ul>

        <h3>Recomandate</h3>
        <ul>
          <li>Vestă reflectorizantă sau bandă pe încheietură (20-50 lei).</li>
          <li>Mănuși — protejează palmele la cădere și amortizează vibrațiile.</li>
          <li>Ochelari — praf, insecte, soare.</li>
          <li>Sonerie (obligatorie tehnic, dar prea rar verificată).</li>
        </ul>

        <Callout type="warning" title="Lacăt — cum îl folosești">
          Blochează întotdeauna <strong>cadrul + roata față</strong> de un obiect fix (rastel,
          semn, gard metalic). Nu lega doar de roata spate — se poate scoate. Nu lega de
          copaci tineri sau obiecte care se pot desprinde.
        </Callout>
      </Chapter>

      <Chapter id="reguli" title="Regulile de circulație" number={4}>
        <p>Conform Codului Rutier român, biciclistul este participant la trafic și are reguli clare.</p>

        <h3>Pe ce drum poți merge?</h3>
        <ol>
          <li><strong>Pistă de bicicletă</strong> — obligatoriu dacă există.</li>
          <li><strong>Carosabil</strong> — în banda din dreapta, cât mai la dreapta.</li>
          <li><strong>Trotuar</strong> — în mod excepțional, doar când carosabilul e periculos și cu viteză redusă.</li>
        </ol>

        <h3>Prioritate la intersecții</h3>
        <p>
          Regulile sunt aceleași ca la autovehicule: semafor, semne, dreapta strânsă. Fii vizibil
          și previzibil. <strong>Nu încerca să te strecori pe dreapta mașinilor când semaforizează
          dreapta</strong> — este una dintre cele mai periculoase manevre.
        </p>

        <h3>Semnalizare cu mâna</h3>
        <ul>
          <li><strong>Stânga:</strong> mâna stângă întinsă orizontal.</li>
          <li><strong>Dreapta:</strong> mâna dreaptă întinsă orizontal (SAU mâna stângă cu cotul în sus).</li>
          <li><strong>Oprire:</strong> mâna stângă în sus, cu palma deschisă.</li>
        </ul>

        <h3>Amenzi posibile</h3>
        <ul>
          <li>Fără lumini noaptea: 435-870 lei</li>
          <li>Alcoolemie peste 0.8‰: 870-2175 lei + dosar penal</li>
          <li>Trecere pe roșu: 290-580 lei</li>
          <li>Circulație pe trotuar (fără motiv): 145-290 lei</li>
        </ul>

        <Callout type="warning" title="Șinele de tramvai — pericol real">
          În orașele cu tramvaie, șinele sunt paralele cu direcția ta. <strong>Traversează-le
          întotdeauna la 90°</strong>. Dacă le iei oblic, roata îți intră pe șină și cazi instant.
          Fii atent pe bulevardele cu linii de tramvai.
        </Callout>
      </Chapter>

      <Chapter id="piste" title="Cum mergi pe pistele din orașul tău" number={5}>
        <p>
          Tot mai multe orașe din România investesc în infrastructură pentru bicicliști — piste
          dedicate, trasee prin parcuri și zone cu trafic redus.
        </p>

        <h3>Cum găsești cele mai bune trasee</h3>
        <ul>
          <li>
            <strong>Google Maps (modul Bicicletă):</strong> arată pistele dedicate și rutele
            recomandate din orașul tău.
          </li>
          <li>
            <strong>Komoot / Bikemap:</strong> rute create de alți bicicliști, cu recenzii și
            niveluri de dificultate.
          </li>
          <li>
            <strong>Parcurile locale:</strong> cele mai sigure trasee sunt de obicei prin parcuri,
            complet separate de traficul auto.
          </li>
          <li>
            <strong>Grupuri locale de bicicliști:</strong> întreabă comunitatea din zona ta pentru
            cele mai sigure rute zilnice.
          </li>
        </ul>

        <h3>Pericole de evitat</h3>
        <ul>
          <li>Mașini parcate pe pistă (raportează la poliția locală sau pe această platformă)</li>
          <li>Uși deschise brusc de pasageri — păstrează 1 metru distanță de mașinile parcate</li>
          <li>Pietoni care traversează fără să se uite — ai grijă și sună din sonerie</li>
          <li>Grătare metalice ude — sunt foarte alunecoase</li>
        </ul>
      </Chapter>

      <Chapter id="transport" title="Bicicleta în transport în comun" number={6}>
        <h3>Metrou</h3>
        <p>
          Bicicletele <strong>pliabile</strong> sunt permise oricând. Bicicletele normale sunt
          de regulă permise <strong>doar în afara orelor de vârf</strong>. Nu plătești suplimentar,
          dar te porți civilizat. Verifică regulamentul operatorului local.
        </p>

        <h3>Autobuze și tramvaie</h3>
        <p>
          În general <strong>nu este permis</strong> să urci cu bicicleta normală. Doar cele pliabile și
          împachetate pot fi admise, la aprecierea conducătorului.
        </p>

        <h3>Trenuri CFR</h3>
        <p>
          CFR are vagoane speciale pentru biciclete pe multe rute. Biletul pentru bicicletă
          se ia separat (10-20 lei). Verifică disponibilitatea pe ruta dorită la ghișeu sau online.
        </p>
      </Chapter>

      <Chapter id="parcare" title="Unde parchezi bicicleta" number={7}>
        <p>
          Majoritatea primăriilor au instalat rastele în zonele centrale și lângă instituții publice.
          Caută rastele în aceste locuri:
        </p>
        <ul>
          <li>Piețele centrale și zonele pietonale</li>
          <li>Lângă stațiile de metrou și autogări</li>
          <li>În fața centrelor comerciale</li>
          <li>La intrările parcurilor mari</li>
          <li>Lângă universități și instituții publice</li>
          <li>La gări și stații de tren</li>
        </ul>

        <Callout type="tip" title="Reguli de parcare inteligentă">
          <p>
            1. <strong>Cadrul + roata față</strong> legate de rastel cu U-lock.
          </p>
          <p>
            2. Alege locuri <strong>vizibile</strong>, cu trafic pietonal. Furții nu lucrează cu public.
          </p>
          <p>
            3. Nu lăsa accesorii detașabile (lumini, telefon, sacoșă) pe bicicletă.
          </p>
        </Callout>
      </Chapter>

      <Chapter id="intretinere" title="Întreținere de bază" number={8}>
        <p>
          O bicicletă bine întreținută merge mai bine, mai sigur și mai mult timp. Nu ai nevoie
          să fii mecanic — aceste 4 lucruri sunt suficiente:
        </p>
        <ol>
          <li>
            <strong>Presiunea anvelopelor:</strong> verifică săptămânal. Pe flancul anvelopei e scris PSI-ul
            recomandat (tipic: 40-60 PSI pentru city, 80-110 pentru șosea).
          </li>
          <li>
            <strong>Lanțul:</strong> curăță și unge la 2-3 săptămâni. Folosește lubrifiant dedicat
            (20-40 lei), nu ulei de motor sau WD-40.
          </li>
          <li>
            <strong>Frânele:</strong> verifică plăcuțele lunar. Dacă fac zgomot sau simți că frânează
            slab, schimbă-le.
          </li>
          <li>
            <strong>Roțile:</strong> învârte-le pe loc. Trebuie să fie drepte, fără &quot;opturi&quot; vizibile.
          </li>
        </ol>

        <Callout type="info" title="Când mergi la service">
          <p>
            - Anual, cam primăvara, pentru revizie completă (100-200 lei).
          </p>
          <p>
            - Imediat dacă lanțul sare, frânele nu mai țin, cadrul are o crăpătură.
          </p>
          <p>
            - Caută un service de biciclete local cu recenzii bune pe Google Maps.
          </p>
        </Callout>
      </Chapter>

      <Chapter id="aplicatii" title="Aplicații utile" number={9}>
        <ul>
          <li><strong>Komoot</strong> — rute și planificare, cea mai bună pentru începători.</li>
          <li><strong>Strava</strong> — tracking performanțe, comunitate, segmente populare.</li>
          <li><strong>Google Maps</strong> — activează modul Bicicletă. Funcționează în toate orașele din România.</li>
          <li><strong>Bikemap</strong> — rute construite de alți bicicliști.</li>
          <li><strong>OsmAnd</strong> — hărți offline, gratuite, cu straturi pentru piste.</li>
        </ul>

        <h3>Comunități de bicicliști</h3>
        <ul>
          <li>Grupuri locale de Facebook pentru bicicliștii din orașul tău — caută &quot;Bicicliști [orașul tău]&quot;.</li>
          <li>Asociații locale pentru mobilitate urbană — există în majoritatea orașelor mari.</li>
          <li>&quot;Critical Mass&quot; — ieșiri în masă organizate în mai multe orașe din România.</li>
        </ul>
      </Chapter>

      <Chapter id="accident" title="Ce faci dacă ai accident" number={10}>
        <h3>Pași imediat după accident</h3>
        <ol>
          <li><strong>Verifică-ți starea.</strong> Dacă poți — mută-te în siguranță.</li>
          <li><strong>Sună 112</strong> dacă există răniți sau pagube materiale.</li>
          <li><strong>Pozează totul</strong> — poziția bicicletei, mașinilor, numere, pagubele.</li>
          <li><strong>Schimbă datele</strong> cu șoferul: nume, CI, nr mașină, RCA, telefon.</li>
          <li><strong>Identifică martori</strong> — pot fi esențiali.</li>
          <li><strong>Nu accepta &quot;rezolvări pe loc&quot;</strong> decât pentru pagube foarte mici.</li>
        </ol>

        <Callout type="warning" title="Atenție">
          Dacă ești rănit, <strong>nu refuza ambulanța</strong> pentru orgoliu. Un control medical
          e gratuit și documentează accidentul în caz de complicații ulterioare.
        </Callout>

        <h3>Asigurare bicicletă</h3>
        <p>
          Nu e obligatorie dar e utilă. Costă 80-250 lei pe an și acoperă: furt, avarii, răspundere
          civilă, uneori și asistență medicală. Companiile populare: Groupama, Omniasig, Allianz.
        </p>

        <h3>Contestare amendă sau decizie</h3>
        <p>
          Dacă ai primit o amendă pe care o consideri nedreaptă, ai 15 zile să faci plângere
          contravențională la judecătorie. E gratuit și de multe ori se câștigă.
        </p>
      </Chapter>
    </GhidLayout>
  );
}
