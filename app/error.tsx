"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-6 text-center text-ink">
      <div className="mx-auto max-w-md rounded-3xl border border-white bg-white/80 p-8 shadow-2xl backdrop-blur sm:p-10">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <AlertTriangle className="h-10 w-10" />
        </div>

        <h1 className="text-2xl font-black text-ink sm:text-3xl">
          Nimadir xato ketdi
        </h1>
        <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">
          Kutilmagan xatolik yuz berdi. Sahifani qayta yuklab ko‘ring yoki bosh sahifaga qayting.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-forest px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-forest/20 hover:bg-forest/90"
          >
            <RefreshCw className="h-4 w-4" /> Qayta urinib ko‘rish
          </button>
          <Link
            href="/"
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-extrabold text-ink hover:bg-mint/50"
          >
            <Home className="h-4 w-4" /> Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    </div>
  );
}
