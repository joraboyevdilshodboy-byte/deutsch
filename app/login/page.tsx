"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { AlertCircle, Eye, EyeOff, Loader2, Mail, X } from "lucide-react";
import { AuthLayout } from "@/components/auth-layout";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) { setError("Email yoki parol noto‘g‘ri. Qaytadan urinib ko‘ring."); return; }
      router.push(searchParams.get("callbackUrl") || "/dashboard");
      router.refresh();
    } catch { setError("Kirishda xatolik yuz berdi. Internet aloqangizni tekshiring."); }
    finally { setLoading(false); }
  };

  const requestReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResetMessage(""); setResetLoading(true);
    try {
      const response = await fetch("/api/auth/reset/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error);
      setResetMessage(data.devResetUrl ? `Rivojlanish havolasi: ${data.devResetUrl}` : "Agar bu email ro‘yxatdan o‘tgan bo‘lsa, parolni tiklash havolasi yuborildi.");
    } catch { setResetMessage("So‘rovni yuborib bo‘lmadi. Keyinroq qayta urinib ko‘ring."); }
    finally { setResetLoading(false); }
  };

  return (
    <AuthLayout title="Qaytganingizdan xursandmiz" description="O‘qishni davom ettirish uchun hisobingizga kiring.">
      <form onSubmit={submit} className="space-y-4">
        {searchParams.get("registered") === "1" && <p className="rounded-xl bg-mint px-3 py-2.5 text-sm font-semibold text-forest">Hisobingiz yaratildi. Endi kirishingiz mumkin.</p>}
        {searchParams.get("reset") === "1" && <p className="rounded-xl bg-mint px-3 py-2.5 text-sm font-semibold text-forest">Parolingiz yangilandi. Yangi parol bilan kiring.</p>}
        {error && <p role="alert" className="flex gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-sm font-semibold text-rose-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</p>}
        <label className="block text-sm font-bold text-ink">Email<input autoComplete="email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="siz@email.com" className="focus-ring mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium placeholder:text-slate-400" /></label>
        <label className="block text-sm font-bold text-ink">Parol<div className="relative mt-1.5"><input autoComplete="current-password" required minLength={8} type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="focus-ring w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 pr-11 text-sm font-medium" /><button type="button" aria-label="Parolni ko‘rsatish" onClick={() => setShowPassword(!showPassword)} className="focus-ring absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></label>
        <div className="flex justify-end"><button type="button" onClick={() => { setResetOpen(true); setResetMessage(""); }} className="focus-ring rounded-lg text-xs font-bold text-forest hover:underline">Parolni unutdingizmi?</button></div>
        <button disabled={loading} className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-xl bg-forest px-4 py-3.5 text-sm font-extrabold text-white hover:bg-forest/90 disabled:cursor-not-allowed disabled:opacity-60">{loading && <Loader2 className="h-4 w-4 animate-spin" />} Kirish</button>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs font-medium text-slate-400"><div className="h-px flex-1 bg-slate-200" />yoki<div className="h-px flex-1 bg-slate-200" /></div>
      <button disabled={googleLoading} onClick={async () => { setGoogleLoading(true); await signIn("google", { callbackUrl: "/dashboard" }); }} className="focus-ring flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-ink hover:bg-slate-50 disabled:opacity-60"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#4285f4] text-xs font-black text-white">G</span>{googleLoading ? "Yo‘naltirilmoqda..." : "Google bilan davom etish"}</button>
      <p className="mt-7 text-center text-sm font-medium text-slate-600">Hisobingiz yo‘qmi? <Link href="/register" className="font-extrabold text-forest hover:underline">Ro‘yxatdan o‘ting</Link></p>

      {resetOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-ink/35 p-4"><div role="dialog" aria-modal="true" className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><h2 className="text-xl font-black text-ink">Parolni tiklash</h2><p className="mt-1 text-sm font-medium text-slate-600">Emailingizga tiklash havolasini yuboramiz.</p></div><button onClick={() => setResetOpen(false)} className="focus-ring rounded-lg p-1 text-slate-500"><X className="h-5 w-5" /></button></div><form onSubmit={requestReset} className="mt-5 space-y-3"><label className="block text-sm font-bold">Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="focus-ring mt-1.5 w-full rounded-xl border px-3 py-3 font-medium" placeholder="siz@email.com" /></label>{resetMessage && <p className="break-all rounded-xl bg-mint px-3 py-2 text-xs font-semibold text-forest">{resetMessage}</p>}<button disabled={resetLoading} className="focus-ring flex w-full items-center justify-center gap-2 rounded-xl bg-forest px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{resetLoading && <Loader2 className="h-4 w-4 animate-spin" />} <Mail className="h-4 w-4" /> Havolani yuborish</button></form></div></div>}
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Yuklanmoqda...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
