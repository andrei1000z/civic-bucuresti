import type { ReactElement } from "react";

/**
 * Shared OG image template for Civia pages that display data metrics.
 * 1200×630 PNG output via next/og ImageResponse.
 *
 * Use from a route segment's opengraph-image.tsx by wrapping the return
 * in ImageResponse(buildOgCard({ ... }), { width: 1200, height: 630 }).
 *
 * Keeping all styles inline because next/og runs in a restricted runtime
 * that doesn't load stylesheets.
 */

export interface OgCardProps {
  /** Small badge/eyebrow above the title (e.g., "Dashboard public") */
  badge?: string;
  /** Big headline */
  title: string;
  /** Secondary line under the title */
  subtitle?: string;
  /** Up to 4 metric boxes displayed as cards */
  metrics?: Array<{ label: string; value: string }>;
  /** Accent color for the card borders + gradient (hex) */
  accent?: string;
  /** Emoji or single-character icon displayed top-right */
  icon?: string;
  /** Footer text (default: "civia.ro") */
  footer?: string;
}

export function buildOgCard(props: OgCardProps): ReactElement {
  const {
    badge,
    title,
    subtitle,
    metrics = [],
    accent = "#059669",
    icon = "🇷🇴",
    footer = "civia.ro",
  } = props;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: 72,
        background: `linear-gradient(135deg, #0f172a 0%, #1e293b 60%, ${accent} 100%)`,
        color: "#ffffff",
        fontFamily: "sans-serif",
      }}
    >
      {/* Top row: badge + icon */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 48 }}>
        {badge ? (
          <div
            style={{
              display: "flex",
              padding: "8px 18px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            {badge}
          </div>
        ) : <div />}
        <div style={{ fontSize: 64, display: "flex" }}>{icon}</div>
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 80,
          fontWeight: 800,
          lineHeight: 1.05,
          letterSpacing: -2,
          marginBottom: subtitle ? 20 : 36,
          display: "flex",
          maxWidth: 1050,
        }}
      >
        {title}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div
          style={{
            fontSize: 28,
            opacity: 0.85,
            marginBottom: 44,
            lineHeight: 1.4,
            display: "flex",
            maxWidth: 1000,
          }}
        >
          {subtitle}
        </div>
      )}

      {/* Metrics row */}
      {metrics.length > 0 && (
        <div style={{ display: "flex", gap: 20, marginTop: "auto", marginBottom: 24 }}>
          {metrics.slice(0, 4).map((m, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                padding: "20px 24px",
                borderRadius: 16,
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <div style={{ fontSize: 18, opacity: 0.8, marginBottom: 4, display: "flex" }}>{m.label}</div>
              <div style={{ fontSize: 44, fontWeight: 800, display: "flex" }}>{m.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: metrics.length ? 0 : "auto",
          opacity: 0.8,
          fontSize: 22,
        }}
      >
        <div style={{ display: "flex", fontWeight: 700 }}>Civia</div>
        <div style={{ display: "flex" }}>{footer}</div>
      </div>
    </div>
  );
}

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";
