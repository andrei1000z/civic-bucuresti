import type { Metadata } from "next";
import { GhidLayout, Chapter, Callout } from "@/components/ghiduri/GhidLayout";

export const metadata: Metadata = {
  title: "Ghid transport public în România",
  description: "Cum folosești transportul public local: bilete, abonamente, aplicații, reduceri și cum raportezi probleme.",
  alternates: { canonical: "/ghiduri/ghid-transport" },
};

const chapters = [
  { id: "operator", title: "Cum afli cine operează în zona ta" },
  { id: "bilete", title: "Tipuri de bilete și abonamente" },
  { id: "contactless", title: "Plata contactless" },
  { id: "aplicatii", title: "Aplicații pentru transport public" },
  { id: "sfaturi", title: "Sfaturi pentru călătorii eficiente" },
  { id: "probleme", title: "Cum raportezi probleme" },
  { id: "reduceri", title: "Reduceri și gratuități legale" },
];

export default function GhidTransportPage() {
  return (
    <GhidLayout
      title="Ghid transport public în România"
      subtitle="Tot ce trebuie să știi despre transportul public local: de la primul bilet la abonament, aplicații și drepturi."
      icon="🚇"
      gradient="from-blue-600 via-indigo-700 to-indigo-900"
      chapters={chapters}
      stats={[
        { label: "Orașe cu transport public", value: "40+" },
        { label: "Drept la reduceri", value: "Prin lege" },
        { label: "Aplicații utile", value: "5+" },
      ]}
    >
      <Chapter id="operator" title="Cum afli cine operează în zona ta" number={1}>
        <p>
          Fiecare localitate sau zonă metropolitană are un operator de transport public local.
          Acesta poate fi o societate a primăriei sau un operator privat contractat.
        </p>
        <h3>Cum îl găsești</h3>
        <ul>
          <li>Caută pe site-ul primăriei locale, secțiunea &quot;Transport public&quot;</li>
          <li>Caută pe Google: &quot;transport public [numele orașului tău]&quot;</li>
          <li>Google Maps arată liniile de transport public din majoritatea orașelor românești</li>
          <li>Aplicația Moovit acoperă toate orașele mari din România</li>
        </ul>

        <h3>Tipuri de transport public</h3>
        <ul>
          <li><strong>Autobuze:</strong> disponibile în toate orașele cu transport public</li>
          <li><strong>Tramvaie:</strong> în unele orașe mari (rețele istorice extinse)</li>
          <li><strong>Troleibuze:</strong> în câteva orașe, vehicule electrice pe fir</li>
          <li><strong>Metrou:</strong> disponibil doar în capitală, dar în expansiune</li>
          <li><strong>Microbuze/minibuze:</strong> frecvente în zonele metropolitane și între localități</li>
        </ul>

        <Callout type="info" title="Integrare tarifară">
          Tot mai multe zone metropolitane introduc abonamente integrate — un singur abonament
          pentru toate tipurile de transport (autobuz, tramvai, eventual metrou). Verifică dacă
          operatorul din zona ta oferă această opțiune.
        </Callout>
      </Chapter>

      <Chapter id="bilete" title="Tipuri de bilete și abonamente" number={2}>
        <h3>Bilet single (o călătorie)</h3>
        <ul>
          <li>Cel mai simplu: cumperi la chioșc, ghișeu, automat sau din aplicație</li>
          <li>Valabil de regulă 60-90 de minute de la validare</li>
          <li>Preț variabil: 2-5 lei în funcție de oraș</li>
        </ul>

        <h3>Bilet zilnic / de 24 ore</h3>
        <ul>
          <li>Călătorii nelimitate pe toate liniile operatorului</li>
          <li>Ideal pentru turiști sau deplasări multiple într-o zi</li>
        </ul>

        <h3>Abonament lunar</h3>
        <ul>
          <li>Cel mai economic pentru navetiști (devine rentabil de la ~30 călătorii/lună)</li>
          <li>Se face pe card personalizat, la ghișeu sau online</li>
          <li>Unele orașe oferă abonamente integrate (toate liniile + tipuri de vehicule)</li>
        </ul>

        <h3>Card reîncărcabil</h3>
        <ul>
          <li>Majoritatea operatorilor au carduri electronice reîncărcabile</li>
          <li>Se reîncarcă la ghișee, automate sau online</li>
          <li>Poate avea bilete (pe număr) sau abonament</li>
        </ul>
      </Chapter>

      <Chapter id="contactless" title="Plata contactless cu cardul bancar" number={3}>
        <p>
          Tot mai mulți operatori de transport public din România acceptă plata directă cu
          cardul bancar contactless — fără să mai cumperi bilet separat.
        </p>
        <h3>Cum funcționează</h3>
        <ol>
          <li>Apropii cardul bancar (sau telefonul cu Google Pay / Apple Pay) de validatorul din vehicul sau de la barieră.</li>
          <li>Se debitează automat prețul unui bilet single.</li>
          <li>Unele sisteme aplică plafonare zilnică — nu plătești mai mult decât prețul unui bilet zilnic, indiferent câte călătorii faci.</li>
        </ol>
        <Callout type="tip" title="Avantaje contactless">
          Nu mai stai la coadă, nu mai cauți bilet, nu riști amendă. Funcționează și cu carduri
          emise de orice bancă din România sau din străinătate.
        </Callout>
      </Chapter>

      <Chapter id="aplicatii" title="Aplicații pentru transport public" number={4}>
        <ul>
          <li>
            <strong>Google Maps</strong> — cea mai completă: trasee, ore de sosire, navigare pas cu pas.
            Funcționează în toate orașele mari din România.
          </li>
          <li>
            <strong>Moovit</strong> — specializată pe transport public, cu alertări și alternative în timp real.
          </li>
          <li>
            <strong>Aplicația operatorului local</strong> — mulți operatori au aplicație proprie pentru
            bilete, abonamente și ore de sosire. Caută în App Store / Google Play.
          </li>
          <li>
            <strong>Trenurile.ro / CFR Călători</strong> — pentru trenuri interurbane, cu orare și prețuri.
          </li>
          <li>
            <strong>Uber / Bolt</strong> — nu sunt transport public, dar sunt o alternativă utilă pentru
            ultimul kilometru sau noaptea târziu.
          </li>
        </ul>
        <Callout type="info" title="Google Maps e surprinzător de bun">
          Chiar și în orașele mici, Google Maps arată corect liniile de transport public, orele de
          sosire estimate și rutele optime cu schimburi. Activează notificările pentru a fi anunțat
          când să cobori.
        </Callout>
      </Chapter>

      <Chapter id="sfaturi" title="Sfaturi pentru călătorii eficiente" number={5}>
        <ul>
          <li>La orele de vârf (07:30-09:00, 17:00-19:00), pleacă mai devreme sau mai târziu cu 15-20 minute — diferența e uriașă.</li>
          <li>Abonamentul lunar devine economic de la ~30 călătorii/lună — calculează înainte.</li>
          <li>Verifică orarul în weekend — multe linii au frecvențe reduse sâmbăta și duminica.</li>
          <li>Controlează soldul cardului înainte să urci — nu poți reîncărca în vehicul.</li>
          <li>Păstrează biletul/cardul validat până la coborâre — controlorii pot urca oricând.</li>
          <li>Folosește Google Maps să compari timpul cu autobuzul vs. cu mersul pe jos — uneori pe distanțe scurte e mai rapid pe jos.</li>
        </ul>

        <h3>Ore de vârf — alternative</h3>
        <ul>
          <li>Trotineta sau bicicleta pentru distanțe scurte (sub 5 km)</li>
          <li>Carpooling cu colegi pentru navetă</li>
          <li>Lucru de acasă dacă angajatorul permite (evită complet transportul)</li>
        </ul>
      </Chapter>

      <Chapter id="probleme" title="Cum raportezi probleme" number={6}>
        <p>
          Dacă ai o problemă cu transportul public (vehicul defect, întârzieri cronice, șofer
          imprudent, stație vandalizată), o poți raporta oficial.
        </p>
        <h3>Unde raportezi</h3>
        <ul>
          <li><strong>Operatorul de transport:</strong> site-ul, aplicația sau telefonul de dispecerat</li>
          <li><strong>Primăria locală:</strong> ca autoritate care a contractat serviciul</li>
          <li><strong>Autoritatea de reglementare:</strong> ANRSC (Autoritatea Națională de Reglementare pentru Serviciile Comunitare) pentru probleme sistemice</li>
          <li><strong>Protecția consumatorului (ANPC):</strong> dacă serviciul plătit nu corespunde</li>
        </ul>

        <h3>Cum formulezi</h3>
        <ul>
          <li>Menționează linia, data, ora, stația</li>
          <li>Descrie problema concret (nu &quot;e prost serviciul&quot;, ci &quot;autobuzul 15 nu a oprit în stația X la ora Y&quot;)</li>
          <li>Atașează poze sau video dacă e posibil</li>
          <li>Invocă OG 27/2002 pentru a obliga un răspuns în 30 de zile</li>
        </ul>

        <Callout type="warning" title="Amenzi">
          Dacă un controlor îți dă amendă, ai dreptul să o contești în instanță în 15 zile.
          Amenda trebuie să fie emisă corect (cu date complete, semnatură). Dacă lipsesc
          elemente obligatorii, amenda se anulează.
        </Callout>
      </Chapter>

      <Chapter id="reduceri" title="Reduceri și gratuități legale" number={7}>
        <p>
          Legislația română prevede reduceri și gratuități la transportul public pentru
          mai multe categorii de cetățeni. Acestea sunt <strong>drepturi legale</strong>, nu
          favoruri ale operatorului.
        </p>

        <h3>Cine beneficiază</h3>
        <ul>
          <li><strong>Elevi și studenți:</strong> reducere de 50% la transportul local (prin lege) — cu legitimație valabilă</li>
          <li><strong>Pensionari:</strong> multe primării oferă gratuitate sau reduceri semnificative — verifică local</li>
          <li><strong>Persoane cu dizabilități:</strong> gratuitate pe transportul public local (Legea 448/2006)</li>
          <li><strong>Însoțitorii persoanelor cu handicap grav:</strong> gratuitate (aceeași lege)</li>
          <li><strong>Veterani și urmași de eroi:</strong> gratuitate conform legilor speciale</li>
          <li><strong>Donatori de sânge:</strong> gratuitate în ziua donării + ziua următoare (în unele orașe)</li>
        </ul>

        <h3>Cum obții reducerea</h3>
        <ol>
          <li>Du-te la un ghișeu al operatorului de transport cu actul de identitate și documentul justificativ (legitimație student, cupon pensie, certificat handicap etc.)</li>
          <li>Solicită eliberarea cardului cu reducere sau gratuitate</li>
          <li>Reînnoiește anual sau la expirarea documentului justificativ</li>
        </ol>

        <Callout type="tip" title="Nu plăti dacă ai dreptul la gratuitate">
          Mulți beneficiari nu știu că au dreptul la transport gratuit. Verifică legislația
          pentru categoria ta și solicită dreptul la ghișeul operatorului.
        </Callout>
      </Chapter>
    </GhidLayout>
  );
}
