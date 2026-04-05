export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const QUIZ: QuizQuestion[] = [
  {
    id: "q1",
    question: "Câți consilieri generali are București?",
    options: ["45", "55", "65", "75"],
    correct: 1,
    explanation: "CGMB are 55 de consilieri aleși pe liste de partid + primarul general. Pentru majoritate simplă sunt necesare 28 de voturi.",
  },
  {
    id: "q2",
    question: "În cât timp maxim trebuie PMB să răspundă la o sesizare?",
    options: ["15 zile", "30 zile", "45 zile", "60 zile"],
    correct: 1,
    explanation: "OG 27/2002 stabilește termenul legal de 30 de zile calendaristice de la înregistrare. Excepțional se poate prelungi cu 15 zile.",
  },
  {
    id: "q3",
    question: "Care primar a construit Pasajul Basarab?",
    options: ["Traian Băsescu", "Adriean Videanu", "Sorin Oprescu", "Gabriela Firea"],
    correct: 2,
    explanation: "Sorin Oprescu (2008-2015) a finalizat Pasajul Basarab, cel mai mare pod suspendat din România, în 2011.",
  },
  {
    id: "q4",
    question: "Ce ține de Primăria Sectorului vs PMB?",
    options: [
      "Bulevarde majore — sector",
      "Termoficare — sector",
      "Străzi secundare + salubritate — sector",
      "STB — sector",
    ],
    correct: 2,
    explanation: "Sectoarele gestionează străzi secundare, salubritate, parcuri mici, școli. PMB gestionează bulevarde majore, STB, termoficare, parcuri mari.",
  },
  {
    id: "q5",
    question: "Care este bugetul PMB 2026?",
    options: ["4.2 mld lei", "6.1 mld lei", "8.4 mld lei", "12 mld lei"],
    correct: 2,
    explanation: "Bugetul PMB 2026 a fost aprobat la 8.4 miliarde lei — investiții 2.1 mld, termoficare 1.8 mld, transport 950 mil.",
  },
  {
    id: "q6",
    question: "Ce înseamnă clădire cu bulină roșie?",
    options: [
      "Clădire istorică protejată",
      "Risc seismic clasa I",
      "Monument de arhitectură",
      "Clădire publică",
    ],
    correct: 1,
    explanation: "Bulina roșie (clasa I de risc seismic) indică pericol major de prăbușire la cutremur. București are peste 1.200 astfel de clădiri.",
  },
  {
    id: "q7",
    question: "Câte magistrale are metroul bucureștean?",
    options: ["3", "4", "5", "6"],
    correct: 2,
    explanation: "Metrorex are 5 magistrale: M1, M2, M3, M4, M5. Magistrala M6 (spre Aeroport Otopeni) e în construcție.",
  },
  {
    id: "q8",
    question: "Cine votează bugetul PMB?",
    options: [
      "Primarul general singur",
      "Ministerul Finanțelor",
      "Consiliul General (minim 28 voturi)",
      "Referendum cetățenesc",
    ],
    correct: 2,
    explanation: "Bugetul e propus de primar și aprobat prin hotărâre a CGMB cu minim 28 voturi (majoritate simplă din 55 consilieri).",
  },
  {
    id: "q9",
    question: "Ce lege îți dă acces la informații publice?",
    options: ["Legea 544/2001", "Legea 215/2001", "Legea 101/2007", "OUG 13/2017"],
    correct: 0,
    explanation: "Legea 544/2001 privind accesul la informații de interes public. Autoritățile au 10 zile să răspundă la cereri simple, 30 zile la cele complexe.",
  },
  {
    id: "q10",
    question: "Câte sectoare are București?",
    options: ["4", "5", "6", "8"],
    correct: 2,
    explanation: "București are 6 sectoare administrative. Numerotate S1-S6. Fiecare are propria primărie și primar de sector.",
  },
];
