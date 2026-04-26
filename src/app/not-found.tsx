import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[color:var(--surface-2)] px-4">
      <div className="max-w-xl rounded-[32px] border border-[color:var(--stroke)] bg-white p-8 text-center shadow-[0_24px_70px_rgba(56,91,42,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-gold)]">KAGROM SARLU</p>
        <h1 className="mt-4 font-display text-4xl font-bold text-[color:var(--foreground)]">Ressource introuvable</h1>
        <p className="mt-4 text-sm leading-7 text-[color:var(--foreground-muted)]">
          La page demandee n'existe pas ou le document recherche n'est pas disponible dans la base.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-[color:var(--brand-green)] px-5 text-sm font-semibold text-white"
        >
          Retour au tableau de bord
        </Link>
      </div>
    </main>
  );
}
