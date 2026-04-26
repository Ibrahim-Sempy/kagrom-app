import Image from "next/image";
import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-3">
      <div className="rounded-2xl border border-[color:var(--stroke)] bg-white/90 p-2 shadow-[0_12px_30px_rgba(56,91,42,0.08)]">
        <Image src="/kagrom-mark.svg" alt="KAGROM SARLU" width={compact ? 42 : 54} height={compact ? 42 : 54} />
      </div>
      <div className="leading-none">
        <p className="font-display text-xl font-bold uppercase tracking-[0.18em] text-[color:var(--brand-green)]">
          Kagrom Sarlu
        </p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--brand-gold)]">
          Gestion integree formation & services
        </p>
      </div>
    </Link>
  );
}
