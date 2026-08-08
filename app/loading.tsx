export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-mint border-t-forest" />
          <span className="absolute text-xl">🇩🇪</span>
        </div>
        <div>
          <p className="text-base font-extrabold text-forest animate-pulse">deutsch.gg</p>
          <p className="mt-1 text-xs font-semibold text-slate-400">Yuklanmoqda...</p>
        </div>
      </div>
    </div>
  );
}
