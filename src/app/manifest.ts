import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "Civia",
    description: SITE_DESCRIPTION,
    // When the app boots from the installed icon, send the user
    // straight to the primary action (sesizare submit) — that's
    // why most people installed it.
    start_url: "/sesizari?utm_source=pwa",
    display: "standalone",
    // Keep the PWA theme color aligned with the brand primary.
    // Light-#F8FAFC was close to pure white and ended up looking
    // like a splash mismatch; #FAFAFA matches --color-bg in light.
    background_color: "#FAFAFA",
    theme_color: "#059669",
    lang: "ro-RO",
    dir: "ltr" as const,
    scope: "/",
    orientation: "any" as const,
    prefer_related_applications: false,
    categories: ["government", "civic", "utilities", "news"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Trimite o sesizare", short_name: "Sesizare", url: "/sesizari", description: "Scrie o sesizare formală către primărie" },
      { name: "Urmărește sesizarea", short_name: "Urmărește", url: "/urmareste", description: "Verifică statusul cu codul primit" },
      { name: "Calitatea aerului live", short_name: "Aer", url: "/aer", description: "Hartă live cu senzori din toată România" },
      { name: "Sesizări publice", short_name: "Publice", url: "/sesizari-publice", description: "Votează și co-semnează sesizări civice" },
    ],
  };
}
