import { ImageResponse } from "next/og";
import { buildOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-helpers";

export const runtime = "nodejs";
export const alt = "Accesibilitate — Civia";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function AccesibilitateOG() {
  return new ImageResponse(
    buildOgCard({
      badge: "Drepturi & facilități",
      title: "Accesibilitate pentru toți",
      subtitle: "Drepturi garantate prin L448/2006, resurse utile, declarație WCAG 2.1 AA.",
      accent: "#0891b2",
      icon: "♿",
      metrics: [
        { label: "Beneficiari", value: "800k+" },
        { label: "Indemnizație max", value: "1.300 lei" },
        { label: "Conformitate", value: "WCAG 2.1 AA" },
        { label: "Suport", value: "0800 500 333" },
      ],
    }),
    size
  );
}
