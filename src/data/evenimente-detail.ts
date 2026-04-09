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
      "În dimineața zilei de 17 octombrie 2025, o explozie puternică urmată de incendiu a avut loc într-un bloc de locuințe de pe Calea Rahovei. Evenimentul a fost cauzat de o scurgere de gaze naturale și a afectat apartamentele de la etajele 4-6. 52 de locatari au fost evacuați, 4 persoane au suferit răniri, iar 12 apartamente au devenit nelocuibile.",
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
      "1.578 morți la nivel național (din care circa 1.391 în București), 11.321 răniți, 33 blocuri prăbușite, 35.000 apartamente avariate. Pagube materiale: 2 miliarde USD (valoare 1977).",
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

  "inundatii-2006-romania": {
    slug: "inundatii-2006-romania",
    coords: [45.44, 28.05],
    fullDescription:
      "Între aprilie și august 2006, România a fost lovită de cele mai grave inundații din ultimele decenii. Dunărea a atins cote istorice, depășind recordurile din 1895. Peste 23 de persoane au murit, 15.000 au fost evacuate, iar pagubele au depășit 1 miliard de euro. Județele cele mai afectate au fost Galați, Tulcea, Mehedinți, Dolj și Olt. Sate întregi au fost acoperite de apă, iar infrastructura rutieră a fost distrusă pe sute de kilometri.",
    timeline: [
      { time: "Aprilie 2006", titlu: "Primele viituri pe afluenți", desc: "Râurile din vestul și sudul țării ies din matcă." },
      { time: "14 aprilie", titlu: "Dunărea depășește cotele de atenție", desc: "Nivel în creștere continuă la stațiile hidrografice." },
      { time: "Mai 2006", titlu: "Cod roșu hidrologic", desc: "Dunărea atinge cote record la Calafat și Bechet." },
      { time: "Iunie-Iulie 2006", titlu: "Inundații masive în sud-est", desc: "Galați, Tulcea — mii de case sub ape." },
      { time: "August 2006", titlu: "Apele se retrag treptat", desc: "Bilanțul final: 23 morți, 15.000 evacuați." },
    ],
    causes: [
      "Precipitații excepționale pe întregul bazin dunărean",
      "Topirea masivă a zăpezilor din Alpi și Carpați",
      "Diguri subdimensionate și prost întreținute",
      "Construcții ilegale în zonele inundabile",
      "Defrișări masive în bazinele hidrografice",
    ],
    impact:
      "23 de morți, 15.000 de persoane evacuate, peste 1 miliard EUR pagube materiale. 800+ localități afectate, zeci de mii de hectare agricole distruse. Infrastructura rutieră și feroviară grav avariată.",
    response:
      "Statul a activat Comitetul Național pentru Situații de Urgență. Armata a intervenit cu pontoane și elicoptere. UE a acordat asistență financiară de urgență. Banca Mondială a finanțat un program de reconstrucție de 500 milioane EUR.",
    quotes: [
      { text: "Dunărea a atins niveluri pe care nu le-am mai văzut de peste 100 de ani.", author: "INHGA — comunicat oficial 2006" },
      { text: "Sate întregi au dispărut sub apă în câteva ore.", author: "Prefectul județului Galați" },
    ],
    sources: [
      { name: "INHGA — rapoarte hidrologice 2006", url: "https://www.inhga.ro" },
      { name: "Comitetul Național pentru Situații de Urgență", url: "https://www.igsu.ro" },
      { name: "Banca Mondială — raport România 2006", url: "https://www.worldbank.org" },
    ],
  },

  "aderarea-romania-ue-2007": {
    slug: "aderarea-romania-ue-2007",
    coords: [44.4268, 26.1025],
    fullDescription:
      "La 1 ianuarie 2007, România a devenit stat membru al Uniunii Europene, alături de Bulgaria. Momentul a fost marcat de celebrări în Piața Universității și în întreaga țară. Aderarea a reprezentat finalul unui proces de negocieri început în 2000, cu reforme profunde în justiție, economie și administrație. România a fost totuși plasată sub Mecanismul de Cooperare și Verificare (MCV) pentru monitorizarea progreselor în justiție și lupta anticorupție.",
    timeline: [
      { time: "2000", titlu: "Începerea negocierilor de aderare", desc: "România deschide primele capitole de negociere." },
      { time: "25 aprilie 2005", titlu: "Semnarea Tratatului de Aderare", desc: "La Abația Neumünster, Luxemburg." },
      { time: "Decembrie 2006", titlu: "Raportul final CE", desc: "Confirmare: aderarea la 1 ianuarie 2007 cu MCV." },
      { time: "1 ianuarie 2007, 00:00", titlu: "România intră oficial în UE", desc: "Celebrări în Piața Universității, focuri de artificii." },
      { time: "Ianuarie 2007", titlu: "Primele efecte", desc: "Libertatea de circulație, acces la fonduri europene." },
    ],
    causes: [
      "Proces de aderare început în anii '90",
      "Reforme politice, economice și juridice profunde",
      "Condiții impuse de Comisia Europeană îndeplinite parțial",
      "Sprijin politic larg — majoritate parlamentară pro-UE",
    ],
    impact:
      "Accesul la piața unică europeană, libertatea de circulație pentru cetățeni, fonduri structurale de miliarde EUR. Creștere economică accelerată, dar și emigrație masivă — peste 3 milioane de români au plecat în vest în deceniul următor.",
    response:
      "Guvernul a organizat celebrări oficiale. Mecanismul de Cooperare și Verificare (MCV) a fost activat pentru monitorizarea reformelor în justiție. România a primit acces la fonduri europene de peste 30 miliarde EUR în primul cadru financiar.",
    quotes: [
      { text: "Este cel mai important moment din istoria post-comunistă a României.", author: "Traian Băsescu, Președintele României" },
      { text: "Welcome Romania! Welcome Bulgaria!", author: "José Manuel Barroso, Președintele Comisiei Europene" },
    ],
    sources: [
      { name: "Comisia Europeană — raport aderare", url: "https://ec.europa.eu" },
      { name: "Guvernul României — arhivă 2007", url: "https://www.gov.ro" },
    ],
  },

  "incendiu-maternitate-giulesti-2010": {
    slug: "incendiu-maternitate-giulesti-2010",
    coords: [44.459, 26.035],
    fullDescription:
      "Pe 16 august 2010, un incendiu devastator a izbucnit la Maternitatea Giulești din București. Focul a cuprins secția de terapie intensivă neonatală, ucigând 6 nou-născuți. Cauza a fost un scurtcircuit la un sterilizator electric defect. Tragedia a scos la iveală condițiile deplorabile din spitalele românești și lipsa investițiilor în infrastructura medicală.",
    timeline: [
      { time: "05:30", titlu: "Incendiu izbucnește la etajul 2", desc: "Scurtcircuit la sterilizator în secția ATI neonatală." },
      { time: "05:35", titlu: "Alertare 112", desc: "Personalul medical încearcă evacuarea nou-născuților." },
      { time: "05:42", titlu: "Sosesc echipajele ISU", desc: "3 autospeciale de la Detașamentul Militari." },
      { time: "06:00", titlu: "Incendiu localizat", desc: "6 nou-născuți declarați decedați." },
      { time: "06:30", titlu: "Evacuare completă a maternității", desc: "Restul pacienților transferați la alte spitale." },
    ],
    causes: [
      "Sterilizator electric defect, fără revizie",
      "Instalație electrică veche și suprasolicitată",
      "Lipsa sistemului automat de stingere în secția ATI",
      "Personal insuficient pe tura de noapte",
      "Lipsa investițiilor în infrastructura spitalicească",
    ],
    impact:
      "6 nou-născuți decedați, tragedie națională. Ancheta a relevat deficiențe grave în siguranța spitalelor. Demiterea conducerii spitalului și a inspectorului ISU sector.",
    response:
      "Ministrul Sănătății a demisionat. Guvernul a dispus verificări la toate maternitățile din țară. Au fost alocate fonduri de urgență pentru dotarea cu sisteme anti-incendiu. Proces penal împotriva conducerii spitalului.",
    quotes: [
      { text: "Este o tragedie care nu trebuia să se întâmple niciodată.", author: "Ministrul Sănătății, august 2010" },
      { text: "Condițiile din spitalele românești sunt inumane.", author: "Reacție Colegiul Medicilor" },
    ],
    sources: [
      { name: "ISU București — raport incendiu", url: "https://www.igsu.ro" },
      { name: "Ministerul Sănătății — comunicat", url: "https://www.ms.ro" },
      { name: "HotNews — arhivă august 2010", url: "https://www.hotnews.ro" },
    ],
  },

  "protest-rosia-montana-2013": {
    slug: "protest-rosia-montana-2013",
    coords: [44.4352, 26.1004],
    fullDescription:
      "În septembrie 2013, zeci de mii de români au ieșit în stradă în cele mai mari proteste de după Revoluție (la acel moment) împotriva proiectului minier de la Roșia Montană. Compania canadiană Gabriel Resources dorea să exploateze aurul cu cianuri, amenințând un sit arheologic roman unic și mediul înconjurător. Protestele au început spontan și s-au răspândit în peste 40 de orașe din România și diaspora.",
    timeline: [
      { time: "27 august 2013", titlu: "Guvernul aprobă proiectul de lege minier", desc: "Proiect controversat ajunge în Parlament." },
      { time: "1 septembrie 2013", titlu: "Primele proteste", desc: "Câteva sute de persoane în Piața Universității." },
      { time: "8 septembrie 2013", titlu: "Proteste masive", desc: "Peste 20.000 oameni în București, proteste în 40+ orașe." },
      { time: "15 septembrie 2013", titlu: "Vârf al mobilizării", desc: "Estimări de 30.000-50.000 protestatari la nivel național." },
      { time: "Octombrie 2013", titlu: "Proiectul de lege retras", desc: "Parlamentul respinge proiectul minier." },
      { time: "2021", titlu: "Roșia Montană — patrimoniu UNESCO", desc: "Peisajul minier roman inclus în lista UNESCO." },
    ],
    causes: [
      "Proiect de exploatare cu cianuri la Roșia Montană",
      "Amenințarea sitului arheologic roman (galerii antice unice)",
      "Lipsa transparenței în acordarea licenței",
      "Mobilizare spontană pe rețele sociale",
      "Conștiință ecologică în creștere în societatea civilă",
    ],
    impact:
      "Proiectul minier blocat definitiv. Roșia Montană a intrat în Patrimoniul UNESCO în 2021. Societatea civilă a demonstrat o forță de mobilizare fără precedent. Mișcarea ecologistă română a căpătat vizibilitate internațională.",
    response:
      "Parlamentul a respins proiectul de lege. Gabriel Resources a dat în judecată statul român la ICSID (arbitraj internațional), cerând despăgubiri de 4,4 miliarde USD. Procesul continuă în 2026.",
    quotes: [
      { text: "Uniți salvăm Roșia Montană!", author: "Slogan principal al protestelor" },
      { text: "Nu e doar despre un munte, e despre ce fel de țară vrem.", author: "Activist civic, septembrie 2013" },
    ],
    sources: [
      { name: "Salvați Roșia Montană", url: "https://www.rosiamontana.org" },
      { name: "UNESCO — World Heritage List", url: "https://whc.unesco.org" },
      { name: "Recorder — documentar Roșia Montană", url: "https://recorder.ro" },
    ],
  },

  "inundatii-oltenia-2014": {
    slug: "inundatii-oltenia-2014",
    coords: [44.32, 23.8],
    fullDescription:
      "În iulie 2014, județul Dolj și regiunea Olteniei au fost lovite de inundații severe cauzate de ploi torențiale. Râul Jiu a ieșit din matcă, iar localități întregi din zona Craiova au fost acoperite de apă. Sute de case au fost distruse sau grav avariate, iar mii de hectare de terenuri agricole au fost compromise.",
    timeline: [
      { time: "28 iulie 2014", titlu: "Cod roșu hidrologic", desc: "INHGA emite alertă pentru bazinul Jiului." },
      { time: "29 iulie 2014", titlu: "Jiul iese din matcă", desc: "Localități din Dolj inundate — Băilești, Calafat, Bechet." },
      { time: "30 iulie 2014", titlu: "Evacuări în masă", desc: "Sute de familii scoase cu bărci." },
      { time: "31 iulie 2014", titlu: "Armata intervine", desc: "Pontoane și elicoptere pentru zonele izolate." },
      { time: "August 2014", titlu: "Apele se retrag", desc: "Bilanțul pagubelor: sute de case distruse." },
    ],
    causes: [
      "Ploi torențiale excepționale — peste 100 l/mp în 24h",
      "Diguri nemodernizate pe cursul inferior al Jiului",
      "Defrișări pe versanții din amonte",
      "Construcții în zone inundabile",
    ],
    impact:
      "Sute de case distruse sau avariate grav, mii de hectare agricole compromise, infrastructură rutieră distrusă. Pagube estimate la zeci de milioane de euro.",
    response:
      "Comitetul Județean pentru Situații de Urgență a coordonat evacuările. Guvernul a alocat fonduri de urgență pentru reconstrucție. Crucea Roșie și ONG-uri au distribuit ajutoare umanitare.",
    quotes: [
      { text: "Am pierdut tot ce aveam. Casa, grădina, animalele — totul sub apă.", author: "Locuitor din Băilești" },
    ],
    sources: [
      { name: "INHGA — buletine hidrologice 2014", url: "https://www.inhga.ro" },
      { name: "Prefectura Dolj — raport situații de urgență", url: "https://www.prefecturadolj.ro" },
    ],
  },

  "incendiu-bamboo-2015": {
    slug: "incendiu-bamboo-2015",
    coords: [44.4268, 26.1025],
    fullDescription:
      "Pe 21 ianuarie 2015, un incendiu a izbucnit la clubul Bamboo din nordul Bucureștiului. Peste 400 de persoane au fost evacuate, iar aproximativ 40 au ajuns la spital cu intoxicații cu fum. Incendiul a fost provocat de un foc de artificii folosit în interior. Evenimentul a avut loc cu doar 9 luni înainte de tragedia de la Colectiv, dar nu a determinat măsuri legislative semnificative.",
    timeline: [
      { time: "02:00", titlu: "Incendiu izbucnește la Bamboo", desc: "Artificii aprind decorațiunile interioare." },
      { time: "02:05", titlu: "Evacuare de urgență", desc: "400+ persoane ies din club." },
      { time: "02:10", titlu: "Echipaje ISU la fața locului", desc: "Multiple autospeciale mobilizate." },
      { time: "02:45", titlu: "Incendiu stins", desc: "40 persoane transportate la spital cu intoxicații." },
      { time: "Zilele următoare", titlu: "Club închis temporar", desc: "Verificări ISU-IGSU la cluburi din București." },
    ],
    causes: [
      "Artificii folosite în interior — practică interzisă",
      "Materiale decorative inflamabile",
      "Supracapacitate — peste 400 persoane în club",
      "Sisteme de ventilație insuficiente",
    ],
    impact:
      "~40 persoane spitalizate cu intoxicație cu fum, fără decese. Pagube materiale semnificative. Incidentul a fost un avertisment ignorat — 9 luni mai târziu, tragedia Colectiv a ucis 64 de oameni.",
    response:
      "Clubul a fost închis temporar. ISU a efectuat verificări la câteva cluburi din București, dar fără rezultate legislative concrete. Autoritățile nu au luat măsuri sistemice.",
    quotes: [
      { text: "Am crezut că murim. Fumul era peste tot, nu mai vedeam nimic.", author: "Martor, client al clubului" },
    ],
    sources: [
      { name: "ISU București — comunicat 2015", url: "https://www.igsu.ro" },
      { name: "Digi24 — reportaj", url: "https://www.digi24.ro" },
    ],
  },

  "proteste-anti-coruptie-2018": {
    slug: "proteste-anti-coruptie-2018",
    coords: [44.4395, 26.0964],
    fullDescription:
      "Pe 20 ianuarie 2018, zeci de mii de români au ieșit în stradă în București și alte orașe mari pentru a protesta împotriva modificărilor aduse legilor justiției de coaliția PSD-ALDE. Protestele au vizat în special OUG 7/2019 (anunțată în acea perioadă) și modificările la Codurile Penale care slăbeau lupta anticorupție. A fost una dintre cele mai mari mobilizări civice din perioada 2017-2019.",
    timeline: [
      { time: "20 ianuarie 2018", titlu: "Protest masiv în Piața Victoriei", desc: "Peste 50.000 de oameni în București." },
      { time: "21 ianuarie 2018", titlu: "Proteste în alte orașe", desc: "Cluj, Timișoara, Iași, Sibiu — mii de participanți." },
      { time: "Februarie 2018", titlu: "Proteste continue", desc: "Mobilizare săptămânală în Piața Victoriei." },
      { time: "Martie 2018", titlu: "Legile justiției adoptate", desc: "Parlamentul votează modificările controversate." },
      { time: "2018-2019", titlu: "Contestări la CCR", desc: "Curte Constituțională declară neconstituționale mai multe articole." },
    ],
    causes: [
      "Modificări ale Codurilor Penale care reduceau pedepsele pentru corupție",
      "OUG-uri care subminau independența justiției",
      "Presiuni asupra DNA și procurorilor anticorupție",
      "Revocarea Laurei Codruța Kövesi de la șefia DNA",
      "Tensiuni acumulate din 2017 (OUG 13)",
    ],
    impact:
      "Legile justiției au fost adoptate, dar parțial invalidate de CCR. Laura Codruța Kövesi a devenit procuror-șef european (EPPO). Coaliția PSD-ALDE a pierdut alegerile europarlamentare din 2019.",
    response:
      "Guvernul a ignorat protestele și a adoptat legile. Președintele Iohannis a atacat legile la CCR. Comisia Europeană a criticat dur România în rapoartele MCV.",
    quotes: [
      { text: "Nu renunțăm! Justiția nu se negociază.", author: "Slogan protestatari 2018" },
      { text: "România riscă să reverseze progresele în lupta anticorupție.", author: "Comisia Europeană — raport MCV 2018" },
    ],
    sources: [
      { name: "Comisia Europeană — raport MCV 2018", url: "https://ec.europa.eu" },
      { name: "Recorder — documentar protestele 2018", url: "https://recorder.ro" },
      { name: "Digi24 — live text proteste", url: "https://www.digi24.ro" },
    ],
  },

  "pandemia-covid-19-2020": {
    slug: "pandemia-covid-19-2020",
    coords: [44.4268, 26.1025],
    fullDescription:
      "Pe 16 martie 2020, România a declarat stare de urgență ca răspuns la pandemia de COVID-19. Primul caz fusese confirmat pe 26 februarie 2020. Până în 2023, peste 67.000 de români au murit din cauza virusului. Pandemia a impus lockdown-uri, restricții fără precedent, și a transformat radical viața socială și economică. Campania de vaccinare, deși inițial apreciată, a întâmpinat rezistență semnificativă.",
    timeline: [
      { time: "26 februarie 2020", titlu: "Primul caz confirmat", desc: "Bărbat din Gorj, contact al unui italian." },
      { time: "16 martie 2020", titlu: "Stare de urgență declarată", desc: "Decret prezidențial — restricții totale de circulație." },
      { time: "Aprilie 2020", titlu: "Lockdown total", desc: "Ieșirea din casă doar cu declarație pe proprie răspundere." },
      { time: "15 mai 2020", titlu: "Stare de alertă", desc: "Relaxare parțială, mască obligatorie." },
      { time: "27 decembrie 2020", titlu: "Începe vaccinarea", desc: "Prima persoană vaccinată — asistentă medicală la Institutul Matei Balș." },
      { time: "Octombrie 2021", titlu: "Val 4 devastator", desc: "Peste 500 decese/zi, spitale depășite, morgile pline." },
      { time: "2023", titlu: "Bilanț final", desc: "Peste 67.000 decese oficiale, milioane de infectări." },
    ],
    causes: [
      "Pandemia globală SARS-CoV-2 originată din China",
      "Sistem medical subdimensionat — paturi ATI insuficiente",
      "Rezistență la vaccinare — rata de vaccinare sub 42%",
      "Dezinformare masivă pe rețele sociale",
      "Infrastructură spitalicească precară",
    ],
    impact:
      "Peste 67.000 de decese oficiale (estimări reale mai mari). Economie afectată grav — PIB scăzut cu 3,7% în 2020. Educație perturbată — 2 ani de școală online. Sănătate mintală deteriorată la nivel național. Emigrație accelerată din sistemul medical.",
    response:
      "Stare de urgență (martie-mai 2020), apoi stare de alertă prelungită. Campanie de vaccinare cu centre drive-through și maratoane. Fonduri europene PNRR pentru spitale. CNCAV a coordonat vaccinarea. Armata a construit spitale modulare.",
    quotes: [
      { text: "Stați acasă! Acest virus ucide.", author: "Președintele Klaus Iohannis, martie 2020" },
      { text: "Sistemul medical românesc a ajuns la limita sa absolută.", author: "Raed Arafat, șeful DSU" },
    ],
    sources: [
      { name: "INSP — date epidemiologice", url: "https://www.insp.gov.ro" },
      { name: "Guvernul României — hotărâri CNSU", url: "https://www.gov.ro" },
      { name: "Our World in Data — Romania", url: "https://ourworldindata.org" },
    ],
  },

  "poluare-somes-cluj-2020": {
    slug: "poluare-somes-cluj-2020",
    coords: [46.7712, 23.5897],
    fullDescription:
      "În 2020, râul Someș din zona Cluj-Napoca a fost afectat de o poluare chimică gravă. Substanțe toxice deversate din zona industrială au provocat moartea masivă a peștilor și contaminarea apei pe zeci de kilometri. Garda de Mediu a fost alertată de localnici care au observat pești morți plutind la suprafață. Incidentul a readus în atenție problema poluării industriale din România.",
    timeline: [
      { time: "Dimineața", titlu: "Deversare chimică detectată", desc: "Substanțe toxice ajung în Someș din zona industrială." },
      { time: "Ore 10-12", titlu: "Pești morți pe Someș", desc: "Localnicii raportează mii de pești morți." },
      { time: "După-amiaza", titlu: "Garda de Mediu alertată", desc: "Echipe de intervenție la fața locului." },
      { time: "Seara", titlu: "Urgență ecologică declarată", desc: "Prelevare probe de apă, identificare sursă." },
      { time: "Zilele următoare", titlu: "Investigație", desc: "Amendă și dosar penal pentru poluator." },
    ],
    causes: [
      "Deversare ilegală de substanțe chimice din zona industrială",
      "Control insuficient al Gărzii de Mediu asupra agenților economici",
      "Stații de epurare depășite sau inexistente la unele fabrici",
      "Legislație de mediu aplicată deficitar",
    ],
    impact:
      "Mii de pești morți pe zeci de kilometri. Ecosistemul acvatic al Someșului grav afectat. Apa nepotabilă temporar în zonele din aval. Alertă publică privind calitatea apei.",
    response:
      "Garda de Mediu a aplicat amenzi și a sesizat parchetul. Autoritatea Apelor a monitorizat calitatea apei. Primăria Cluj-Napoca a cerut măsuri suplimentare de protecție a Someșului.",
    quotes: [
      { text: "Someșul a devenit un râu mort pe porțiuni întregi.", author: "Activist de mediu local" },
    ],
    sources: [
      { name: "Garda Națională de Mediu — raport", url: "https://www.gnm.ro" },
      { name: "Administrația Bazinală de Apă Someș-Tisa", url: "https://www.rowater.ro" },
    ],
  },

  "incendiu-spital-piatra-neamt-2020": {
    slug: "incendiu-spital-piatra-neamt-2020",
    coords: [46.9275, 26.3587],
    fullDescription:
      "Pe 14 noiembrie 2020, un incendiu a izbucnit la secția ATI a Spitalului Județean Piatra Neamț, ucigând 10 pacienți COVID-19 internați la terapie intensivă. Medicul de gardă, dr. Cătălin Denciu, a suferit arsuri grave încercând să salveze pacienți și a fost transferat în Belgia pentru tratament. Tragedia a fost al doilea incendiu mortal într-un spital românesc în timpul pandemiei.",
    timeline: [
      { time: "18:30", titlu: "Incendiu izbucnește la ATI", desc: "Posibil scurtcircuit la instalația electrică." },
      { time: "18:35", titlu: "Medicul Denciu încearcă salvarea", desc: "Dr. Cătălin Denciu scoate pacienți din flăcări, suferind arsuri pe 80% din corp." },
      { time: "18:40", titlu: "Alertă ISU", desc: "Echipaje de pompieri ajung la spital." },
      { time: "19:00", titlu: "Incendiu stins", desc: "10 pacienți decedați — toți bolnavi COVID." },
      { time: "15 noiembrie", titlu: "Dr. Denciu transferat în Belgia", desc: "Transport aerian de urgență pentru tratament arsuri." },
      { time: "Noiembrie 2020", titlu: "Doliu național", desc: "Ancheta scoate la iveală deficiențe grave." },
    ],
    causes: [
      "Instalație electrică veche și neconformă",
      "Lipsa sistemelor automate de stingere în ATI",
      "Concentratoare de oxigen lângă surse electrice",
      "Spital vechi, fără modernizări majore",
      "Suprasolicitare extremă în pandemie",
    ],
    impact:
      "10 pacienți COVID-19 decedați, medic erou cu arsuri grave. Tragedie care a șocat România în plină pandemie. Anchete la nivel național în toate spitalele.",
    response:
      "Guvernul a dispus verificări ISU în toate spitalele din țară. Managerul spitalului demis și cercetat penal. Dr. Denciu a primit Ordinul Național 'Steaua României'. Fonduri europene redirecționate pentru securitate la incendiu în spitale.",
    quotes: [
      { text: "A intrat în flăcări să-și salveze pacienții. Este un erou.", author: "Colegii despre dr. Cătălin Denciu" },
      { text: "Câți oameni trebuie să moară până când spitalele românești vor fi sigure?", author: "Editorial Libertatea" },
    ],
    sources: [
      { name: "ISU Neamț — raport incendiu", url: "https://www.igsu.ro" },
      { name: "Ministerul Sănătății — comunicat", url: "https://www.ms.ro" },
      { name: "Libertatea — anchetă", url: "https://www.libertatea.ro" },
    ],
  },

  "incendiu-spital-matei-bals-2021": {
    slug: "incendiu-spital-matei-bals-2021",
    coords: [44.435, 26.069],
    fullDescription:
      "Pe 29 ianuarie 2021, un incendiu a izbucnit la Pavilionul V al Institutului Matei Balș din București, cel mai important centru de boli infecțioase din România. Focul a ucis 14 pacienți, majoritatea infectați cu COVID-19. Pavilionul avea instalații electrice vechi, fără autorizație ISU, și era supraaglomerat. A fost al treilea incendiu mortal într-un spital românesc în mai puțin de un an.",
    timeline: [
      { time: "05:00", titlu: "Incendiu la Pavilionul V", desc: "Focul pornește de la instalația electrică defectă." },
      { time: "05:05", titlu: "Alertare 112 și ISU", desc: "Personal medical evacuează pacienți." },
      { time: "05:15", titlu: "Echipaje ISU la fața locului", desc: "7 autospeciale mobilizate." },
      { time: "05:45", titlu: "Incendiu stins", desc: "Bilanț: 5 morți pe loc, 9 decedați ulterior." },
      { time: "29 ianuarie", titlu: "Doliu național de facto", desc: "Reacții de indignare în toată România." },
      { time: "Februarie 2021", titlu: "Ancheta", desc: "Deficiențe grave confirmate — pavilion fără autorizație ISU." },
    ],
    causes: [
      "Instalație electrică veche — pavilion construit în anii '60",
      "Lipsa autorizației ISU de funcționare",
      "Supraîncărcare din cauza pandemiei",
      "Lipsa detectoarelor de fum funcționale",
      "Întreținere inexistentă a clădirii",
    ],
    impact:
      "14 pacienți decedați (bilanț final). Al treilea incendiu mortal în spitale în pandemie (după Neamț și Constanța). Criză de încredere în sistemul medical. Dezbatere națională despre investiții în infrastructura spitalicească.",
    response:
      "Guvernul a demarat programul de verificare ISU a tuturor spitalelor. Pavilionul V demolat. Fonduri PNRR alocate pentru construcția unui nou institut de boli infecțioase. Dosare penale pentru conducerea institutului.",
    quotes: [
      { text: "Pacienții au murit într-un pavilion care nu avea voie să funcționeze.", author: "Raport ISU post-incident" },
      { text: "România arde de la spital la spital și nimeni nu răspunde.", author: "Editorial de presă, ianuarie 2021" },
    ],
    sources: [
      { name: "ISU București — raport", url: "https://www.igsu.ro" },
      { name: "Ministerul Sănătății", url: "https://www.ms.ro" },
      { name: "HotNews — anchetă Matei Balș", url: "https://www.hotnews.ro" },
    ],
  },

  "revolutia-decembrie-1989-timisoara": {
    slug: "revolutia-decembrie-1989-timisoara",
    coords: [45.7489, 21.2087],
    fullDescription:
      "Revoluția Română din decembrie 1989 a început la Timișoara, unde comunitatea s-a mobilizat pentru a-l apăra pe pastorul reformat László Tőkés, amenințat cu evacuarea forțată din locuința sa. Pe 16 decembrie, sute de oameni s-au adunat în fața Bisericii Reformate din Strada Timotei Cipariu, iar protestul s-a extins rapid în întregul oraș.\n\nÎn zilele următoare, mulțimile au crescut la zeci de mii de oameni care au ocupat Piața Operei (actuala Piață a Victoriei), cerând libertate și sfârșitul regimului Ceaușescu. Armata și Securitatea au deschis focul asupra manifestanților, provocând peste 100 de morți doar în Timișoara. Pe 20 decembrie, Timișoara a fost declarat primul oraș liber din România comunistă.\n\nSacrificiul timișorenilor a fost catalizatorul care a declanșat mișcarea revoluționară la nivel național și a dus la căderea regimului comunist în România.",
    timeline: [
      { time: "16 dec, seara", titlu: "Adunare la Biserica Reformată", desc: "Sute de oameni se adună pentru a-l proteja pe pastorul László Tőkés de evacuarea forțată." },
      { time: "17 dec, dimineața", titlu: "Protestul se extinde", desc: "Mii de oameni ies în stradă, se îndreaptă spre centrul orașului." },
      { time: "17 dec, seara", titlu: "Armata deschide focul", desc: "Tancuri și soldați trag în mulțime pe Calea Lipovei și în Piața Libertății." },
      { time: "18 dec", titlu: "Represiune continuă", desc: "Cadavrele victimelor sunt ridicate în secret de Securitate, unele incinerate la crematoriul din București." },
      { time: "19 dec", titlu: "Fabricile se alătură", desc: "Muncitorii de la Elba, Solventul și alte fabrici intră în grevă generală." },
      { time: "20 dec", titlu: "Timișoara — oraș liber", desc: "Armata fraternizează cu protestatarii. Timișoara devine primul oraș liber din România comunistă." },
    ],
    causes: [
      "Încercarea de evacuare forțată a pastorului László Tőkés, critic al regimului",
      "Decenii de represiune, lipsuri materiale și lipsa libertăților fundamentale",
      "Izolarea internațională a regimului Ceaușescu",
      "Efectul domino al revoluțiilor din Europa de Est (Polonia, Ungaria, Cehoslovacia, Germania de Est)",
    ],
    impact:
      "Peste 100 de persoane ucise doar în Timișoara (cifrele exacte sunt încă disputate). Timișoara a devenit simbolul curajului civic și al sacrificiului pentru libertate. Evenimentele au declanșat revoluția la nivel național, ducând la căderea regimului Ceaușescu în mai puțin de 10 zile.",
    response:
      "Inițial, regimul a încercat să reprime brutal protestele cu armata și Securitatea. Pe 20 decembrie, armata a refuzat să mai tragă și a fraternizat cu populația. După revoluție, Timișoara a primit titlul de Oraș-Martir.",
    quotes: [
      { text: "Azi în Timișoara, mâine-n toată țara!", author: "Scandare a protestatarilor din Timișoara, decembrie 1989" },
      { text: "Am crezut că vom muri cu toții, dar am ales să rămânem în stradă.", author: "Mărturie supraviețuitor, Piața Operei" },
    ],
    sources: [
      { name: "Wikipedia — Revoluția Română din 1989", url: "https://ro.wikipedia.org/wiki/Revolu%C8%9Bia_rom%C3%A2n%C4%83_din_1989" },
      { name: "Memorialul Revoluției Timișoara", url: "https://www.memorialulrevolutiei.ro" },
      { name: "Comisia Parlamentară pentru Revoluție", url: "https://www.cdep.ro" },
    ],
    ongoingStatus: "Dosarele Revoluției sunt încă în instanță la ÎCCJ. Adevărul complet despre evenimentele din decembrie 1989 rămâne parțial neclarificat.",
  },

  "revolutia-decembrie-1989-bucuresti": {
    slug: "revolutia-decembrie-1989-bucuresti",
    coords: [44.4395, 26.0964],
    fullDescription:
      "Pe 21 decembrie 1989, Nicolae Ceaușescu a convocat un miting în fața sediului CC al PCR din Piața Palatului (actuala Piață a Revoluției) pentru a condamna evenimentele din Timișoara. Mulțimea adunată a început să huiduie, iar transmisia TV în direct a surprins expresia de șoc de pe chipul dictatorului — un moment iconic al revoluției.\n\nÎn orele următoare, protestele s-au extins în tot Bucureștiul. Armata și Securitatea au deschis focul, iar luptele de stradă au durat până pe 25 decembrie. Ceaușescu și soția sa Elena au fugit cu elicopterul de pe acoperișul CC, dar au fost capturați la Târgoviște.\n\nPe 25 decembrie, Nicolae și Elena Ceaușescu au fost judecați sumar de un tribunal militar și executați prin împușcare. Bilanțul oficial al revoluției la nivel național depășește 1.100 de morți și 3.300 de răniți, din care cea mai mare parte în București.",
    timeline: [
      { time: "21 dec, 12:00", titlu: "Mitingul din Piața Palatului", desc: "Ceaușescu vorbește mulțimii. Huiduieli în direct la TV." },
      { time: "21 dec, seara", titlu: "Proteste în tot Bucureștiul", desc: "Baricade pe Calea Victoriei, Bd. Magheru, Piața Universității." },
      { time: "22 dec, dimineața", titlu: "Armata fraternizează", desc: "Ministrul Apărării Vasile Milea moare (sinucidere sau asasinat). Armata trece de partea poporului." },
      { time: "22 dec, 12:06", titlu: "Ceaușescu fuge", desc: "Elicopterul decolează de pe acoperișul CC. Mulțimea ocupă clădirea." },
      { time: "22-25 dec", titlu: "Lupte de stradă", desc: "Focuri intense în jurul Televiziunii, Palatului, Aeroportului Otopeni. Sute de morți." },
      { time: "25 dec", titlu: "Execuția soților Ceaușescu", desc: "Proces sumar la Târgoviște. Sentința: moarte prin împușcare, executată imediat." },
    ],
    causes: [
      "Contagiunea revoluționară pornită de la Timișoara",
      "Regim totalitar rigid, refuzul oricărei reforme",
      "Criză economică severă — rațializare alimente, frig, lipsuri generalizate",
      "Represiunea Securității și izolarea internațională a regimului",
      "Efectul revoluțiilor din blocul comunist (1989 — anul miracolelor)",
    ],
    impact:
      "Peste 500 de morți doar în București (1.104 la nivel național conform datelor oficiale, cifre contestate). Căderea regimului comunist. România a devenit republică semi-prezidențială. Tranziția spre democrație și economia de piață a început, marcată de instabilitate politică și economică.",
    response:
      "Frontul Salvării Naționale (FSN) condus de Ion Iliescu a preluat puterea. Televiziunea Română a transmis non-stop evenimentele. Armata a trecut de partea revoluționarilor. Ajutor umanitar internațional masiv.",
    quotes: [
      { text: "Libertate! Libertate!", author: "Scandare mulțime, Piața Revoluției, 22 decembrie 1989" },
      { text: "Ceaușescu, te-ai dus! Vino-ncoa' dacă poți!", author: "Cântec popular scandat de revoluționari" },
    ],
    sources: [
      { name: "Wikipedia — Revoluția Română din 1989", url: "https://ro.wikipedia.org/wiki/Revolu%C8%9Bia_rom%C3%A2n%C4%83_din_1989" },
      { name: "Arhiva TVR — transmisii decembrie 1989", url: "https://www.tvr.ro" },
      { name: "Institutul Revoluției Române", url: "https://www.irrd.ro" },
    ],
    ongoingStatus: "Dosarul Revoluției se judecă la Înalta Curte de Casație și Justiție. Ion Iliescu a fost trimis în judecată pentru infracțiuni contra umanității.",
  },

  "revolutia-decembrie-1989-cluj": {
    slug: "revolutia-decembrie-1989-cluj",
    coords: [46.7712, 23.5897],
    fullDescription:
      "Pe 21 decembrie 1989, vestea evenimentelor din Timișoara și București a ajuns rapid la Cluj-Napoca. Studenții și muncitorii au ieșit în stradă, organizând proteste masive în centrul orașului, în special în zona Operei Naționale și a Pieței Libertății.\n\nForțele de ordine au intervenit brutal, deschizând focul asupra manifestanților. 26 de persoane au fost ucise la Cluj, iar zeci de alții au fost răniți. Printre victime s-au numărat studenți, muncitori și trecători.\n\nCluj-Napoca a fost unul dintre orașele cu cel mai puternic spirit revoluționar, iar sacrificiul clujean a contribuit esențial la succesul revoluției la nivel național.",
    timeline: [
      { time: "21 dec, dimineața", titlu: "Vestea ajunge la Cluj", desc: "Se află despre mitingul eșuat al lui Ceaușescu și protestele din București." },
      { time: "21 dec, prânz", titlu: "Studenții ies în stradă", desc: "Coloane de studenți pornesc de la cămine spre centru." },
      { time: "21 dec, după-amiaza", titlu: "Proteste masive", desc: "Zeci de mii de oameni în Piața Libertății și la Operă." },
      { time: "21 dec, seara", titlu: "Focuri de armă", desc: "Securitatea și armata deschid focul. 26 de morți." },
      { time: "22 dec", titlu: "Armata fraternizează", desc: "Clujul devine liber. Se formează comitetele revoluționare." },
    ],
    causes: [
      "Efectul revoluționar al evenimentelor din Timișoara și București",
      "Spirit civic puternic în mediul universitar clujean",
      "Nemulțumire acumulată față de regimul comunist",
      "Dorința de libertate și democrație",
    ],
    impact:
      "26 de morți și zeci de răniți la Cluj-Napoca. Orașul a fost eliberat pe 22 decembrie. Cluj-Napoca a devenit unul dintre centrele revoluționare importante ale țării. Victimele au fost comemorate anual la Monumentul Eroilor Revoluției.",
    response:
      "După căderea regimului, s-a format Consiliul Frontului Salvării Naționale la nivel local. Armata a trecut de partea populației. Spitalele au tratat răniții în condiții dificile.",
    quotes: [
      { text: "Am văzut cum cădeau oamenii lângă mine. Nu am fugit. Am rămas pentru libertate.", author: "Mărturie student clujean, decembrie 1989" },
    ],
    sources: [
      { name: "Wikipedia — Revoluția la Cluj-Napoca", url: "https://ro.wikipedia.org/wiki/Revolu%C8%9Bia_rom%C3%A2n%C4%83_din_1989" },
      { name: "Arhiva Universității Babeș-Bolyai", url: "https://www.ubbcluj.ro" },
    ],
  },

  "revolutia-decembrie-1989-sibiu": {
    slug: "revolutia-decembrie-1989-sibiu",
    coords: [45.7983, 24.1256],
    fullDescription:
      "Sibiul a fost unul dintre orașele cel mai grav afectate de represiunea din decembrie 1989. Pe 21 și 22 decembrie, protestele au izbucnit în centrul istoric, iar răspunsul forțelor de represiune a fost extrem de violent. 99 de persoane au fost ucise la Sibiu, făcându-l orașul cu cele mai multe victime per capita după Timișoara.\n\nO mare parte a victimelor au căzut după 22 decembrie, în timpul confuziei și al tirurilor încrucișate din noaptea de 22/23 decembrie. Securitatea a acționat agresiv, iar armata, în condiții de vizibilitate scăzută și panică, a contribuit involuntar la bilanțul tragic.\n\nNicu Ceaușescu, fiul cel mic al dictatorului, era prim-secretar PCR la Sibiu, ceea ce a făcut ca represiunea să fie și mai dură în acest oraș.",
    timeline: [
      { time: "21 dec, după-amiaza", titlu: "Proteste în centrul Sibiului", desc: "Mii de oameni cer căderea regimului." },
      { time: "21 dec, seara", titlu: "Primele focuri de armă", desc: "Forțele de ordine deschid focul în Piața Mare." },
      { time: "22 dec, dimineața", titlu: "Nicu Ceaușescu arestat", desc: "Fiul dictatorului este prins și reținut de revoluționari." },
      { time: "22-23 dec, noaptea", titlu: "Tiruri încrucișate", desc: "Confuzie totală — armata și Securitatea trag unii în alții. Cele mai multe victime." },
      { time: "23 dec", titlu: "Liniștea revine", desc: "Bilanț tragic: 99 morți, cel mai mare din țară per capita." },
    ],
    causes: [
      "Prezența lui Nicu Ceaușescu ca prim-secretar a intensificat represiunea",
      "Confuzie între armată și Securitate după căderea regimului",
      "Lipsa coordonării între forțele armate în tranziția de putere",
      "Panică generală și dezinformare activă",
    ],
    impact:
      "99 de persoane ucise la Sibiu — cel mai mare bilanț per capita din țară, după Timișoara. Sute de răniți. Nicu Ceaușescu a fost judecat și condamnat la 20 de ani de închisoare (eliberat în 1992). Sibiul a fost profund marcat de tragedie.",
    response:
      "Nicu Ceaușescu a fost arestat imediat. Spitalul Județean Sibiu a funcționat la capacitate maximă. Comitetul revoluționar local a preluat administrarea orașului.",
    quotes: [
      { text: "Sibiul a plătit cel mai mare preț. 99 de suflete pentru libertate.", author: "Comemorare anuală, Piața Mare, Sibiu" },
    ],
    sources: [
      { name: "Wikipedia — Revoluția la Sibiu", url: "https://ro.wikipedia.org/wiki/Revolu%C8%9Bia_rom%C3%A2n%C4%83_din_1989" },
      { name: "Memorialul Victimelor Revoluției Sibiu", url: "https://www.sibiu.ro" },
      { name: "Asociația 21 Decembrie — Sibiu", url: "https://www.asociatia21decembrie.ro" },
    ],
  },

  "revolutia-decembrie-1989-brasov": {
    slug: "revolutia-decembrie-1989-brasov",
    coords: [45.6427, 25.5887],
    fullDescription:
      "Brașovul avea deja o tradiție de protest anticomunist — în noiembrie 1987, muncitorii de la uzina Steagul Roșu (fostul Tractorul) ieșiseră în stradă într-o revoltă reprimată brutal. În decembrie 1989, spiritul contestatar s-a reaprins cu forță.\n\nPe 21 decembrie, după aflarea veștilor din Timișoara și București, muncitorii de la fabrica Tractorul și alte întreprinderi au ieșit în stradă alături de studenți și cetățeni. Protestele s-au concentrat în centrul orașului, în zona Pieței Sfatului.\n\nRepresiunea a fost violentă — peste 60 de persoane au fost ucise la Brașov în zilele revoluției, multe dintre victime fiind muncitori și tineri.",
    timeline: [
      { time: "21 dec, dimineața", titlu: "Muncitorii de la Tractorul ies în stradă", desc: "Coloane de muncitori pornesc spre centrul Brașovului." },
      { time: "21 dec, prânz", titlu: "Proteste masive în Piața Sfatului", desc: "Zeci de mii de oameni scandează lozinci anti-Ceaușescu." },
      { time: "21 dec, seara", titlu: "Represiune violentă", desc: "Focuri de armă în centrul orașului. Zeci de morți." },
      { time: "22 dec", titlu: "Brașovul se eliberează", desc: "Armata fraternizează cu protestatarii. Sediul PCR ocupat." },
      { time: "22-23 dec", titlu: "Lupte sporadice", desc: "Tiruri de Securitate continuă în zone izolate." },
    ],
    causes: [
      "Tradiție de protest — revolta muncitorească din noiembrie 1987",
      "Muncitorii de la Tractorul și alte fabrici, nemulțumiți de condiții",
      "Efectul revoluționar al evenimentelor din Timișoara și București",
      "Solidaritate puternică între muncitori și studenți",
    ],
    impact:
      "Peste 60 de persoane ucise la Brașov. Orașul a fost eliberat pe 22 decembrie. Sacrificiul brașovenilor a întărit mișcarea revoluționară la nivel național. Brașovul a primit ulterior statut de Oraș-Erou al Revoluției.",
    response:
      "Consiliul Frontului Salvării Naționale local a preluat puterea. Armata a asigurat securitatea orașului. Victimele au fost comemorate la Monumentul Eroilor Revoluției din Piața Sfatului.",
    quotes: [
      { text: "În '87 ne-au bătut și ne-au deportat. În '89 nu am mai dat înapoi.", author: "Muncitor de la Tractorul, mărturie" },
    ],
    sources: [
      { name: "Wikipedia — Revoluția la Brașov", url: "https://ro.wikipedia.org/wiki/Revolu%C8%9Bia_rom%C3%A2n%C4%83_din_1989" },
      { name: "Arhiva revoltei din 1987", url: "https://www.memorialsighet.ro" },
    ],
  },

  "mineriada-iunie-1990": {
    slug: "mineriada-iunie-1990",
    coords: [44.4268, 26.1025],
    fullDescription:
      "Mineriada din iunie 1990 rămâne unul dintre cele mai controversate și traumatizante episoade din istoria post-comunistă a României. Pe 13-15 iunie, mii de mineri din Valea Jiului au fost transportați la București, unde au atacat violent studenții, intelectualii și opozanții politici care protestau pașnic în Piața Universității.\n\nPreședintele Ion Iliescu i-a chemat pe mineri să 'restabilească ordinea' — un apel care a dus la bătăi sistematice ale civililor, devastarea sediilor partidelor de opoziție (PNL, PNȚCD) și a redacțiilor presei independente. Bilanțul oficial vorbește de 7 morți, dar cifrele reale sunt considerate mult mai mari.\n\nMineriada a marcat profund democrația românească incipientă și a atras condamnări internaționale masive, deteriorând grav imaginea României pe plan extern.",
    timeline: [
      { time: "13 iun, noaptea", titlu: "Minerii pornesc spre București", desc: "Trenuri speciale transportă mii de mineri din Valea Jiului." },
      { time: "14 iun, dimineața", titlu: "Minerii ajung în Capitală", desc: "Înarmați cu bâte și lanțuri, se îndreaptă spre Piața Universității." },
      { time: "14 iun, 06:00", titlu: "Atacul asupra Pieței Universității", desc: "Studenții și protestatarii sunt bătuți sistematic." },
      { time: "14 iun, ziua", titlu: "Devastare sedii opoziție", desc: "Sediile PNL, PNȚCD, România Liberă atacate și distruse." },
      { time: "14 iun, seara", titlu: "Iliescu mulțumește minerilor", desc: "'Vă mulțumesc pentru ceea ce ați făcut' — discurs la Cotroceni." },
      { time: "15 iun", titlu: "Minerii se retrag", desc: "Bilanț oficial: 7 morți (cifre disputate), sute de răniți." },
    ],
    causes: [
      "Protestele continue din Piața Universității (Golaniada) deranjau noul regim",
      "Apelul președintelui Iliescu către mineri pentru 'restabilirea ordinii'",
      "Tensiuni între FSN și opoziția politică",
      "Manipularea minerilor prin dezinformare (protestatarii prezentați ca 'huligani' și 'legionari')",
    ],
    impact:
      "Cel puțin 7 morți (oficial), sute de răniți, sedii de partide și redacții devastate. Condamnare internațională masivă — România izolată diplomatic. Democrația românească grav afectată. Iliescu condamnat ulterior de CEDO. Imaginea minerului Valea Jiului — stigmatizată pentru decenii.",
    response:
      "Guvernul a prezentat evenimentele ca 'restabilire a ordinii'. Comunitatea internațională a condamnat dur agresiunile. CEDO a condamnat România în 2014 pentru violențe. Dosarele penale au durat peste 25 de ani.",
    quotes: [
      { text: "Vă mulțumesc pentru ceea ce ați făcut.", author: "Ion Iliescu, 14 iunie 1990, către mineri" },
      { text: "A fost o zi neagră pentru democrația românească.", author: "Marian Munteanu, lider studențesc" },
    ],
    sources: [
      { name: "Wikipedia — Mineriada din iunie 1990", url: "https://ro.wikipedia.org/wiki/Mineriada_din_iunie_1990" },
      { name: "CEDO — hotărârea Stoica și alții vs. România", url: "https://hudoc.echr.coe.int" },
      { name: "Recorder — documentar mineriade", url: "https://recorder.ro" },
    ],
  },

  "protest-piata-universitatii-1990": {
    slug: "protest-piata-universitatii-1990",
    coords: [44.4352, 26.1004],
    fullDescription:
      "Între aprilie și iunie 1990, Piața Universității din București a fost ocupată de studenți, intelectuali și cetățeni care protestau împotriva conducerii Frontului Salvării Naționale (FSN) și a lui Ion Iliescu. Mișcarea a fost numită ironic 'Golaniada' — după ce Iliescu i-a numit pe protestatari 'golani'.\n\nProtestatarii cereau eliminarea foștilor comuniști din viața politică (punctul 8 al Proclamației de la Timișoara), alegeri libere reale și presă independentă. Piața Universității a fost declarată simbolic 'zonă liberă de neo-comunism'.\n\nProtestul a durat aproape două luni și a fost desființat violent în timpul mineriadei din iunie 1990. Piața Universității a rămas un simbol al societății civile românești și al rezistenței democratice.",
    timeline: [
      { time: "22 apr", titlu: "Începe ocuparea Pieței", desc: "Studenți și intelectuali instalează corturi și pancarte." },
      { time: "25 apr", titlu: "'Zona liberă de neo-comunism'", desc: "Piața este declarată simbolic teritoriu liber." },
      { time: "20 mai", titlu: "Alegeri câștigate de FSN", desc: "Iliescu ales președinte cu 85%. Protestul continuă." },
      { time: "Mai-iun", titlu: "Protest permanent", desc: "Sute de oameni ocupă piața zi și noapte, dezbateri publice continue." },
      { time: "13 iun", titlu: "Poliția intervine", desc: "Încercare de evacuare a pieței, urmată de represiune." },
      { time: "14-15 iun", titlu: "Mineriada desființează protestul", desc: "Minerii distrug totul. Protestatarii bătuți brutal." },
    ],
    causes: [
      "Nemulțumirea față de preluarea puterii de către foști comuniști (FSN)",
      "Punctul 8 al Proclamației de la Timișoara — interdicția foștilor activiști PCR în politică",
      "Lipsa presei libere și a dezbaterii democratice reale",
      "Alegeri considerate nelegitime de opoziție",
    ],
    impact:
      "Piața Universității a devenit simbol al rezistenței civice. Protestul a fost suprimat violent prin mineriada din iunie. Termenul 'Golaniada' a fost revendicat cu mândrie de protestatari. A marcat nașterea societății civile post-comuniste în România.",
    response:
      "Autoritățile au catalogat protestatarii drept 'golani' și 'huligani'. Protestul a fost tolerat inițial, apoi desființat prin violența mineriadei. Comunitatea internațională a criticat dur represiunea.",
    quotes: [
      { text: "Mai bine golan decât comunist!", author: "Lozincă a protestatarilor din Piața Universității" },
      { text: "Piața Universității — prima zonă liberă de neo-comunism din România.", author: "Pancartă din Piața Universității, 1990" },
    ],
    sources: [
      { name: "Wikipedia — Golaniada", url: "https://ro.wikipedia.org/wiki/Golaniada" },
      { name: "Memorialul Revoluției — arhivă", url: "https://www.memorialulrevolutiei.ro" },
    ],
  },

  "cutremur-vrancea-1990": {
    slug: "cutremur-vrancea-1990",
    coords: [45.83, 26.89],
    fullDescription:
      "Pe 30 mai 1990, la ora 13:40, un cutremur cu magnitudinea de 6.9 grade pe scara Richter a zguduit România. Epicentrul a fost localizat în zona seismică Vrancea, la o adâncime de aproximativ 91 km. A fost cel mai puternic cutremur din România de după seismul devastator din 1977.\n\nDeși magnitudinea a fost semnificativă, cutremurul nu a provocat victime și pagubele materiale au fost relativ minore. Adâncimea mare a focarului și îmbunătățirile aduse normelor de construcție după 1977 au contribuit la limitarea efectelor.\n\nCutremurul a avut loc într-o perioadă extrem de tensionată politic — la doar câteva săptămâni după alegerile din 20 mai 1990 și în plin protest al Pieței Universității.",
    timeline: [
      { time: "13:40", titlu: "Cutremur de 6.9 Richter", desc: "Epicentru în zona Vrancea, adâncime 91 km." },
      { time: "13:41", titlu: "Panică în București", desc: "Clădiri evacuate, oameni aleargă în stradă." },
      { time: "14:00", titlu: "Primele evaluări", desc: "Autoritățile confirmă lipsa victimelor." },
      { time: "Seara", titlu: "Bilanț oficial", desc: "Fără victime, pagube materiale minore, câteva clădiri fisurate." },
    ],
    causes: [
      "Activitate seismică naturală în zona de subducție Vrancea",
      "Zona Vrancea — cea mai activă zonă seismică din Europa de Sud-Est",
      "Ciclicitate seismică — acumulare de energie tectonică",
    ],
    impact:
      "Fără victime și fără pagube majore. Cutremurul a reamintit pericolul seismic din zona Vrancea și a reactivat dezbaterea privind consolidarea clădirilor vulnerabile din București.",
    response:
      "Autoritățile au evaluat rapid situația. Nu a fost necesară mobilizare de urgență. Evenimentul a relansat discuțiile despre programul de consolidare seismică.",
    quotes: [
      { text: "Ne-am speriat toți, dar de data asta am scăpat.", author: "Locuitor din București, 30 mai 1990" },
    ],
    sources: [
      { name: "INFP — catalogul seismic al României", url: "https://www.infp.ro" },
      { name: "Wikipedia — Lista cutremurelor din România", url: "https://ro.wikipedia.org/wiki/Lista_cutremurelor_din_Rom%C3%A2nia" },
    ],
  },

  "mineriada-septembrie-1991": {
    slug: "mineriada-septembrie-1991",
    coords: [44.4268, 26.1025],
    fullDescription:
      "În septembrie 1991, minerii din Valea Jiului au coborât din nou la București, de data aceasta nemulțumiți de condițiile economice și cerând demisia guvernului. Spre deosebire de mineriada din 1990, de această dată minerii s-au îndreptat împotriva puterii, nu în sprijinul ei.\n\nPe 24 septembrie, aproximativ 30.000 de mineri conduși de Miron Cozma au ajuns în Capitală și au devastat instituții publice, inclusiv sediul Guvernului și al Televiziunii. Violențele au durat patru zile și s-au soldat cu 3 morți și sute de răniți.\n\nPremierul Petre Roman a fost forțat să demisioneze pe 26 septembrie, fiind înlocuit cu Theodor Stolojan. A fost singura dată în istoria post-comunistă a României când un premier a fost schimbat prin presiune de stradă violentă.",
    timeline: [
      { time: "24 sept", titlu: "Minerii ajung la București", desc: "~30.000 de mineri conduși de Miron Cozma intră în Capitală." },
      { time: "25 sept", titlu: "Violențe extinse", desc: "Sediul Guvernului și TVR atacate. Lupte de stradă cu poliția." },
      { time: "26 sept", titlu: "Petre Roman demisionează", desc: "Premierul cedează presiunii. Theodor Stolojan numit prim-ministru." },
      { time: "27-28 sept", titlu: "Minerii se retrag", desc: "Negocieri cu noul guvern. Bilanț: 3 morți, sute de răniți." },
    ],
    causes: [
      "Criza economică — inflație galopantă și scăderea nivelului de trai",
      "Nemulțumirea minerilor față de restructurarea industriei miniere",
      "Manipulare politică — rivalitatea Iliescu-Roman",
      "Liderul Miron Cozma a mobilizat minerii pentru mers pe București",
    ],
    impact:
      "3 morți, sute de răniți. Premierul Petre Roman demis. Instabilitate politică majoră. Credibilitatea statului de drept grav afectată. România avertizată de comunitatea internațională.",
    response:
      "Guvernul Roman a demisionat. Theodor Stolojan a format un guvern de tehnocrați. Negocierile cu minerii au inclus promisiuni economice. Miron Cozma a fost ulterior condamnat la închisoare.",
    quotes: [
      { text: "Am venit să luăm ce ni se cuvine.", author: "Miron Cozma, lider al minerilor, septembrie 1991" },
    ],
    sources: [
      { name: "Wikipedia — Mineriada din septembrie 1991", url: "https://ro.wikipedia.org/wiki/Mineriada_din_septembrie_1991" },
      { name: "Arhiva TVR", url: "https://www.tvr.ro" },
    ],
  },

  "mineriada-1999": {
    slug: "mineriada-1999",
    coords: [44.4268, 26.1025],
    fullDescription:
      "În ianuarie 1999, ultima mare mineriadă a avut loc când aproximativ 10.000 de mineri conduși din nou de Miron Cozma au pornit în marș spre București. De data aceasta, guvernul condus de Radu Vasile a decis să nu mai cedeze și a trimis forțele de ordine să blocheze coloana de mineri.\n\nMinerii au fost interceptați la Costești, în județul Argeș, după mai multe zile de marș. Au avut loc confruntări violente între mineri și trupele de jandarmi. Jandarmii au folosit gaze lacrimogene și tunuri cu apă, iar minerii au răspuns cu pietre și bâte.\n\nMiron Cozma a fost arestat pe 15 februarie 1999 și condamnat la 18 ani de închisoare pentru subminarea puterii de stat. Mineriada din 1999 a marcat sfârșitul erei mineriadelor în România.",
    timeline: [
      { time: "4 ian", titlu: "Minerii pornesc din Valea Jiului", desc: "~10.000 mineri conduși de Cozma pornesc spre București." },
      { time: "5-14 ian", titlu: "Marșul spre Capitală", desc: "Coloana avansează lent, negocieri eșuate." },
      { time: "15 ian", titlu: "Confruntare la Costești", desc: "Jandarmii blochează drumul. Confruntări violente." },
      { time: "16-17 ian", titlu: "Negocieri și retragere", desc: "Minerii acceptă să se întoarcă. Cozma negociază." },
      { time: "15 feb", titlu: "Cozma arestat", desc: "Condamnat la 18 ani de închisoare." },
    ],
    causes: [
      "Închiderea minelor neprofitabile din Valea Jiului",
      "Criza economică severă — mineritul devenise nerentabil",
      "Miron Cozma — lider cu influență enormă asupra minerilor",
      "Promisiuni guvernamentale nerespectate",
    ],
    impact:
      "Ultima mineriadă din istoria României. Miron Cozma condamnat la închisoare. Procesul de restructurare a mineritului a continuat. Imaginea internațională a României afectată din nou, dar decizia guvernului de a nu ceda a fost apreciată.",
    response:
      "Guvernul Radu Vasile a refuzat să cedeze. Forțele de ordine au blocat minerii la Costești. Negocierile au dus la retragerea pașnică. Cozma arestat și judecat. Restructurarea mineritului a continuat.",
    quotes: [
      { text: "De data aceasta, statul de drept nu va ceda.", author: "Radu Vasile, prim-ministru, ianuarie 1999" },
    ],
    sources: [
      { name: "Wikipedia — Mineriada din ianuarie 1999", url: "https://ro.wikipedia.org/wiki/Mineriada_din_ianuarie_1999" },
      { name: "BBC News — Romania miners", url: "https://news.bbc.co.uk" },
    ],
  },

  "cutremur-vrancea-2004": {
    slug: "cutremur-vrancea-2004",
    coords: [45.70, 26.62],
    fullDescription:
      "Pe 27 octombrie 2004, la ora 23:34, un cutremur cu magnitudinea de 5.8 grade Richter s-a produs în zona seismică Vrancea, la o adâncime de aproximativ 105 km. Seismul a fost resimțit puternic în întreaga Moldovă, Muntenia și Transilvania.\n\nDeși nu au existat victime sau pagube structurale majore, cutremurul a provocat panică în rândul populației, mai ales în București, unde amintirea seismului din 1977 este încă vie. Mai multe clădiri cu bulină roșie au fost evacuate preventiv.\n\nEvenimentul a readus în atenția publică problema consolidării seismice a clădirilor vulnerabile din București și din alte orașe din zona de risc.",
    timeline: [
      { time: "23:34", titlu: "Cutremur de 5.8 Richter", desc: "Epicentru zona Vrancea, adâncime 105 km." },
      { time: "23:35", titlu: "Resimțit puternic în București", desc: "Panică în blocuri, oameni ies în stradă." },
      { time: "23:45", titlu: "ISU evaluează situația", desc: "Nu se raportează victime sau pagube majore." },
      { time: "Ziua următoare", titlu: "Verificări clădiri", desc: "Clădiri cu bulină roșie inspectate. Fără probleme structurale noi." },
    ],
    causes: [
      "Activitate seismică naturală în zona de subducție Vrancea",
      "Acumulare de energie tectonică în placa litosferică",
      "Ciclicitate seismică specifică zonei Vrancea",
    ],
    impact:
      "Fără victime sau pagube structurale semnificative. Panică în rândul populației. Dezbatere reactivată privind clădirile cu bulină roșie din București. Reamintirea necesității programului de consolidare seismică.",
    response:
      "ISU a evaluat rapid situația. Primăria București a anunțat accelerarea programului de consolidare. Nu au fost necesare măsuri de urgență.",
    quotes: [
      { text: "Ne reamintim de fiecare dată că trăim pe o zonă seismică majoră.", author: "Director INFP, 2004" },
    ],
    sources: [
      { name: "INFP — catalogul seismic al României", url: "https://www.infp.ro" },
      { name: "Wikipedia — Lista cutremurelor din România", url: "https://ro.wikipedia.org/wiki/Lista_cutremurelor_din_Rom%C3%A2nia" },
    ],
  },

  "inundatii-2005-moldova": {
    slug: "inundatii-2005-moldova",
    coords: [45.44, 28.05],
    fullDescription:
      "În vara anului 2005, România a fost lovită de inundații catastrofale, cele mai grave din ultimele decenii. Râurile Siret, Prut și afluentele lor au ieșit din matcă din cauza ploilor torențiale prelungite, afectând în special județele din Moldova: Galați, Bacău, Neamț, Suceava și Vrancea.\n\nJudețul Galați a fost cel mai grav afectat — sate întregi au fost acoperite de apă, mii de case distruse, iar 21 de persoane și-au pierdut viața. Zeci de mii de oameni au fost evacuați din calea apelor.\n\nInundațiile din 2005 au evidențiat vulnerabilitatea infrastructurii hidrotehnice a României și au declanșat un program masiv de investiții în diguri, baraje și sisteme de avertizare.",
    timeline: [
      { time: "Începutul lui iulie", titlu: "Ploi torențiale prelungite", desc: "Cantități record de precipitații în toată Moldova." },
      { time: "10-12 iul", titlu: "Râurile ies din matcă", desc: "Siretul și Prutul depășesc cotele de pericol." },
      { time: "13 iul", titlu: "Inundații catastrofale în Galați", desc: "Sate acoperite de apă, evacuări masive." },
      { time: "14-20 iul", titlu: "Extinderea dezastrului", desc: "Bacău, Neamț, Suceava — mii de case afectate." },
      { time: "21 iul", titlu: "Apele încep să scadă", desc: "Bilanț: 21 morți, zeci de mii de evacuați." },
      { time: "August", titlu: "Evaluare pagube", desc: "Peste 10.000 case avariate, pagube de sute de milioane de euro." },
    ],
    causes: [
      "Ploi torențiale excepționale timp de mai multe săptămâni",
      "Infrastructură hidrotehnică subdimensionată și prost întreținută",
      "Defrișări masive în zona montană — capacitate redusă de retenție",
      "Construcții ilegale în zone inundabile",
      "Schimbări climatice — frecvență crescută a evenimentelor meteo extreme",
    ],
    impact:
      "21 de persoane decedate, peste 10.000 de case avariate sau distruse, zeci de mii de hectare agricole compromise. Pagube estimate la sute de milioane de euro. Cel mai mare dezastru natural din România din ultimele decenii la acea dată.",
    response:
      "Guvernul a declarat stare de urgență în județele afectate. Armata și ISU au mobilizat mii de militari și voluntari. UE a acordat fonduri de urgență. A urmat un program de reconstrucție și modernizare a digurilor, finanțat inclusiv din fonduri europene.",
    quotes: [
      { text: "Am pierdut totul într-o noapte. Casa, animalele, tot ce aveam.", author: "Locuitor din comuna Cudalbi, jud. Galați" },
      { text: "Este cel mai grav dezastru natural din ultimii 30 de ani.", author: "Comitetul Național pentru Situații de Urgență, iulie 2005" },
    ],
    sources: [
      { name: "Wikipedia — Inundațiile din România (2005)", url: "https://ro.wikipedia.org/wiki/Inunda%C8%9Biile_din_Rom%C3%A2nia_(2005)" },
      { name: "IGSU — raport inundații 2005", url: "https://www.igsu.ro" },
      { name: "Comisia Europeană — fonduri de solidaritate", url: "https://ec.europa.eu" },
    ],
    ongoingStatus: "Programul de modernizare a digurilor și infrastructurii hidrotehnice continuă cu finanțare europeană. Multe sate afectate au fost reconstruite, dar riscul de inundații rămâne ridicat.",
  },

  "incendiu-spital-constanta-2021": {
    slug: "incendiu-spital-constanta-2021",
    coords: [44.1733, 28.6383],
    fullDescription:
      "Pe 1 octombrie 2021, un incendiu devastator a izbucnit în secția de Terapie Intensivă a Spitalului de Boli Infecțioase din Constanța, unde erau internați pacienți COVID-19 conectați la ventilatoare. 9 pacienți au murit carbonizați. Tragedia a fost al patrulea incendiu mortal într-un spital românesc în mai puțin de un an, după Piatra Neamț, Matei Balș și alte incidente, și a readus în discuție starea dezastruoasă a infrastructurii spitalicești din România.",
    timeline: [
      { time: "07:00", titlu: "Incendiu izbucnește la ATI", desc: "Focul pornește în salonul cu 10 paturi ATI COVID." },
      { time: "07:05", titlu: "Alertă 112", desc: "Personalul medical semnalează incendiul." },
      { time: "07:12", titlu: "Echipaje ISU sosesc", desc: "3 autospeciale de la ISU Dobrogea." },
      { time: "07:45", titlu: "Incendiu stins", desc: "9 pacienți declarați decedați." },
      { time: "10:00", titlu: "Declarații oficiale", desc: "Ministrul Sănătății anunță anchetă." },
      { time: "2 oct", titlu: "Doliu național", desc: "Guvernul declară zi de doliu." },
    ],
    causes: [
      "Instalație electrică veche, neconformă în secția ATI",
      "Concentrație mare de oxigen în salon — risc de incendiu extrem",
      "Lipsa sistemului automat de detecție și stingere incendii",
      "Spital construit în anii '70, fără modernizare recentă",
      "Suprasolicitarea secțiilor ATI în valul 4 COVID-19",
    ],
    impact:
      "9 pacienți decedați. Al patrulea incendiu mortal într-un spital românesc în pandemie. Încrederea publicului în sistemul sanitar a atins un minim istoric.",
    response:
      "Ministerul Sănătății a demarat inspecții la toate secțiile ATI din țară. Guvernul a alocat fonduri de urgență pentru sisteme anti-incendiu în spitale. Managerul spitalului a fost demis.",
    quotes: [
      { text: "Este inadmisibil ca pacienții să moară în spitale din cauza incendiilor. Sistemul a eșuat.", author: "Ministrul Sănătății, octombrie 2021" },
      { text: "Am cerut verificarea tuturor secțiilor ATI din România în 72 de ore.", author: "Secretar de stat MS" },
    ],
    sources: [
      { name: "Ministerul Sănătății — comunicat oficial", url: "https://www.ms.ro" },
      { name: "Digi24 — Incendiu Constanța ATI", url: "https://www.digi24.ro" },
      { name: "HotNews — anchetă", url: "https://www.hotnews.ro" },
    ],
  },

  "inundatii-banat-2023": {
    slug: "inundatii-banat-2023",
    coords: [45.7489, 21.2087],
    fullDescription:
      "În luna iunie 2023, județele Timiș și Caraș-Severin au fost lovite de inundații severe cauzate de ploi torențiale neîntrerupte timp de 3 zile. Râurile Timiș și Bârzava au depășit cotele de pericol. Peste 350 de persoane au fost evacuate din localitățile afectate, zeci de case au fost inundate, iar drumuri județene au fost distruse.",
    timeline: [
      { time: "12 iun", titlu: "Cod roșu de inundații", desc: "ANM emite alertă pentru vestul țării." },
      { time: "13 iun", titlu: "Râul Timiș depășește cota de pericol", desc: "Evacuări în comuna Sacu și Lugoj." },
      { time: "14 iun", titlu: "Vârf inundații", desc: "350+ persoane evacuate, 120 case inundate." },
      { time: "15 iun", titlu: "Apele încep să scadă", desc: "ISU și voluntari continuă intervențiile." },
      { time: "17 iun", titlu: "Evaluare pagube", desc: "Drumuri distruse, infrastructură agricolă afectată." },
    ],
    causes: [
      "Ploi torențiale excepționale — 120 mm în 72 de ore",
      "Diguri de protecție subdimensionate și neîntreținute",
      "Defrișări masive în zona montană — scurgere rapidă a apei",
      "Lipsa bazinelor de retenție pe cursurile de apă",
    ],
    impact:
      "350+ persoane evacuate, 120 case inundate, 45 km de drumuri județene avariate, terenuri agricole distruse pe 2.000 hectare. Pagube estimate la 50 milioane lei.",
    response:
      "IGSU a mobilizat echipaje din 5 județe vecine. Guvernul a alocat 30 milioane lei din fondul de rezervă. Comitetul pentru Situații de Urgență a coordonat evacuările.",
    quotes: [
      { text: "Apa a venit într-o oră și a luat tot. Nu am mai trăit așa ceva în 40 de ani.", author: "Locuitor din Sacu, Timiș" },
      { text: "Intervenim cu toate resursele disponibile.", author: "Prefectul județului Timiș" },
    ],
    sources: [
      { name: "ISU Banat — raport intervenții", url: "https://www.isuj-timis.ro" },
      { name: "Administrația Bazinală de Apă Banat", url: "https://www.rowater.ro" },
    ],
  },

  "explozia-crevedia-2023": {
    slug: "explozia-crevedia-2023",
    coords: [44.6597, 25.9339],
    fullDescription:
      "Pe 26 august 2023, o explozie catastrofală a avut loc la o stație de alimentare GPL din Crevedia, județul Dâmbovița. Deflagrația a fost urmată de un incendiu masiv care a distrus complet stația și clădirile din jur. 6 persoane au murit, iar peste 500 de locuitori din zonă au fost evacuați. Coloana de fum a fost vizibilă de la zeci de kilometri distanță.",
    timeline: [
      { time: "19:45", titlu: "Prima explozie la stația GPL", desc: "Deflagrație puternică resimțită la kilometri distanță." },
      { time: "19:50", titlu: "A doua explozie", desc: "Rezervoare GPL explodează în lanț." },
      { time: "19:55", titlu: "Alertă ISU Dâmbovița", desc: "Toate echipajele mobilizate." },
      { time: "20:30", titlu: "Evacuare 500+ persoane", desc: "Rază de 1 km evacuată complet." },
      { time: "21:00", titlu: "Echipaje IGSU din București", desc: "Intervenție cu sprijin din Capitală." },
      { time: "27 aug, 04:00", titlu: "Incendiu sub control", desc: "6 morți confirmați." },
      { time: "28 aug", titlu: "Anchetă demarată", desc: "Parchetul și ISCIR încep investigațiile." },
    ],
    causes: [
      "Defecțiune la instalația de transfer GPL",
      "Stație funcționând fără toate autorizațiile în vigoare",
      "Verificări ISCIR insuficiente sau formale",
      "Lipsa sistemelor automate de oprire în caz de scurgere",
      "Amplasare în zonă rezidențială fără distanță de siguranță corespunzătoare",
    ],
    impact:
      "6 persoane decedate, 2 grav rănite, 500+ evacuați. Stația și 3 clădiri din jur complet distruse. Pagube estimate la 15 milioane lei. Anchetă penală pentru ucidere din culpă.",
    response:
      "IGSU a trimis 20+ autospeciale. Guvernul a ordonat verificarea tuturor stațiilor GPL din România. ISCIR a suspendat autorizațiile a 40+ stații. Dosarul penal instrumentat de Parchetul de pe lângă Tribunalul Dâmbovița.",
    quotes: [
      { text: "A fost ca un bombardament. Geamurile au explodat la 500 de metri distanță.", author: "Locuitor din Crevedia" },
      { text: "Toate stațiile GPL vor fi reverificate în 30 de zile.", author: "Ministrul de Interne, 27 august 2023" },
    ],
    sources: [
      { name: "IGSU — comunicat explozie Crevedia", url: "https://www.igsu.ro" },
      { name: "Parchetul de pe lângă Tribunalul Dâmbovița", url: "https://www.mpublic.ro" },
      { name: "Digi24 — relatare live", url: "https://www.digi24.ro" },
    ],
  },

  "accident-tren-fetesti-2024": {
    slug: "accident-tren-fetesti-2024",
    coords: [44.3667, 27.2500],
    fullDescription:
      "Pe 28 martie 2024, un tren de călători CFR a deraiat în apropierea localității Fetești, județul Ialomița. Două vagoane s-au răsturnat parțial. Mai mulți pasageri au fost răniți, unii necesitând transport la spital. Incidentul a readus în atenție starea critică a infrastructurii feroviare românești.",
    timeline: [
      { time: "14:20", titlu: "Deraiere tren de călători", desc: "Trenul IR circula pe ruta București-Constanța." },
      { time: "14:22", titlu: "Alertă mecanicul de locomotivă", desc: "Sesizare la dispeceratul CFR." },
      { time: "14:35", titlu: "Echipaje ISU la fața locului", desc: "Ambulanțe și descarcerare." },
      { time: "15:00", titlu: "Evacuare pasageri", desc: "Toți pasagerii scoși din vagoane." },
      { time: "16:30", titlu: "Bilanț preliminar", desc: "15 răniți, niciun deces." },
      { time: "29 mar", titlu: "AGIFER demarează ancheta", desc: "Investigație tehnică pe linie." },
    ],
    causes: [
      "Linie de cale ferată degradată — traverse putrede",
      "Viteză de circulație neadaptată stării liniei",
      "Subfinanțare cronică a CFR Infrastructură",
      "Lipsa modernizării pe tronsonul București-Constanța",
    ],
    impact:
      "15 pasageri răniți (3 grav), trafic feroviar întrerupt 18 ore pe magistrala București-Constanța. Trenuri redirecționate, întârzieri masive.",
    response:
      "AGIFER a deschis investigație. CFR SA a impus restricții de viteză pe tronsonul afectat. Ministrul Transporturilor a solicitat raport urgent privind starea infrastructurii.",
    quotes: [
      { text: "Am simțit o frânare bruscă și vagonul s-a înclinat. A fost panică.", author: "Pasager din trenul deraiat" },
      { text: "Starea liniilor este cunoscută de ani de zile, dar investițiile întârzie.", author: "Sindicatul Feroviar" },
    ],
    sources: [
      { name: "AGIFER — raport preliminar", url: "https://www.agifer.ro" },
      { name: "CFR Călători — comunicat", url: "https://www.cfrcalatori.ro" },
    ],
  },

  "alunecari-teren-gorj-2024": {
    slug: "alunecari-teren-gorj-2024",
    coords: [45.05, 23.27],
    fullDescription:
      "În luna aprilie 2024, în urma precipitațiilor abundente din primăvară, mai multe sate din județul Gorj au fost afectate de alunecări de teren severe. Drumuri județene au fost blocate, case au fost avariate sau distruse, iar familii au fost evacuate. Fenomenul a afectat în special comunele Albeni, Berlești și Bălești.",
    timeline: [
      { time: "1-5 apr", titlu: "Ploi abundente", desc: "Precipitații de 80+ mm au saturat solul argilos." },
      { time: "6 apr", titlu: "Primele alunecări", desc: "Drumul județean DJ 665 blocat la Albeni." },
      { time: "7 apr", titlu: "Case avariate", desc: "5 case cu crăpături majore, 3 familii evacuate." },
      { time: "8-10 apr", titlu: "Alunecări extinse", desc: "Fenomenul se extinde la Berlești și Bălești." },
      { time: "12 apr", titlu: "Intervenție IGSU", desc: "Geniști și echipamente grele aduse din Craiova." },
      { time: "15 apr", titlu: "Situație stabilizată", desc: "Monitorizare continuă a terenului." },
    ],
    causes: [
      "Sol argilos instabil, specific zonei subcarpatice",
      "Ploi excesive care au saturat stratul de sol",
      "Defrișări pe versanți — eliminarea vegetației stabilizatoare",
      "Construcții fără studii geotehnice pe terenuri instabile",
      "Lipsa lucrărilor de consolidare a versanților",
    ],
    impact:
      "12 case avariate, 8 familii evacuate, 3 drumuri județene blocate temporar. Terenuri agricole afectate pe 200+ hectare. Pagube estimate la 8 milioane lei.",
    response:
      "ISU Gorj a coordonat evacuările. Consiliul Județean a solicitat fonduri de la Guvern pentru consolidare. Comisia de cadastru a reevaluat zonele de risc.",
    quotes: [
      { text: "Pământul s-a crăpat sub casă. Am plecat în miez de noapte cu copiii.", author: "Locuitor din Albeni" },
      { text: "Zona subcarpatică a Gorjului este extrem de vulnerabilă la alunecări.", author: "Geolog, Universitatea din Craiova" },
    ],
    sources: [
      { name: "ISU Gorj — raport situații de urgență", url: "https://www.isuj-gorj.ro" },
      { name: "Consiliul Județean Gorj", url: "https://www.cjgorj.ro" },
    ],
  },

  "tornado-calarasi-2024": {
    slug: "tornado-calarasi-2024",
    coords: [44.20, 26.99],
    fullDescription:
      "Pe 30 aprilie 2024, o tornadă rară a lovit sudul județului Călărași, provocând distrugeri semnificative în mai multe sate. Fenomenul meteorologic extrem, neobișnuit pentru România, a smuls acoperișuri, răsturnat vehicule și doborât stâlpi de electricitate. A fost una dintre cele mai puternice tornade documentate în câmpia Dunării.",
    timeline: [
      { time: "16:00", titlu: "ANM emite cod portocaliu", desc: "Avertizare fenomene severe pentru sudul țării." },
      { time: "17:15", titlu: "Tornadă atinge solul", desc: "Pâlnie vizibilă în zona comunei Dragoș Vodă." },
      { time: "17:20", titlu: "Distrugeri în lanț", desc: "Acoperișuri smulse, copaci doborâți pe 5 km." },
      { time: "17:30", titlu: "Tornadă se disipează", desc: "Durată totală aproximativ 15 minute." },
      { time: "18:00", titlu: "ISU Călărași mobilizat", desc: "Echipaje de intervenție în toate localitățile afectate." },
      { time: "19:30", titlu: "Bilanț preliminar", desc: "30+ case avariate, fără victime." },
    ],
    causes: [
      "Instabilitate atmosferică extremă — aer cald saharian + front rece",
      "Schimbări climatice — fenomene extreme tot mai frecvente în România",
      "Câmpia Dunării — teren plat, favorizează formarea tornadelor",
    ],
    impact:
      "30+ case cu acoperișuri smulse, 50+ hectare culturi agricole distruse, 15 stâlpi electricitate doborâți. Fără victime, dar pagube materiale de 5 milioane lei.",
    response:
      "ISU Călărași a intervenit cu 10 echipaje. Enel a restabilit curentul în 24 de ore. Guvernul a declarat zonă calamitată și a alocat fonduri pentru reparații.",
    quotes: [
      { text: "Am văzut pâlnia venind spre sat. Nu credeam că e posibil în România.", author: "Locuitor din Dragoș Vodă" },
      { text: "Tornadele vor deveni mai frecvente în sud-estul Europei.", author: "ANM — climatolog" },
    ],
    sources: [
      { name: "ANM — raport fenomene severe", url: "https://www.meteoromania.ro" },
      { name: "ISU Călărași — comunicat", url: "https://www.isuj-calarasi.ro" },
    ],
  },

  "inundatii-hunedoara-2024": {
    slug: "inundatii-hunedoara-2024",
    coords: [45.75, 22.90],
    fullDescription:
      "În luna iunie 2024, județul Hunedoara a fost grav afectat de inundații provocate de ploi torențiale prelungite. Râurile Mureș și Strei au depășit cotele de pericol, inundând localități din Valea Jiului și zona Deva-Hunedoara. Zeci de gospodării au fost inundate, drumuri naționale blocate și infrastructură distrusă.",
    timeline: [
      { time: "5 iun", titlu: "Cod roșu hidrologic", desc: "INHGA avertizează pentru bazinul Mureș." },
      { time: "6 iun", titlu: "Râul Strei iese din matcă", desc: "Inundații în Călan și Hunedoara." },
      { time: "7 iun", titlu: "Vârf inundații", desc: "80+ case inundate, evacuări în desfășurare." },
      { time: "8 iun", titlu: "DN 66 blocat", desc: "Drumul național spre Petroșani impracticabil." },
      { time: "10 iun", titlu: "Apele se retrag", desc: "Evaluare pagube, noroi gros în case." },
      { time: "12 iun", titlu: "Intervenție continuă", desc: "Pompe de evacuare, dezinfecție." },
    ],
    causes: [
      "Ploi torențiale excepționale în zona montană",
      "Defrișări pe versanții din bazinul Strei",
      "Infrastructură de apărare împotriva inundațiilor subdimensionată",
      "Construcții în zone inundabile fără autorizație",
    ],
    impact:
      "80+ case inundate, 25 familii evacuate, DN 66 blocat 3 zile, terenuri agricole afectate pe 500 hectare. Pagube estimate la 25 milioane lei.",
    response:
      "ISU Hunedoara și forțe din județele vecine au intervenit cu 15 echipaje. CNAIR a mobilizat utilaje pentru degajarea drumurilor. Guvernul a alocat 15 milioane lei din fondul de rezervă.",
    quotes: [
      { text: "Apa a intrat în casă până la un metru. Am pierdut tot ce aveam la parter.", author: "Locuitor din Călan" },
      { text: "Investițiile în diguri și regularizări sunt vitale.", author: "Prefectul județului Hunedoara" },
    ],
    sources: [
      { name: "INHGA — buletin hidrologic", url: "https://www.inhga.ro" },
      { name: "ISU Hunedoara — raport", url: "https://www.isuj-hunedoara.ro" },
    ],
  },

  "inundatii-moldova-2024": {
    slug: "inundatii-moldova-2024",
    coords: [46.57, 26.91],
    fullDescription:
      "În luna iunie 2024, râul Bistrița a provocat inundații majore în județul Bacău, afectând grav mai multe localități de pe Valea Bistriței. Debitul râului a atins valori record, iar apele au acoperit sute de hectare de terenuri agricole și zeci de gospodării. Comunele Hemeiuș, Gârleni și Blăgești au fost cele mai afectate.",
    timeline: [
      { time: "18 iun", titlu: "Cod portocaliu hidrologic", desc: "INHGA avertizează pentru bazinul Bistrița." },
      { time: "19 iun", titlu: "Bistrița depășește cota de pericol", desc: "Debit record la stația Bacău." },
      { time: "20 iun", titlu: "Inundații extinse", desc: "60+ gospodării inundate în Hemeiuș." },
      { time: "21 iun", titlu: "Evacuări forțate", desc: "40 familii evacuate cu bărci pneumatice." },
      { time: "22 iun", titlu: "Debitul scade gradual", desc: "ISU continuă pomparea apei." },
      { time: "25 iun", titlu: "Evaluare pagube", desc: "Comisii mixte în teren." },
    ],
    causes: [
      "Ploi abundente în zona montană a Carpaților Orientali",
      "Capacitate insuficientă a acumulărilor de pe Bistrița",
      "Construcții în albia majoră a râului",
      "Colmatare a albiei — defrișări în amonte",
    ],
    impact:
      "60+ gospodării inundate, 40 familii evacuate, 300 hectare terenuri agricole sub apă. Infrastructură rutieră afectată. Pagube estimate la 20 milioane lei.",
    response:
      "ISU Bacău a mobilizat toate echipajele disponibile. Apele Române a gestionat evacuările din lacuri de acumulare. Voluntari din Bacău au ajutat la evacuare și curățenie.",
    quotes: [
      { text: "Bistrița n-a mai fost așa de mare din 2005. Am crezut că nu ne mai oprim din fugit.", author: "Locuitor din Hemeiuș" },
      { text: "Trebuie regândit complet sistemul de apărare pe Valea Bistriței.", author: "Director Apele Române, filiala Bacău" },
    ],
    sources: [
      { name: "INHGA — raport hidrologic", url: "https://www.inhga.ro" },
      { name: "ISU Bacău — comunicat", url: "https://www.isuj-bacau.ro" },
    ],
  },

  "ursi-brasov-2024": {
    slug: "ursi-brasov-2024",
    coords: [45.6427, 25.5887],
    fullDescription:
      "Anul 2024 a marcat apogeul crizei urșilor în zona Brașov. Incursiunile urșilor în oraș au devenit zilnice, iar pe 10 iulie 2024, o turistă de 19 ani a fost ucisă de un urs pe traseul Jepii Mici din Munții Bucegi. Incidentul a declanșat o dezbatere națională despre gestionarea populației de urși și securitatea traseelor montane.",
    timeline: [
      { time: "Ian-Iun 2024", titlu: "Urși zilnic în Brașov", desc: "Sute de incidente — tomberoane răsturnate, mașini avariate." },
      { time: "10 iul", titlu: "Atac fatal pe Jepii Mici", desc: "Turistă de 19 ani ucisă de urs pe traseu montan." },
      { time: "11 iul", titlu: "Ursul identificat și eutanasiat", desc: "Jandarmeria Montană intervine." },
      { time: "12 iul", titlu: "Reacție publică masivă", desc: "Cereri pentru măsuri urgente." },
      { time: "Aug 2024", titlu: "Ordonanță de urgență", desc: "Guvernul simplifică procedura de împușcare a urșilor agresivi." },
      { time: "Toamnă 2024", titlu: "Dezbatere continuă", desc: "ONG-uri de mediu vs. autorități locale." },
    ],
    causes: [
      "Populația de urși bruni a crescut la 8.000+ exemplare — cea mai mare din Europa",
      "Hrănirea (ilegală) a urșilor de către turiști timp de decenii",
      "Extinderea urbană în habitat natural al urșilor",
      "Legislație restrictivă — interdicție de vânătoare din 2016",
      "Managementul deficitar al deșeurilor — tomberoane nesecurizate",
    ],
    impact:
      "1 persoană decedată, zeci de atacuri non-fatale în 2024. Industria turismului din Brașov afectată. Modificare legislativă majoră. Polarizare socială între ecologiști și autorități.",
    response:
      "Guvernul a adoptat OUG pentru gestionarea urșilor periculoși. Primăria Brașov a instalat tomberoane anti-urs. Jandarmeria Montană a suplimentat patrulele pe trasee. Dezbateri la nivel UE privind statutul de protecție al urșilor.",
    quotes: [
      { text: "Fata noastră a murit pe un traseu turistic marcat. Cine răspunde?", author: "Familia victimei de pe Jepii Mici" },
      { text: "Nu putem transforma Brașovul într-un oraș asediat de urși.", author: "Primarul Brașov" },
    ],
    sources: [
      { name: "Jandarmeria Montană — raport 2024", url: "https://www.jandarmeriaromana.ro" },
      { name: "Ministerul Mediului — OUG urși", url: "https://www.mmediu.ro" },
      { name: "G4Media — anchetă urși Brașov", url: "https://www.g4media.ro" },
    ],
  },

  "inundatii-galati-2024": {
    slug: "inundatii-galati-2024",
    coords: [45.44, 28.05],
    fullDescription:
      "Între 14 și 17 septembrie 2024, ciclonul Boris a adus precipitații record în sud-estul României, provocând inundații catastrofale în județul Galați. 7 persoane au murit, peste 6.000 au fost evacuate, iar localități întregi au fost submerse. A fost cea mai gravă catastrofă naturală din România din ultimii 10 ani. Localitățile Pechea, Slobozia Conachi și Costache Negri au fost cele mai afectate.",
    timeline: [
      { time: "14 sept", titlu: "Ciclonul Boris ajunge în România", desc: "Ploi torențiale în sud-est, 150 mm în 24h." },
      { time: "14 sept, seara", titlu: "Primele viituri", desc: "Pâraie umflate în zona Galați." },
      { time: "15 sept", titlu: "Dezastru la Pechea", desc: "Localitatea complet inundată, 4 morți." },
      { time: "15 sept", titlu: "Evacuări masive", desc: "2.000+ persoane evacuate cu bărci." },
      { time: "16 sept", titlu: "Armata intervine", desc: "Elicoptere și vehicule amfibii mobilizate." },
      { time: "17 sept", titlu: "Apele încep să scadă", desc: "Bilanț: 7 morți, 6.000+ evacuați." },
      { time: "18-25 sept", titlu: "Operațiuni post-dezastru", desc: "Dezinfecție, distribuire ajutoare, evaluare." },
    ],
    causes: [
      "Ciclonul Boris — fenomen meteorologic extrem asociat schimbărilor climatice",
      "Precipitații record: 150+ mm în 24 de ore",
      "Infrastructura de drenaj și diguri complet depășită",
      "Construcții în zone inundabile fără respectarea planurilor de risc",
      "Sistem de avertizare lent — locuitorii au fost surprinși",
    ],
    impact:
      "7 persoane decedate, 6.000+ evacuate, 5.000+ case inundate, infrastructură rutieră distrusă pe zeci de km. Pagube estimate la 500+ milioane lei. Stare de urgență declarată.",
    response:
      "IGSU a coordonat cea mai amplă operațiune de salvare din ultimul deceniu. Armata a desfășurat 500+ militari. UE a activat mecanismul de protecție civilă. Guvernul a alocat 1 miliard lei pentru reconstrucție. Crucea Roșie și ONG-uri au oferit asistență umanitară.",
    quotes: [
      { text: "Am pierdut tot în câteva ore. Casa, animalele, tot. N-am mai rămas cu nimic.", author: "Locuitor din Pechea, Galați" },
      { text: "Este cea mai gravă inundație din istoria recentă a județului.", author: "Prefectul județului Galați" },
      { text: "Schimbările climatice fac aceste evenimente mai frecvente și mai intense.", author: "ANM — director adjunct" },
    ],
    sources: [
      { name: "IGSU — raport operațional ciclonul Boris", url: "https://www.igsu.ro" },
      { name: "Guvernul României — hotărâre stare de urgență", url: "https://www.gov.ro" },
      { name: "Reuters — Romania floods", url: "https://www.reuters.com" },
    ],
  },

  "alegeri-anulate-2024": {
    slug: "alegeri-anulate-2024",
    coords: [44.4268, 26.1025],
    fullDescription:
      "Pe 6 decembrie 2024, Curtea Constituțională a României (CCR) a anulat complet primul tur al alegerilor prezidențiale din 24 noiembrie 2024, o premieră absolută în istoria țării. Decizia a fost luată pe baza unor documente desecretizate de CSAT care indicau o campanie masivă de manipulare pe TikTok, posibil susținută de actori statali externi, în favoarea candidatului independent Călin Georgescu, care câștigase surprinzător primul tur.",
    timeline: [
      { time: "24 nov", titlu: "Primul tur alegeri prezidențiale", desc: "Călin Georgescu câștigă surprinzător cu 22.94%." },
      { time: "28 nov", titlu: "CSAT desecretizează rapoarte SRI/SIE", desc: "Documente indică campanie masivă de manipulare pe TikTok." },
      { time: "2 dec", titlu: "CCR analizează contestații", desc: "Multiple contestații depuse de partide și candidați." },
      { time: "6 dec", titlu: "CCR anulează alegerile", desc: "Decizie fără precedent: se reiau alegerile de la zero." },
      { time: "7 dec", titlu: "Reacții internaționale", desc: "UE și NATO urmăresc situația cu atenție." },
      { time: "Dec 2024 - 2025", titlu: "Criză politică prelungită", desc: "Societatea polarizată, noi alegeri amânate." },
    ],
    causes: [
      "Campanie de manipulare pe TikTok cu 25.000+ conturi coordonate",
      "Finanțare netransparentă a campaniei candidatului Georgescu",
      "Posibilă implicare a actorilor statali externi (Rusia, conform rapoartelor SRI)",
      "Vulnerabilitatea spațiului informațional românesc",
      "Legislație electorală nepregătită pentru era social media",
    ],
    impact:
      "Premieră constituțională absolută — prima anulare de alegeri prezidențiale din istoria României. Criză politică profundă. Societate polarizată între susținătorii anulării și cei care o consideră anti-democratică. Imaginea externă a României afectată.",
    response:
      "CCR a dispus reluarea procesului electoral de la zero. Parlamentul a inițiat modificări ale legislației electorale. AEP a demarat verificări privind finanțarea campaniilor online. Comisia Europeană a solicitat explicații TikTok.",
    quotes: [
      { text: "Procesul electoral a fost viciat în integralitatea sa prin acțiuni de manipulare.", author: "CCR — motivarea deciziei" },
      { text: "Este un moment fără precedent care ridică întrebări fundamentale despre democrație.", author: "Analist politic" },
    ],
    sources: [
      { name: "CCR — Decizia din 6 decembrie 2024", url: "https://www.ccr.ro" },
      { name: "CSAT — documente desecretizate", url: "https://www.presidency.ro" },
      { name: "G4Media — cronologie alegeri anulate", url: "https://www.g4media.ro" },
    ],
    ongoingStatus: "Alegerile prezidențiale au avut loc pe 7 decembrie 2025. Ciprian Ciucu (PNL) a câștigat.",
  },

  "criza-energetica-2025": {
    slug: "criza-energetica-2025",
    coords: [44.4268, 26.1025],
    fullDescription:
      "Începând cu iarna 2024-2025, România a intrat într-o criză energetică marcată de creșteri semnificative ale prețurilor la energie electrică și gaze naturale. Eliminarea treptată a schemei de plafonare și compensare, combinată cu creșterea prețurilor pe piețele europene și investiții insuficiente în capacități de producție, a dus la facturi duble sau triple pentru gospodării și companii.",
    timeline: [
      { time: "Nov 2024", titlu: "Expirarea plafonării prețurilor", desc: "Schema de compensare redusă semnificativ." },
      { time: "Ian 2025", titlu: "Primele facturi nesustenabile", desc: "Creșteri de 80-150% la energie și gaz." },
      { time: "Feb 2025", titlu: "Proteste spontane", desc: "Români nemulțumiți de facturile uriașe." },
      { time: "Mar 2025", titlu: "Guvernul anunță măsuri parțiale", desc: "Voucher energetic pentru cei vulnerabili." },
      { time: "Apr 2025", titlu: "Dezbatere continuă", desc: "Opoziția cere reintroducerea plafonării." },
    ],
    causes: [
      "Eliminarea schemei de plafonare și compensare a prețurilor",
      "Prețuri ridicate pe piețele europene de energie",
      "Dependența de importul de gaze naturale",
      "Investiții insuficiente în surse regenerabile și capacități noi",
      "Infrastructură energetică învechită, pierderi mari în rețea",
      "Liberalizarea completă a pieței de energie",
    ],
    impact:
      "Facturi duble sau triple pentru milioane de gospodării. Companii mici forțate să închidă sau să reducă activitatea. Sărăcie energetică în creștere — estimat 25% din populație. Inflație crescută prin propagarea costurilor energetice.",
    response:
      "Guvernul a introdus vouchere energetice pentru categorii vulnerabile. ANRE a intensificat controalele la furnizori. Plan național de investiții în energie regenerabilă accelerat. Negocieri la nivel UE pentru mecanisme de stabilizare a prețurilor.",
    quotes: [
      { text: "O factură de 1.500 lei la gaz pentru un apartament de 2 camere este inacceptabilă.", author: "Asociație de consumatori" },
      { text: "Tranziția energetică nu poate fi făcută pe spatele cetățenilor.", author: "Analist energetic" },
    ],
    sources: [
      { name: "ANRE — raport piață energie", url: "https://www.anre.ro" },
      { name: "Eurostat — prețuri energie UE", url: "https://ec.europa.eu/eurostat" },
      { name: "Economica.net — analiză criză energetică", url: "https://www.economica.net" },
    ],
    ongoingStatus: "Criză în desfășurare — măsuri guvernamentale insuficiente",
  },
};
