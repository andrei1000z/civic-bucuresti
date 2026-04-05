"use client";

import { Building2, Users, Bike, Train } from "lucide-react";
import { CountUp } from "./CountUp";
import { LiveAqiWidget } from "@/components/statistici/LiveAqiWidget";

export function BucurestiStats() {
  const stats = [
    { icon: Users, label: "Populație", value: 1.72, decimals: 2, suffix: "M", color: "#2563EB", description: "recensământ 2021 (INS)" },
    { icon: Building2, label: "Sectoare", value: 6, decimals: 0, suffix: "", color: "#8B5CF6", description: "primării + CGMB" },
    { icon: Bike, label: "Piste bicicletă", value: 373, decimals: 0, suffix: "", color: "#059669", description: "segmente OSM verified" },
    { icon: Train, label: "Stații metrou", value: 55, decimals: 0, suffix: "", color: "#F97316", description: "M1-M5 Metrorex" },
  ];

  return (
    <section className="py-16 bg-[var(--color-surface)]">
      <div className="container-narrow">
        <div className="text-center mb-10">
          <h2 className="font-[family-name:var(--font-sora)] text-3xl md:text-4xl font-bold mb-3">
            Cifrele Bucureștiului
          </h2>
          <p className="text-[var(--color-text-muted)]">Date reale, din surse publice.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[12px] p-5 text-center"
              >
                <Icon size={24} style={{ color: s.color }} className="mx-auto mb-3" />
                <p className="text-3xl md:text-4xl font-bold" style={{ color: s.color }}>
                  <CountUp to={s.value} decimals={s.decimals} suffix={s.suffix} />
                </p>
                <p className="text-sm font-medium mt-1">{s.label}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{s.description}</p>
              </div>
            );
          })}
        </div>
        <div className="max-w-sm mx-auto">
          <LiveAqiWidget />
        </div>
      </div>
    </section>
  );
}
