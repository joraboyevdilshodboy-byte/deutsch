import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";

export const viewport: Viewport = {
  themeColor: "#185C48",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://deutsch.gg"),
  title: {
    default: "deutsch.gg — Nemis tilini ishonch bilan o‘rganing",
    template: "%s | deutsch.gg",
  },
  description:
    "Nemis tili uchun interaktiv grammatika, AI suhbat, tinglab tushunish va kundalik progress platformasi.",
  keywords: [
    "nemis tili",
    "deutsch.gg",
    "nemis tilini o'rganish",
    "german grammar",
    "AI german chat",
    "uzbek german",
    "A1 A2 B1 B2 nemis tili",
  ],
  authors: [{ name: "deutsch.gg Team" }],
  openGraph: {
    title: "deutsch.gg — Nemis tilini gapirib o‘rganing",
    description:
      "Nemis tili uchun interaktiv grammatika, AI suhbat, tinglab tushunish va kundalik progress platformasi.",
    url: "https://deutsch.gg",
    siteName: "deutsch.gg",
    images: [
      {
        url: "/title.png",
        width: 1200,
        height: 630,
        alt: "deutsch.gg platformasi",
      },
    ],
    locale: "uz_UZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "deutsch.gg — Nemis tilini gapirib o‘rganing",
    description:
      "Nemis tili uchun interaktiv grammatika, AI suhbat, tinglab tushunish va kundalik progress platformasi.",
    images: ["/title.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uz">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
