import type { Metadata } from "next";
import { GhidLayout, Chapter, Callout } from "@/components/ghiduri/GhidLayout";
import { HowToJsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Ghid contestare amendă — cum câștigi procesul",
  description:
    "Cum contești o amendă în instanță. Termen, plângere contravențională, reducere 50%, apel. Model de plângere, jurisprudență.",
  alternates: { canonical: "/ghiduri/ghid-contestatie-amenda" },
};

const chapters = [
  { id: "ce-faci-primul", title: "Ce faci imediat ce iei amenda" },
  { id: "cand-platesti", title: "Când plătești (și reducerea de 50%)" },
  { id: "cand-contesti", title: "Când merită să contești" },
  { id: "plangere", title: "Plângerea contravențională" },
  { id: "proces", title: "Procesul în instanță" },
];

export default function GhidContestatieAmendaPage() {
  return (
    <>
      <HowToJsonLd
        name="Cum contești o amendă contravențională în România"
        description="Procedură pas-cu-pas pentru contestarea unei amenzi: decizie, termen, plângere contravențională, proces în judecătorie, apel."
        url={`${SITE_URL}/ghiduri/ghid-contestatie-amenda`}
        totalTime="PT2H"
        estimatedCost="20"
        steps={[
          {
            name: "Verifică procesul-verbal în ziua primirii",
            text: "Citește cu atenție data constatării, articolul invocat, dovada și numele agentului constatator. Orice lipsă sau greșeală e motiv de anulare.",
          },
          {
            name: "Decide: plătește 50% în 15 zile SAU contestă",
            text: "Dacă plătești în 15 zile, reducerea e 50%. Dacă contești, nu mai ai reducerea dar poți câștiga integral.",
          },
          {
            name: "Depune plângerea contravențională",
            text: "Plângerea se depune la judecătoria unde s-a săvârșit fapta, în 15 zile de la comunicare. Taxa de timbru e 20 lei.",
          },
          {
            name: "Pregătește probele și argumentarea",
            text: "Adună martori, poze, filmări, documente. Motivele frecvente care reușesc: nelegalitate formală, prescripție, lipsă de probă.",
          },
          {
            name: "Prezintă-te la proces sau trimite avocat",
            text: "Procesul durează 3–6 luni. Poți solicita judecare în lipsă dacă locuiești în altă localitate.",
          },
          {
            name: "Dacă pierzi: fă apel în 30 de zile",
            text: "Hotărârea primei instanțe se atacă la tribunal. Apel taxă: 20 lei.",
          },
        ]}
      />
      <GhidLayout
      title="Cum contești o amendă — ghid complet"
      subtitle="Amenzile contravenționale se contestă în 15 zile. Până atunci, ai 15 zile să plătești jumătate. Iată cum decizi și cum procedezi."
      icon="⚖️"
      gradient="from-orange-600 via-red-700 to-rose-900"
      chapters={chapters}
      stats={[
        { label: "Termen plată 50%", value: "15 zile" },
        { label: "Termen contestație", value: "15 zile" },
        { label: "Taxa judiciară", value: "20 lei" },
      ]}
    >
      <Chapter id="ce-faci-primul" title="Ce faci imediat ce iei amenda" number={1}>
        <p>
          Fie că e de la Poliția Rutieră, Poliția Locală, ITM sau alt agent constatator,
          primești un <strong>proces-verbal de contravenție</strong>. Nu-l arunca și nu-l ignora —
          sunt informații critice pe el.
        </p>

        <h3>Verifică următoarele pe PV</h3>
        <ul>
          <li><strong>Numele agentului</strong> + numărul legitimației</li>
          <li><strong>Data și ora</strong> contravenției (nu data procesului-verbal!)</li>
          <li><strong>Locul exact</strong> (stradă + număr, nu &quot;zona X&quot;)</li>
          <li><strong>Descrierea faptei</strong> — trebuie să fie clară, nu generică</li>
          <li><strong>Temeiul legal</strong> — articolul + legea încălcată</li>
          <li><strong>Valoarea amenzii</strong> + valoarea la reducere (jumătate)</li>
          <li><strong>Termenul de plată</strong> — 15 zile de la comunicare</li>
          <li><strong>Termenul de contestație</strong> — 15 zile de la comunicare</li>
          <li><strong>Instanța competentă</strong> — numele judecătoriei</li>
        </ul>

        <Callout type="warning" title="Semnătura ta nu înseamnă vinovăție">
          Pe PV există o rubrică pentru &quot;obiecții&quot;. Scrie acolo orice ai de zis (ex: „nu eram eu
          la volan" sau „nu cunosc fapta"). Semnarea doar confirmă că ai primit PV-ul, nu că ești de acord.
        </Callout>
      </Chapter>

      <Chapter id="cand-platesti" title="Când plătești (și reducerea de 50%)" number={2}>
        <p>
          Prin OUG 69/2020 și OG 2/2001, pentru <strong>majoritatea amenzilor contravenționale</strong>
          poți plăti <strong>jumătate din sumă</strong> dacă achiți în <strong>15 zile</strong> de
          la comunicarea PV-ului. Contorizarea începe din ziua următoare primirii (sau, dacă ai
          semnat pe loc, din ziua următoare semnării).
        </p>

        <Callout type="tip" title="Plătești rapid = scapi jumătate">
          Dacă PV-ul scrie amendă 2.900 lei (ex: depășirea limitei de viteză), în 15 zile plătești
          <strong> 1.450 lei</strong>. După 15 zile → amenda completă. Plătești pe ghiseul.ro cu
          simpla introducere a codului unic sau a seriei PV.
        </Callout>

        <h3>Excepții — NU ai reducere de 50%</h3>
        <ul>
          <li>Amenzi rutiere cu suspendarea permisului (ex: alcool, depășire limită &gt; 50 km/h)</li>
          <li>Amenzi ITM pentru muncă nedeclarată</li>
          <li>Amenzi pentru evaziune fiscală (DNA/ANAF)</li>
          <li>Unele amenzi CNA (audiovizual)</li>
        </ul>
      </Chapter>

      <Chapter id="cand-contesti" title="Când merită să contești" number={3}>
        <p>
          Contestația nu e gratis pentru timpul tău, dar taxa judiciară e mică (20 lei). Merită
          contestat când:
        </p>

        <ul>
          <li><strong>Fapta nu e exactă</strong> — erori de descriere, loc sau dată</li>
          <li><strong>Nu tu ai săvârșit-o</strong> — de exemplu, mașina e a ta dar conducea altcineva</li>
          <li><strong>Procesul verbal e nul de drept</strong> — lipsește o mențiune obligatorie (art. 17 OG 2/2001)</li>
          <li><strong>Agentul nu era competent</strong> teritorial sau pe subiectul respectiv</li>
          <li><strong>Probe contradictorii</strong> — ai dovezi (poze, martori, GPS) care contrazic PV-ul</li>
          <li><strong>Termen de prescripție depășit</strong> — 6 luni de la săvârșire, în general</li>
          <li><strong>Fapta nu mai e contravenție</strong> — a fost abrogată</li>
        </ul>

        <Callout type="warning" title="Atenție la plata și contestația simultan">
          Dacă plătești jumătate DUPĂ ce ai depus plângerea, instanța poate considera că ai
          recunoscut fapta. Decide <strong>înainte</strong> să plătești: fie plătești 50% și accepti,
          fie contești și <strong>nu plătești</strong> până la decizia judecății.
        </Callout>
      </Chapter>

      <Chapter id="plangere" title="Plângerea contravențională" number={4}>
        <h3>Cum o scrii</h3>
        <p>
          Plângerea se adresează <strong>judecătoriei</strong> din raza teritorială unde s-a
          comis fapta (sau, la opțiunea ta, din raza domiciliului). Termen: 15 zile de la comunicare.
        </p>

        <h3>Structura plângerii</h3>
        <ol>
          <li>
            <strong>Antet:</strong> „Către Judecătoria [orașul]" / Dosar nou / „Domnule Președinte,"
          </li>
          <li><strong>Date petent:</strong> nume, CNP, domiciliu, telefon, email</li>
          <li>
            <strong>Obiect:</strong> „Plângere contravențională împotriva Procesului-verbal
            seria [...] nr. [...] din data de [...]"
          </li>
          <li>
            <strong>Starea de fapt:</strong> descrii ce s-a întâmplat (1-2 paragrafe scurte,
            factual)
          </li>
          <li>
            <strong>Motivele de nelegalitate:</strong> enumeră-le pe puncte. Exemplu:
            <ul>
              <li>„Descrierea faptei e neclară, nu identifică vehiculul cu care aș fi săvârșit fapta"</li>
              <li>„Lipsește mențiunea obligatorie privind data comunicării (art. 17 OG 2/2001)"</li>
              <li>„În momentul indicat, nu mă aflam la locul faptei (dovadă: [...])"</li>
            </ul>
          </li>
          <li>
            <strong>Cerere:</strong> „Vă solicit să dispuneți anularea în tot/în parte a
            procesului-verbal și exonerarea de la plata amenzii"
          </li>
          <li><strong>Probe:</strong> martori, documente, poze, înregistrări</li>
          <li><strong>Taxa judiciară:</strong> „Taxa judiciară timbru 20 lei — chitanță anexată"</li>
          <li><strong>Semnătura + data</strong></li>
        </ol>

        <Callout type="tip" title="Modele gratuite">
          Poți descărca modele de plângere de pe <strong>expertforum.ro</strong> sau
          <strong> apador-ch.ro</strong>. Alternativ, asociațiile de șoferi (ex: COTAR) oferă
          consultanță pentru cazuri rutiere.
        </Callout>

        <h3>Unde depui</h3>
        <ul>
          <li><strong>La registratura Judecătoriei</strong> — personal, cu o copie pe care primești număr de înregistrare</li>
          <li><strong>Prin poștă</strong> — scrisoare recomandată cu confirmare de primire</li>
          <li><strong>Online</strong> — multe instanțe acceptă plângeri prin portal.just.ro</li>
        </ul>
      </Chapter>

      <Chapter id="proces" title="Procesul în instanță" number={5}>
        <p>
          După depunerea plângerii, judecătoria stabilește un termen (de obicei 1-3 luni). Pe
          acest termen:
        </p>

        <ul>
          <li>Prezinți probele (martori, documente, înregistrări video)</li>
          <li>Contești probele agentului</li>
          <li>Argumentezi motivele de nelegalitate</li>
          <li>Ceri anularea PV-ului</li>
        </ul>

        <h3>Soluții posibile</h3>
        <ul>
          <li><strong>Anulare totală</strong> — scapi de toată amenda (nu plătești nimic)</li>
          <li><strong>Anulare parțială</strong> — reducerea cuantumului sau înlocuirea cu avertisment</li>
          <li><strong>Respingere</strong> — rămâne în vigoare amenda (plătești integral, fără 50%)</li>
        </ul>

        <h3>Apel</h3>
        <p>
          Dacă pierzi, ai drept de apel la <strong>Tribunal</strong>, în termen de <strong>30 zile</strong> de la
          comunicarea hotărârii. Taxa judiciară în apel e tot 20 lei.
        </p>

        <Callout type="warning" title="Amenzi prescrise — verifică dacă au trecut 6 luni">
          Conform art. 13 OG 2/2001, <strong>aplicarea sancțiunii amenzii contravenționale se prescrie în 6 luni</strong> de la data săvârșirii faptei. Dacă PV-ul e emis după 6 luni,
          cere anularea pe acest motiv — e aproape garantat câștigător.
        </Callout>

        <h3>Ce nu poți face</h3>
        <ul>
          <li><strong>Nu poți refuza să primești PV-ul</strong> — se consideră comunicat oricum</li>
          <li><strong>Nu poți ignora</strong> sperând că se uită — se recuperează prin executor</li>
          <li><strong>Nu poți contesta direct</strong> la agentul care l-a emis — doar la instanță</li>
        </ul>
      </Chapter>
    </GhidLayout>
    </>
  );
}
