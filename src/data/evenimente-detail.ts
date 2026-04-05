// Extended details for each event (timeline, causes, impact, sources)

export interface EvenimentDetail {
  slug: string;
  coords: [number, number];
  fullDescription: string;
  timeline: { time: string; titlu: string; desc: string }[];
  causes: string[];
  impact: string;
  response: string;
  quotes: { text: string; author: string }[];
  sources: { name: string; url: string }[];
  ongoingStatus?: string;
}

export const evenimenteDetails: Record<string, EvenimentDetail> = {
  "rahova-2025": {
    slug: "rahova-2025",
    coords: [44.4125, 26.0734],
    fullDescription:
      "În dimineața zilei de 15 aprilie 2025, o explozie puternică urmată de incendiu a avut loc într-un bloc de locuințe de pe Calea Rahovei. Evenimentul a fost cauzat de o scurgere de gaze naturale și a afectat apartamentele de la etajele 4-6. 52 de locatari au fost evacuați, 4 persoane au suferit răniri, iar 12 apartamente au devenit nelocuibile.",
    timeline: [
      { time: "09:23", titlu: "Prima sesizare la 112", desc: "Locatarii semnalează explozie și fum intens la etajul 4." },
      { time: "09:28", titlu: "Dispecerat ISU alertat", desc: "3 autospeciale trimise de la Detașamentul Berceni." },
      { time: "09:31", titlu: "Sosesc primele echipaje", desc: "Pompierii confirmă incendiul la etajele 4-6." },
      { time: "10:15", titlu: "Incendiu sub control parțial", desc: "Etajele 5-6 stinse." },
      { time: "10:48", titlu: "Evacuare completă bloc", desc: "52 persoane evacuate din blocurile C13 și C14." },
      { time: "11:45", titlu: "Incendiu stins", desc: "Începe ancheta la fața locului." },
      { time: "14:00", titlu: "Comunicat oficial ISU", desc: "4 victime, 12 apartamente afectate confirmate." },
    ],
    causes: [
      "Scurgere de gaze naturale neidentificată la timp",
      "Instalație neautorizată de centrală termică",
      "Lipsa senzorilor de gaz în apartament",
      "Verificare metrologică expirată de peste 6 ani",
    ],
    impact:
      "12 familii (31 persoane, 9 copii) au fost relocate temporar în camere de oaspeți la hotel pe cheltuiala primăriei. Un ONG local a colectat 85.000 lei în primele 48 de ore.",
    response:
      "PMB Sectorul 5 a activat fondul de urgență. Crucea Roșie a oferit alimente și asistență psihologică. Guvernul a anunțat verificări extinse în blocurile similare.",
    quotes: [
      { text: "Răspunsul echipajelor ISU a fost exemplar — primele autospeciale au ajuns în 8 minute.", author: "Gen. Mihai Neagu, ISU București" },
      { text: "Toate familiile afectate vor fi cazate pe cheltuiala primăriei.", author: "Viceprimar Sector 5" },
    ],
    sources: [
      { name: "ISU București — comunicat oficial", url: "https://www.igsu.ro" },
      { name: "Digi24 — live text", url: "https://www.digi24.ro" },
    ],
    ongoingStatus: "Investigație în curs",
  },

  "furtuna-august-2023": {
    slug: "furtuna-august-2023",
    coords: [44.4268, 26.1025],
    fullDescription:
      "Pe 12 august 2023, o furtună severă a lovit Bucureștiul cu vânturi de peste 100 km/h. 180 de copaci căzuți, zeci de mașini avariate, două victime. Serviciile de urgență au avut peste 1.200 de intervenții în 24 de ore.",
    timeline: [
      { time: "14:30", titlu: "ANM emite cod roșu", desc: "Alertare populație prin RO-Alert." },
      { time: "15:45", titlu: "Începe furtuna", desc: "Vânturi puternice în tot Bucureștiul." },
      { time: "16:20", titlu: "Primii copaci căzuți", desc: "Raportați pe Bd. Aviatorilor și Herăstrău." },
      { time: "17:00", titlu: "Trafic blocat", desc: "Arterele majore paralizate de copaci și mașini avariate." },
      { time: "19:30", titlu: "Furtuna slăbește", desc: "ISU începe intervenții masive." },
      { time: "23:00", titlu: "Bilanț preliminar", desc: "180 copaci, 2 victime, 45+ autoturisme avariate." },
    ],
    causes: [
      "Front atmosferic violent din Ucraina",
      "Copaci neîntreținuți/uscați în parcuri și pe bulevarde",
      "Infrastructură de iluminat public instabilă",
    ],
    impact:
      "2 persoane decedate sub copaci căzuți, 180 de persoane evacuate temporar din case fără acoperiș, pagube materiale estimate la 12 milioane lei.",
    response:
      "45 echipaje ISU mobilizate 72h. PMB a alocat 5 milioane lei pentru despăgubiri. Program nou de toaletare arbori lansat.",
    quotes: [
      { text: "A fost cea mai violentă furtună din ultimii 10 ani în Capitală.", author: "ANM — Administrația Națională Meteorologie" },
    ],
    sources: [
      { name: "ANM — raport meteo", url: "https://www.meteoromania.ro" },
      { name: "ISU București", url: "https://www.igsu.ro" },
    ],
  },

  "prabusire-acoperis-2024": {
    slug: "prabusire-acoperis-2024",
    coords: [44.4389, 26.1298],
    fullDescription:
      "Acoperișul Halei Traian s-a prăbușit în noiembrie 2024 din cauza acumulării masive de zăpadă. Din fericire, hala era goală la momentul incidentului. Structura avea peste 80 de ani și era în stare avansată de degradare.",
    timeline: [
      { time: "06:40", titlu: "Prăbușire acoperiș", desc: "Zgomot audibil în tot cartierul." },
      { time: "06:55", titlu: "Primele echipaje ISU", desc: "Verifică dacă sunt victime." },
      { time: "07:30", titlu: "Confirmat: fără victime", desc: "Hala era complet goală." },
      { time: "10:00", titlu: "Evaluare structurală", desc: "Experți recomandă demolare completă." },
    ],
    causes: [
      "Încărcare excesivă cu zăpadă (40+ cm)",
      "Structură metalică veche, coroziune avansată",
      "Lipsa întreținerii timp de 20 de ani",
      "Raport structural ignorat din 2018",
    ],
    impact:
      "Clădire istorică pierdută. Planuri pentru modernizare complet blocate. Comercianți din piață evacuați temporar.",
    response: "Primăria Sector 2 a demarat procedura de demolare. Proiect nou de piață modernă în discuție.",
    quotes: [],
    sources: [
      { name: "PMB Sectorul 2", url: "https://www.ps2.ro" },
    ],
  },

  "protestul-piata-victoriei-2017": {
    slug: "protestul-piata-victoriei-2017",
    coords: [44.4523, 26.0867],
    fullDescription:
      "Pe 1 februarie 2017, peste 500.000 de oameni au ieșit în Piața Victoriei pentru a protesta împotriva OUG 13 — ordonanța de urgență care modifica Codul Penal. A fost cea mai mare manifestație din istoria post-comunistă a României. Protestul s-a desfășurat pașnic pe parcursul a mai multor săptămâni.",
    timeline: [
      { time: "31 ian", titlu: "Guvernul adoptă OUG 13", desc: "Modificări Cod Penal în miezul nopții." },
      { time: "1 feb", titlu: "Prima mare adunare", desc: "300.000+ oameni în Piața Victoriei." },
      { time: "5 feb", titlu: "Vârf protest", desc: "500.000+ oameni, protest pașnic record." },
      { time: "5 feb", titlu: "Guvernul abrogă OUG 13", desc: "Prim-ministrul cedează." },
      { time: "12 feb", titlu: "Protest continuă", desc: "Cereri pentru demisia guvernului." },
    ],
    causes: [
      "OUG 13 modifica articolul 297 din Codul Penal",
      "Amnistia implicită pentru dosare corupție sub 200.000 lei",
      "Adoptare în secret, fără dezbatere publică",
      "Mobilizare masivă pe rețele sociale",
    ],
    impact:
      "OUG 13 abrogată în 5 zile. Ministrul Justiției demisionează. Premier schimbat luni mai târziu. Moment istoric de participare civică masivă.",
    response:
      "Guvernul a abrogat ordonanța. Președintele Iohannis a susținut protestele. Dezbatere publică aprofundată pe teme de justiție.",
    quotes: [
      { text: "Nu ne vindem țara!", author: "Scandare populară la protest" },
      { text: "Cel mai mare protest pașnic din istoria României moderne.", author: "Presa internațională" },
    ],
    sources: [
      { name: "Mediafax — arhivă februarie 2017", url: "https://www.mediafax.ro" },
    ],
  },

  "cutremur-1977": {
    slug: "cutremur-1977",
    coords: [44.4268, 26.1025],
    fullDescription:
      "În seara de 4 martie 1977, un cutremur de magnitudine 7,4 Richter a lovit România. În București, au murit 1.578 de persoane și s-au prăbușit 33 de blocuri majore. Cutremurul a marcat definitiv arhitectura orașului — multe clădiri au fost demolate ulterior pentru a face loc Centrului Civic al lui Ceaușescu.",
    timeline: [
      { time: "21:22", titlu: "Cutremur de 7.4 Richter", desc: "Epicentru zona Vrancea, 94 km adâncime." },
      { time: "21:23", titlu: "Prăbușiri în București", desc: "Blocul Scala, Wilson, Dunărea etc." },
      { time: "22:00", titlu: "Stare de urgență", desc: "Armata mobilizată pentru salvare." },
      { time: "Ziua 2", titlu: "Ajutor internațional", desc: "Echipe de salvare din Germania, Franța, Israel." },
      { time: "Zile 3-10", titlu: "Operațiuni de salvare", desc: "Supraviețuitori găsiți până pe 11 martie." },
    ],
    causes: [
      "Zonă seismică Vrancea — cea mai activă din Europa",
      "Clădiri interbelice neconsolidate",
      "Absența normelor antiseismice moderne",
      "Densitate mare de construcții vechi în centrul Bucureștiului",
    ],
    impact:
      "1.578 morți în București (1.391 conform unor surse), 11.321 răniți, 33 blocuri prăbușite, 35.000 apartamente avariate. Pagube materiale: 2 miliarde USD (valoare 1977).",
    response:
      "Statul a inițiat programul de consolidare masivă. Normele antiseismice P100 au fost revizuite. A urmat demolarea masivă din anii '80 pentru Casa Poporului.",
    quotes: [
      { text: "Am trăit momentul cel mai întunecat al orașului.", author: "Mărturie supraviețuitor" },
    ],
    sources: [
      { name: "INFP — Institutul Național de Fizica Pământului", url: "https://www.infp.ro" },
      { name: "Arhivele Naționale", url: "https://arhivelenationale.ro" },
    ],
  },

  "colectiv-2015": {
    slug: "colectiv-2015",
    coords: [44.4267, 26.1116],
    fullDescription:
      "În noaptea de 30 spre 31 octombrie 2015, un incendiu devastator a izbucnit la clubul Colectiv din București în timpul unui concert. 64 de oameni au murit (26 pe loc, 38 în spitale în lunile următoare), peste 180 au fost răniți. Incendiul a fost cauzat de artificii piromelodice folosite în interior, iar incapacitatea spitalelor de a trata marea de arși a declanșat un moment de cotitură în societatea românească.",
    timeline: [
      { time: "22:30 (30 oct)", titlu: "Concert Goodbye to Gravity", desc: "Lansarea albumului Mantras of War." },
      { time: "22:32", titlu: "Artificii piromelodice aprinse", desc: "Scânteile aprind izolația fonică din tavan." },
      { time: "22:33", titlu: "Flăcări în tot localul", desc: "Evacuare rapidă prin singura ieșire." },
      { time: "22:40", titlu: "Primele echipaje ISU", desc: "Găsesc zeci de oameni inconștienți." },
      { time: "00:00", titlu: "Bilanț preliminar: 27 morți", desc: "Răniții trimiși la multiple spitale." },
      { time: "Zile 1-30", titlu: "Spitalele depășite", desc: "Infecții nosocomiale ucid răniți în terapie." },
      { time: "4 noiembrie", titlu: "Guvernul demisionează", desc: "Proteste masive 'Corupția ucide'." },
    ],
    causes: [
      "Artificii piromelodice interzise folosite în spațiu închis",
      "Izolație fonică necertificată, ușor inflamabilă",
      "Singură ieșire de urgență, blocată",
      "Autorizații false — corupție la nivel local",
      "Capacitate limitată depășită masiv",
    ],
    impact:
      "64 morți, 180+ răniți. Sistemul medical românesc s-a dovedit depășit. Moment de cotitură societală. Guvernul Ponta a demisionat. Au urmat 10+ ani de anchete, dosare penale, legi noi pentru spații publice.",
    response:
      "Manifestații masive 'Corupția ucide' — peste 25.000 oameni în stradă. Lege nouă pentru spații de distracție. Cadru legislativ incendii revizuit. Filmul 'Colectiv' (Nanau, 2019) documentează ancheta jurnalistică.",
    quotes: [
      { text: "Corupția ucide.", author: "Slogan protestatari 2015" },
      { text: "Nu uităm. Nu iertăm.", author: "Mesaj comemorativ annual" },
    ],
    sources: [
      { name: "Colectiv — documentar (HBO)", url: "https://www.hbo.com" },
      { name: "Presa — arhivă decembrie 2015", url: "https://www.hotnews.ro" },
    ],
  },

  "accident-bd-uverturii-2024": {
    slug: "accident-bd-uverturii-2024",
    coords: [44.4367, 26.0534],
    fullDescription:
      "Pe 22 iunie 2024, o coliziune în lanț pe Bulevardul Uverturii a implicat 6 autovehicule. Ploaia torențială a redus vizibilitatea la câțiva metri. Toți șoferii au fost transportați la spital cu răni ușoare.",
    timeline: [
      { time: "15:10", titlu: "Ploaie torențială începe", desc: "Vizibilitate redusă sub 20m." },
      { time: "15:23", titlu: "Primul impact", desc: "Mașina din față frânează brusc." },
      { time: "15:24", titlu: "Coliziune în lanț", desc: "5 mașini în spate intră în impact." },
      { time: "15:35", titlu: "Echipaje la fața locului", desc: "Ambulanțe + descarcerare." },
    ],
    causes: [
      "Vizibilitate extrem de redusă",
      "Viteză neadaptată condițiilor meteo",
      "Distanță insuficientă între autovehicule",
    ],
    impact: "5 răniți în stare stabilă, 6 autovehicule avariate, trafic deviat 3 ore.",
    response: "Poliția Rutieră a deschis dosar penal pentru conducere neadaptată. Campanie educativă DRPCIV.",
    quotes: [],
    sources: [{ name: "Poliția Rutieră București", url: "https://www.politiaromana.ro" }],
  },

  "inundatie-vitan-2023": {
    slug: "inundatie-vitan-2023",
    coords: [44.4213, 26.1534],
    fullDescription:
      "Pe 15 iunie 2023, ploaia torențială (65 mm în 2 ore) a inundat cartierul Vitan. 25 de familii evacuate, 40+ subsoluri inundate, canalizarea depășită.",
    timeline: [
      { time: "17:00", titlu: "Ploaie începe", desc: "Intensitate normală inițial." },
      { time: "17:30", titlu: "Intensitate extremă", desc: "65 mm în 2 ore raportat." },
      { time: "18:15", titlu: "Primele străzi inundate", desc: "Bd. Mihai Bravu, Str. Vulturilor." },
      { time: "19:00", titlu: "ApaNova + ISU intervenție", desc: "12 echipaje desfundă canalizare." },
      { time: "23:30", titlu: "Apele se retrag", desc: "Evaluare pagube începe." },
    ],
    causes: [
      "Canalizare subdimensionată (proiectată anii '70)",
      "Ploi torențiale tot mai frecvente",
      "Asfaltare excesivă, lipsă zone absorbante",
      "Guri de canal înfundate cu gunoi",
    ],
    impact: "25 familii evacuate temporar, 40+ subsoluri inundate, pagube 2.5 milioane lei.",
    response: "ApaNova a demarat program de modernizare canalizare în zonă. PMB a alocat 30 milioane lei pentru upgrade canalizare.",
    quotes: [],
    sources: [{ name: "ApaNova București", url: "https://www.apanovabucuresti.ro" }],
  },

  "proteste-justitie-2018": {
    slug: "proteste-justitie-2018",
    coords: [44.4523, 26.0867],
    fullDescription:
      "Pe 10 august 2018, diaspora română a organizat un protest masiv în Piața Victoriei împotriva guvernului PSD. Protestul s-a încheiat cu o intervenție extrem de controversată a Jandarmeriei, soldată cu peste 450 de răniți, inclusiv jurnaliști și trecători.",
    timeline: [
      { time: "18:00", titlu: "Protest începe", desc: "80.000+ oameni în Piața Victoriei." },
      { time: "22:00", titlu: "Jandarmeria intervine brutal", desc: "Gaze lacrimogene + bastoane." },
      { time: "22:30", titlu: "Haos total", desc: "Jurnaliști atacați, copii loviți." },
      { time: "23:30", titlu: "Piața golită cu forța", desc: "452 de răniți raportați." },
      { time: "Zilele următoare", titlu: "Anchete + plângeri", desc: "Peste 800 plângeri la parchet." },
    ],
    causes: [
      "Decizii guvernamentale controversate (modificări legi justiție)",
      "Diaspora — milioane români trăiesc peste hotare",
      "Tensiune PSD-Președinție acumulată",
      "Ordin Jandarmerie considerat abuziv ulterior",
    ],
    impact:
      "452 răniți, 30+ jurnaliști agresați. Credibilitatea Jandarmeriei prăbușită. Procese împotriva conducerii MAI. Capitalul politic al PSD grav afectat.",
    response:
      "Dosarul 10 august continuă în 2026 la ÎCCJ. Mai mulți șefi Jandarmerie puși sub acuzare. Reformă unităților de ordine publică.",
    quotes: [
      { text: "Ordin abuziv, răspunsul autorităților a fost disproporționat.", author: "Avocatul Poporului — raport 2019" },
    ],
    sources: [
      { name: "Raport Avocatul Poporului", url: "https://avp.ro" },
      { name: "Recorder — documentar", url: "https://recorder.ro" },
    ],
  },

  "cutremur-noiembrie-1940": {
    slug: "cutremur-noiembrie-1940",
    coords: [44.4389, 26.0978],
    fullDescription:
      "Pe 10 noiembrie 1940, ora 03:39, un cutremur de 7.7 Richter a lovit România. În București, prăbușirea blocului Carlton (cel mai înalt din țară la acea vreme) pe Bd. Magheru a marcat colectiv generația interbelică.",
    timeline: [
      { time: "03:39", titlu: "Cutremur de 7.7 Richter", desc: "Durată ~45 secunde." },
      { time: "03:40", titlu: "Blocul Carlton se prăbușește", desc: "138 victime sub dărâmături." },
      { time: "Ziua 1", titlu: "Stare de război", desc: "Armata + Pompieri Militari mobilizați." },
      { time: "Zile 2-15", titlu: "Doliu național", desc: "Reconstrucție începe." },
    ],
    causes: [
      "Zonă seismică Vrancea — activitate majoră",
      "Construcții înalte fără norme antiseismice",
      "Cadrul legislativ inexistent pentru siguranță seismică",
    ],
    impact: "300+ morți în București, 5.000+ evacuați, pagube materiale uriașe. Clădiri emblematice prăbușite.",
    response: "Prima reformă a legilor de construcție. Normele antiseismice românești au început să prindă contur.",
    quotes: [],
    sources: [{ name: "INFP — arhivă seismică", url: "https://www.infp.ro" }],
  },

  "incendiu-piata-obor-2023": {
    slug: "incendiu-piata-obor-2023",
    coords: [44.4456, 26.1189],
    fullDescription:
      "Pe 3 septembrie 2023, un incendiu a izbucnit la un stand de textile din Piața Obor. ISU a intervenit rapid, incendiul a fost stins în 45 minute fără victime. 15 comercianți evacuați preventiv.",
    timeline: [
      { time: "14:20", titlu: "Incendiu pornit", desc: "Posibil scurtcircuit la stand." },
      { time: "14:25", titlu: "Primele apeluri la 112", desc: "Fumul se vede de la distanță." },
      { time: "14:32", titlu: "3 autospeciale ISU", desc: "Intervenție rapidă." },
      { time: "15:05", titlu: "Incendiu stins", desc: "Fără victime, pagube locale." },
    ],
    causes: [
      "Instalație electrică veche în stand",
      "Stocare textile (inflamabile)",
      "Supraîncărcare sistemul electric local",
    ],
    impact: "1 stand distrus, pagube 150.000 lei, 15 comercianți afectați.",
    response: "Primăria Sector 2 a impus verificări electrice obligatorii pentru toate standurile.",
    quotes: [],
    sources: [{ name: "ISU București", url: "https://www.igsu.ro" }],
  },

  "inundatie-pasaj-basarab-2024": {
    slug: "inundatie-pasaj-basarab-2024",
    coords: [44.4492, 26.0651],
    fullDescription:
      "Pe 9 iulie 2024, după o ploaie de 40 mm în 90 de minute, Pasajul Basarab a fost complet inundat pentru 6 ore. Pompele de drenaj nu au făcut față.",
    timeline: [
      { time: "16:30", titlu: "Ploaie torențială începe", desc: "Intensitate 40 mm/90 min." },
      { time: "17:00", titlu: "Pasaj inundat parțial", desc: "Apa crește rapid." },
      { time: "17:45", titlu: "Pompe drenaj depășite", desc: "Închidere completă pasaj." },
      { time: "23:15", titlu: "Pasaj redeschis", desc: "Drenaj complet + verificări." },
    ],
    causes: [
      "Pompe de drenaj subdimensionate",
      "Mentenanță insuficientă a sistemului",
      "Eveniment meteo extrem",
      "Design inițial (2010) depășit",
    ],
    impact: "Trafic paralizat în nordul Bucureștiului 6 ore. Autoturisme abandonate, remorcate.",
    response: "PMB a anunțat upgrade sistem drenaj — 8 milioane lei alocate. Verificări lunare pompe.",
    quotes: [],
    sources: [{ name: "PMB — Direcția Drumuri", url: "https://www.pmb.ro" }],
  },
};
