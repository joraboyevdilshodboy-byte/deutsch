import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "deutsch.gg — Nemis tilini o‘rganish platformasi",
    short_name: "deutsch.gg",
    description:
      "Nemis tili uchun interaktiv grammatika, AI suhbat, tinglab tushunish va kundalik progress platformasi.",
    start_url: "/",
    display: "standalone",
    background_color: "#F9FAF6",
    theme_color: "#185C48",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
