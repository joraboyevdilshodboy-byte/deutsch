"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/auth-layout";

function ResetPasswordPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      setStatus({ type: "error", message: "Tiklash havolasi yaroqsiz yoki noto‘g‘ri." });
      return;
    }
    setStatus(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Parolni yangilab bo‘lmadi. Iltimos qayta urinib ko‘ring.");
      }

      router.push("/login?reset=1");
    } catch (cause) {
      setStatus({ type: "error", message: cause instanceof Error ? cause.message : "Xatolik yuz berdi." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Parolingizni tiklang"
      description="Yangi parol belgilang va hisobingizga qayta kiring."
    >
      {!token ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          Tiklash havolasi topilmadi. Login sahifasiga qayting yoki parol tiklash havolasini yana yuboring.
          <div className="mt-4">
            <Link href="/login" className="text-forest font-bold hover:underline">
              Kirish sahifasiga qaytish
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          {status ? (
            <p className={`rounded-xl px-3 py-2.5 text-sm font-semibold ${status.type === "error" ? "bg-rose-50 text-rose-700" : "bg-mint text-forest"}`}>
              {status.message}
            </p>
          ) : null}

          <label className="block text-sm font-bold text-ink">
            Yangi parol
            <div className="relative mt-1.5">
              <input
                required
                minLength={8}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Kamida 8 belgi"
                className="focus-ring w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 pr-11 text-sm font-medium"
              />
              <button
                type="button"
                aria-label="Parolni ko‘rsatish"
                onClick={() => setShowPassword((current) => !current)}
                className="focus-ring absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          <button
            disabled={loading}
            className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-xl bg-forest px-4 py-3.5 text-sm font-extrabold text-white hover:bg-forest/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Parolni yangilash
          </button>

          <p className="text-sm text-slate-600">
            Havolani boshqa email orqali olmagan bo‘lsangiz, <Link href="/login" className="font-bold text-forest hover:underline">kirish sahifasiga qayting</Link>.
          </p>
        </form>
      )}
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Yuklanmoqda...</div>}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}
