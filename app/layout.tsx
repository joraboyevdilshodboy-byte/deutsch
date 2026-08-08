import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";

export const metadata: Metadata = {
  title: {
    default: "deutsch.gg — Nemis tilini ishonch bilan o‘rganing",
    template: "%s | deutsch.gg",
  },
  description:
    "Nemis tili uchun interaktiv grammatika, AI suhbat, tinglab tushunish va kundalik progress platformasi.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uz">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
