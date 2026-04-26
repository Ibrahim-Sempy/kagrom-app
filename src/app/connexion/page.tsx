import Image from "next/image";
import { loginAction } from "@/app/actions";
import { Brand } from "@/components/brand";
import { Users, Briefcase, CreditCard, QrCode, Lock, Eye } from "lucide-react";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen">
      {/* Left Pane */}
      <section className="hidden w-[55%] flex-col items-center justify-center bg-[color:var(--foreground)] p-12 lg:flex relative overflow-hidden">
        {/* Subtle gradients matching the dark brand bg */}
        <div className="absolute left-[-10%] top-[-10%] h-[600px] w-[600px] rounded-full bg-[rgba(200,135,42,0.06)] blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-[rgba(79,127,61,0.08)] blur-3xl" />
        
        <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center">
          <Brand />
          
          <div className="mt-8 rounded-md bg-white/5 border border-white/5 px-6 py-2">
            <p className="text-[15px] font-display italic text-white/80">
              "L'accelerateur de votre gestion quotidienne"
            </p>
          </div>
          
          <div className="mt-14 w-full space-y-6 text-left pl-4">
            <div className="flex items-center gap-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/80">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-white">Gestion apprenants</h3>
                <p className="text-[13px] text-white/50">Inscription, notation et badges</p>
              </div>
            </div>
            
            <div className="flex items-center gap-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/80">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-white">Prestations & Missions</h3>
                <p className="text-[13px] text-white/50">Metiers geres et missions suivies</p>
              </div>
            </div>
            
            <div className="flex items-center gap-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/80">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-white">Suivi financier</h3>
                <p className="text-[13px] text-white/50">Factures, paiements et recus</p>
              </div>
            </div>
            
            <div className="flex items-center gap-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/80">
                <QrCode className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-white">QR Code & certificats</h3>
                <p className="text-[13px] text-white/50">Generation et verification automatique</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Right Pane */}
      <section className="flex w-full lg:w-[45%] items-center justify-center bg-[color:var(--surface)] px-6 py-12">
        <div className="w-full max-w-[380px]">
          <h2 className="text-[28px] font-bold text-[color:var(--foreground)] leading-tight">Connectez-vous</h2>
          <p className="mt-1.5 text-[15px] text-[color:var(--foreground-muted)]">Accedez a votre espace KAGROM.</p>

          {error ? (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          ) : null}

          <form action={loginAction} className="mt-8 space-y-4">
            <div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <span className="text-[color:var(--foreground-muted)] text-[15px] font-medium">@</span>
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Adresse email*"
                  defaultValue="admin@kagrom.com"
                  className="block w-full rounded-md border border-[color:var(--stroke)] bg-white py-3 pl-11 pr-4 text-[14px] text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--brand-green)] focus:ring-1 focus:ring-[color:var(--brand-green)]"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-4 w-4 text-[color:var(--foreground-muted)]" />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="Mot de passe*"
                  defaultValue="Kagrom2026!"
                  className="block w-full rounded-md border border-[color:var(--stroke)] bg-white py-3 pl-11 pr-11 text-[14px] text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--brand-green)] focus:ring-1 focus:ring-[color:var(--brand-green)]"
                />
                <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <Eye className="h-[18px] w-[18px] text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)] transition-colors" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-[color:var(--brand-green)] py-3 text-[15px] font-medium text-white transition hover:bg-[color:var(--brand-green-strong)] shadow-sm"
            >
              <span className="font-bold text-lg leading-none mt-[-2px]">→</span> Se connecter
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
