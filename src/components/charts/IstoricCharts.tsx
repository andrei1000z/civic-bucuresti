"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { primari, consiliiGenerale } from "@/data/primari";

const tooltipStyle = {
  backgroundColor: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "8px",
  fontSize: "12px",
};

export function DurateMandateChart() {
  const data = primari.map((p) => ({
    name: p.nume.split(" ").slice(-1)[0],
    durata: (p.anSfarsit ?? new Date().getFullYear()) - p.anInceput,
    culoare: p.culoarePartid,
  }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis type="number" stroke="var(--color-text-muted)" fontSize={11} />
        <YAxis type="category" dataKey="name" stroke="var(--color-text-muted)" fontSize={11} width={100} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v} ani`} />
        <Bar dataKey="durata" radius={[0, 6, 6, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.culoare} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CompozitieCGChart() {
  // Transform data for stacked bar chart
  const partide = ["PSD", "PNL", "USR", "PD-L", "PD", "PNȚCD", "USR-PLUS", "FSN", "CDR", "PDSR", "ALDE", "PMP", "AUR", "USD", "USL (PSD+PNL)", "Alții"];
  const data = consiliiGenerale.map((cg) => {
    const entry: Record<string, string | number> = { perioada: cg.perioada };
    partide.forEach((p) => {
      const match = cg.compozitie.find((c) => c.partid === p);
      entry[p] = match?.procent ?? 0;
    });
    return entry;
  });

  const presentPartide = partide.filter((p) =>
    data.some((d) => (d[p] as number) > 0)
  );

  const colorMap: Record<string, string> = {
    PSD: "#DC2626",
    PNL: "#EAB308",
    USR: "#2563EB",
    "PD-L": "#F97316",
    PD: "#F97316",
    PNȚCD: "#0F766E",
    "USR-PLUS": "#2563EB",
    FSN: "#6366F1",
    CDR: "#0F766E",
    PDSR: "#DC2626",
    ALDE: "#8B5CF6",
    PMP: "#0EA5E9",
    AUR: "#1F2937",
    USD: "#F97316",
    "USL (PSD+PNL)": "#DC2626",
    Alții: "#94A3B8",
  };

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="perioada" stroke="var(--color-text-muted)" fontSize={9} angle={-30} textAnchor="end" height={60} />
        <YAxis stroke="var(--color-text-muted)" fontSize={11} unit="%" />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: "10px" }} />
        {presentPartide.map((p) => (
          <Bar key={p} dataKey={p} stackId="a" fill={colorMap[p] || "#94A3B8"} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
