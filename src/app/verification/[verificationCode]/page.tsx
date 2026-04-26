import { notFound } from "next/navigation";
import { Brand } from "@/components/brand";
import { prisma } from "@/lib/prisma";
import { decimalToNumber, formatDate } from "@/lib/utils";

export default async function VerificationPage({
  params,
}: {
  params: Promise<{ verificationCode: string }>;
}) {
  const { verificationCode } = await params;

  const certificate = await prisma.certificate.findUnique({
    where: { verificationCode },
    include: {
      enrollment: {
        include: {
          learner: true,
          trainingSession: {
            include: { training: true },
          },
        },
      },
    },
  });

  if (!certificate) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[color:var(--surface-2)] px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-[40px] border border-[color:var(--stroke)] bg-white p-8 shadow-[0_24px_70px_rgba(56,91,42,0.08)]">
        <Brand />
        <div className="mt-10 rounded-[32px] bg-[linear-gradient(140deg,rgba(79,127,61,0.96),rgba(57,91,44,0.96))] p-8 text-white">
          <p className="text-xs uppercase tracking-[0.24em] text-white/70">Verification du certificat</p>
          <h1 className="mt-3 font-display text-4xl font-bold">Certificat authentique</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">
            Ce certificat est reconnu dans la base KAGROM SARLU et correspond a un apprenant ayant valide sa formation.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-[28px] border border-[color:var(--stroke)] bg-[color:var(--surface-2)] p-5">
            <p className="text-sm text-[color:var(--foreground-muted)]">Numero de certificat</p>
            <p className="mt-2 text-xl font-semibold">{certificate.certificateNo}</p>
          </div>
          <div className="rounded-[28px] border border-[color:var(--stroke)] bg-[color:var(--surface-2)] p-5">
            <p className="text-sm text-[color:var(--foreground-muted)]">Date d'emission</p>
            <p className="mt-2 text-xl font-semibold">{formatDate(certificate.issuedAt)}</p>
          </div>
          <div className="rounded-[28px] border border-[color:var(--stroke)] bg-[color:var(--surface-2)] p-5">
            <p className="text-sm text-[color:var(--foreground-muted)]">Apprenant</p>
            <p className="mt-2 text-xl font-semibold">
              {certificate.enrollment.learner.firstName} {certificate.enrollment.learner.lastName}
            </p>
          </div>
          <div className="rounded-[28px] border border-[color:var(--stroke)] bg-[color:var(--surface-2)] p-5">
            <p className="text-sm text-[color:var(--foreground-muted)]">Formation</p>
            <p className="mt-2 text-xl font-semibold">{certificate.enrollment.trainingSession.training.title}</p>
          </div>
          <div className="rounded-[28px] border border-[color:var(--stroke)] bg-[color:var(--surface-2)] p-5">
            <p className="text-sm text-[color:var(--foreground-muted)]">Session</p>
            <p className="mt-2 text-xl font-semibold">{certificate.enrollment.trainingSession.name}</p>
          </div>
          <div className="rounded-[28px] border border-[color:var(--stroke)] bg-[color:var(--surface-2)] p-5">
            <p className="text-sm text-[color:var(--foreground-muted)]">Resultat</p>
            <p className="mt-2 text-xl font-semibold">{decimalToNumber(certificate.enrollment.averageScore).toFixed(2)} / 20</p>
          </div>
        </div>
      </div>
    </main>
  );
}
