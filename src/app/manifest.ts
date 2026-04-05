import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "Civia",
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#F8FAFC",
    theme_color: "#1C4ED8",
    lang: "ro",
    orientation: "portrait",
    categories: ["government", "civic", "utilities", "news"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Fă o sesizare", url: "/sesizari", description: "Trimite o sesizare către autorități" },
      { name: "Hărți", url: "/harti", description: "Hărți interactive București" },
      { name: "Știri", url: "/stiri", description: "Știri din București" },
    ],
  };
}
