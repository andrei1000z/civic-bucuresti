"use client";

import { useState, useMemo } from "react";
import { Calculator, Award, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Plan {
  id: string;
  name: string;
  operator: string;
  monthly: (calatoriLucru: number, calatoriWeekend: number, zileLucru: number, zileWeekend: number, elev: boolean) => number;
  description: string;
  link: string;
}

const PLANS: Plan[] = [
  {
    id: "bilete-single",
    name: "Bilete single (3 lei/călătorie)",
    operator: "STB",
    monthly: (cL, cW, zL, zW) => (cL * zL + cW * zW) * 3,
    description: "Plătești pentru fiecare călătorie separat. Fără commitment.",
    link: "https://24pay.ro",
  },
  {
    id: "stb-2-linii",
    name: "Abonament STB 2 linii",
    operator: "STB",
    monthly: () => 60,
    description: "Călătorii nelimitate pe 2 linii alese. Valabil 30 zile.",
    link: "https://stbsa.ro",
  },
  {
    id: "stb-toate",
    name: "Abonament STB toate liniile",
    operator: "STB",
    monthly: () => 100,
    description: "Călătorii nelimitate pe toată rețeaua STB + nocturne.",
    link: "https://stbsa.ro",
  },
  {
    id: "metrorex-lunar",
    name: "Abonament Metrorex lunar",
    operator: "Metrorex",
    monthly: () => 70,
    description: "Nelimitat pe metrou. Fără integrare cu STB.",
    link: "https://www.metrorex.ro",
  },
  {
    id: "metrorex-10",
    name: "Bilet Metrorex 10 călătorii",
    operator: "Metrorex",
    monthly: (cL, cW, zL, zW) => Math.ceil(((cL * zL + cW * zW)) / 10) * 25,
    description: "10 călătorii pe metrou. Valabil 180 zile.",
    link: "https://www.metrorex.ro",
  },
  {
    id: "metropolitan",
    name: "Abonament metropolitan (STB+Metrou)",
    operator: "TPBI",
    monthly: () => 150,
    description: "Integrat STB + Metrorex + Ilfov. Valabil 30 zile.",
    link: "https://tpbi.ro",
  },
  {
    id: "elev-student",
    name: "Abonament elev/student",
    operator: "STB",
    monthly: (_cL, _cW, _zL, _zW, elev) => (elev ? 10 : 100),
    description: "Pentru elevi și studenți cu legitimație. Toată rețeaua STB.",
    link: "https://stbsa.ro",
  },
];

export function TariffCalculator() {
  const [calatoriLucru, setCalatoriLucru] = useState(4); // dus + întors
  const [calatoriWeekend, setCalatoriWeekend] = useState(2);
  const [zileLucru, setZileLucru] = useState(21);
  const [zileWeekend, setZileWeekend] = useState(8);
  const [elev, setElev] = useState(false);

  const results = useMemo(() => {
    return PLANS.filter((p) => !elev || p.id !== "stb-toate").map((p) => ({
      ...p,
      cost: p.monthly(calatoriLucru, calatoriWeekend, zileLucru, zileWeekend, elev),
    }));
  }, [calatoriLucru, calatoriWeekend, zileLucru, zileWeekend, elev]);

  const cheapest = results.reduce<(typeof results)[number] | undefined>(
    (min, p) => (!min || p.cost < min.cost ? p : min),
    undefined,
  );
  const maxCost = Math.max(...results.map((r) => r.cost));
  if (!cheapest) return null;

  const totalCalatorii = calatoriLucru * zileLucru + calatoriWeekend * zileWeekend;

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6 md:p-8">
      <div className="flex items-center gap-3 mb-2">
        <Calculator size={24} className="text-[var(--color-primary)]" />
        <h3 className="font-[family-name:var(--font-sora)] text-2xl font-bold">Calculator tarife</h3>
      </div>
      <p className="text-sm text-[var(--color-text-muted)] mb-6">
        Spune-ne cât de des călătorești și îți recomandăm cel mai ieftin abonament.
      </p>

      {/* Inputs */}
      <div className="grid md:grid-cols-2 gap-5 mb-6">
        <InputSlider
          label="Călătorii pe zi lucrătoare"
          value={calatoriLucru}
          onChange={setCalatoriLucru}
          min={0}
          max={10}
          hint="Dus + întors = 2 călătorii"
        />
        <InputSlider
          label="Zile lucrătoare/lună"
          value={zileLucru}
          onChange={setZileLucru}
          min={0}
          max={25}
          hint="Tipic: 21 zile"
        />
        <InputSlider
          label="Călătorii pe zi de weekend"
          value={calatoriWeekend}
          onChange={setCalatoriWeekend}
          min={0}
          max={10}
        />
        <InputSlider
          label="Zile weekend/lună"
          value={zileWeekend}
          onChange={setZileWeekend}
          min={0}
          max={8}
          hint="Tipic: 8 zile"
        />
      </div>
      <label className="flex items-center gap-2 mb-6 cursor-pointer text-sm">
        <input
          type="checkbox"
          checked={elev}
          onChange={(e) => setElev(e.target.checked)}
          className="w-4 h-4 accent-[var(--color-primary)]"
        />
        <span>Sunt elev/student (reducere)</span>
      </label>

      {/* Summary */}
      <div className="bg-[var(--color-primary-soft)] rounded-[8px] p-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs text-[var(--color-text-muted)]">Total călătorii/lună</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">{totalCalatorii}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[var(--color-text-muted)]">Recomandare</p>
          <p className="text-base font-semibold text-[var(--color-primary)] max-w-[160px]">{cheapest.name}</p>
          <p className="text-lg font-bold">{cheapest.cost} lei/lună</p>
        </div>
      </div>

      {/* Results comparison */}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-semibold mb-2">
          Comparație toate opțiunile
        </p>
        {results
          .sort((a, b) => a.cost - b.cost)
          .map((r) => {
            const isBest = r.id === cheapest.id;
            const percentage = maxCost > 0 ? (r.cost / maxCost) * 100 : 0;
            return (
              <div
                key={r.id}
                className={cn(
                  "p-3 rounded-[8px] border-2 relative overflow-hidden transition-all",
                  isBest
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                    : "border-[var(--color-border)] bg-[var(--color-surface)]"
                )}
              >
                {/* Bar background */}
                <div
                  className="absolute inset-y-0 left-0 bg-[var(--color-surface-2)]/50 transition-all"
                  style={{ width: `${percentage}%` }}
                />
                <div className="relative flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-semibold text-[var(--color-text-muted)]">
                        {r.operator}
                      </span>
                      {isBest && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-semibold">
                          <Award size={10} />
                          Recomandat
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium truncate">{r.name}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)] truncate">{r.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn("text-xl font-bold", isBest ? "text-emerald-600" : "text-[var(--color-text)]")}>
                      {r.cost} lei
                    </p>
                    {isBest && cheapest.cost < maxCost && (
                      <p className="text-[10px] text-emerald-600 flex items-center justify-end gap-0.5">
                        <TrendingDown size={10} />
                        economisești {maxCost - r.cost} lei
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      <a
        href={cheapest.link}
        target="_blank"
        rel="noreferrer"
        className="block mt-6 w-full h-12 rounded-[8px] bg-[var(--color-primary)] text-white font-semibold hover:bg-[var(--color-primary-hover)] transition-colors flex items-center justify-center gap-2"
      >
        Cumpără {cheapest.name} →
      </a>
    </div>
  );
}

function InputSlider({
  label,
  value,
  onChange,
  min,
  max,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  hint?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-medium">{label}</label>
        <span className="text-sm font-bold text-[var(--color-primary)]">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-[var(--color-surface-2)] rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
      />
      {hint && <p className="text-[10px] text-[var(--color-text-muted)] mt-1">{hint}</p>}
    </div>
  );
}
