"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AlertCircle, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/auth-layout";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError("");
    if (password.length < 8) { setError("Parol kamida 8 belgidan iborat bo‘lishi kerak."); return; }
    setLoading(true);
    try {
      const response = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Ro‘yxatdan o‘tib bo‘lmadi.");
      const login = await signIn("credentials", { email, password, redirect: false });
      if (login?.error) { router.push("/login?registered=1"); return; }
      router.push("/dashboard"); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Kutilmagan xatolik yuz berdi."); }
    finally { setLoading(false); }
  };
  return (
    <AuthLayout title="O‘qishni bugun boshlang" description="Bir necha soniyada shaxsiy nemis tili rejangizni yarating.">
      <form onSubmit={submit} className="space-y-4">
        {error && <p role="alert" className="flex gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-sm font-semibold text-rose-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</p>}
        <label className="block text-sm font-bold text-ink">Ismingiz<input autoComplete="name" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} placeholder="Masalan, Dilshod" className="focus-ring mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium" /></label>
        <label className="block text-sm font-bold text-ink">Email<input autoComplete="email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="siz@email.com" className="focus-ring mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium" /></label>
        <label className="block text-sm font-bold text-ink">Parol<div className="relative mt-1.5"><input autoComplete="new-password" required minLength={8} type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Kamida 8 belgi" className="focus-ring w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 pr-11 text-sm font-medium" /><button type="button" aria-label="Parolni ko‘rsatish" onClick={() => setShowPassword(!showPassword)} className="focus-ring absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></label>
        <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><Check className="h-3.5 w-3.5 text-forest" /> Parolingiz xavfsiz tarzda xeshlanib saqlanadi.</p>
        <button disabled={loading} className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-xl bg-forest px-4 py-3.5 text-sm font-extrabold text-white hover:bg-forest/90 disabled:cursor-not-allowed disabled:opacity-60">{loading && <Loader2 className="h-4 w-4 animate-spin" />} Bepul hisob yaratish</button>
      </form>
      <p className="mt-7 text-center text-sm font-medium text-slate-600">Hisobingiz bormi? <Link href="/login" className="font-extrabold text-forest hover:underline">Kiring</Link></p>
    </AuthLayout>
  );
}
