import Link from "next/link";
import { ArrowLeft, Home, Search } from "lucide-react";
import { Brand } from "@/components/brand";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <header className="border-b border-forest/10 bg-white/70 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Brand />
          <Link
            href="/"
            className="focus-ring inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-forest hover:bg-mint"
          >
            <Home className="h-4 w-4" /> Bosh sahifa
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-6 text-center">
        <div className="mx-auto max-w-md">
          <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-mint text-forest shadow-lg shadow-forest/10">
            <Search className="h-12 w-12" />
            <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-lime text-xs font-black text-forest">
              404
            </span>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-ink sm:text-4xl">
            Sahifa topilmadi
          </h1>
          <p className="mt-3 text-base font-medium text-slate-600">
            Siz qidirayotgan sahifa o‘chirilgan, nomi o‘zgartirilgan yoki vaqtincha mavjud emas bo‘lishi mumkin.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard"
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-forest px-6 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-forest/20 hover:bg-forest/90"
            >
              Dashboard sahifasiga o‘tish
            </Link>
            <Link
              href="/"
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-extrabold text-ink hover:bg-mint/50"
            >
              <ArrowLeft className="h-4 w-4" /> Ortga qaytish
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
