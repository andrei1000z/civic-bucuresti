"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const tooltipStyle = {
  backgroundColor: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "8px",
  fontSize: "12px",
};

// ─── Accidente lunare (Area chart) ───
export function AccidenteLunareCountyChart({
  data,
}: {
  data: { month: string; value: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="accidenteColorC" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#DC2626" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="month" stroke="var(--color-text-muted)" fontSize={11} />
        <YAxis stroke="var(--color-text-muted)" fontSize={11} />
        <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "var(--color-text)" }} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#DC2626"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#accidenteColorC)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Sesizări tipuri (Pie chart) ───
export function SesizariTipuriCountyChart({
  data,
}: {
  data: { name: string; value: number; culoare: string }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={50}
          paddingAngle={2}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.culoare} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: "11px" }} iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ─── Generic bar chart (reusable for multiple sections) ───
export function GenericBarChart({
  data,
  dataKey,
  xKey,
  color = "#2563EB",
  formatter,
  layout = "horizontal",
}: {
  data: Record<string, unknown>[];
  dataKey: string;
  xKey: string;
  color?: string;
  formatter?: (v: number) => string;
  layout?: "horizontal" | "vertical";
}) {
  if (layout === "vertical") {
    return (
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis type="number" stroke="var(--color-text-muted)" fontSize={11} />
          <YAxis
            type="category"
            dataKey={xKey}
            stroke="var(--color-text-muted)"
            fontSize={11}
            width={80}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={formatter ? (v: unknown) => formatter(v as number) : undefined}
          />
          <Bar dataKey={dataKey} fill={color} radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey={xKey} stroke="var(--color-text-muted)" fontSize={11} />
        <YAxis stroke="var(--color-text-muted)" fontSize={11} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={formatter ? (v: unknown) => formatter(v as number) : undefined}
        />
        <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Population comparison chart ───
export function PopulatieChart({
  data,
}: {
  data: { name: string; populatie: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis type="number" stroke="var(--color-text-muted)" fontSize={11} />
        <YAxis type="category" dataKey="name" stroke="var(--color-text-muted)" fontSize={11} width={100} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => `${(v as number).toLocaleString("ro-RO")} loc.`} />
        <Bar dataKey="populatie" fill="#6366F1" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
