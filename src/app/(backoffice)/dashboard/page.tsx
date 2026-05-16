import Link from "next/link";
import { PageHeader, Panel, StatCard } from "@/components/ui";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decimalToNumber, formatCurrency, formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  await requireSession();

  const [learners, enrollments, pendingPayments, certified, cashTotals, recentCertificates] = await Promise.all([
    prisma.learner.count(),
    prisma.enrollment.count(),
    prisma.enrollment.count({ where: { paymentStatus: { not: "PAID" } } }),
    prisma.certificate.count(),
    prisma.payment.aggregate({ _sum: { amount: true } }),
    prisma.certificate.findMany({
      take: 4,
      orderBy: { issuedAt: "desc" },
      include: {
        enrollment: {
          include: {
            learner: true,
            enrollmentModules: { include: { trainingModule: true } },
          },
        },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* <PageHeader
        eyebrow="KAGROM SARLU"
        title="Dashboard"
        description="Vue globale des inscriptions, paiements, certifications et activites de l'application mise a jour."
      /> */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Apprenants" value={learners.toString()} />
        <StatCard label="Total Inscriptions" value={enrollments.toString()} />
        <StatCard label="Paiements en Attente" value={pendingPayments.toString()} />
        <StatCard label="Total Certifies" value={certified.toString()} tone="gold" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Encaisse" value={formatCurrency(decimalToNumber(cashTotals._sum.amount))} />
        <StatCard label="Reste a Encaisser" value="Suivi auto" />
        <StatCard label="Solde Caisse" value={formatCurrency(decimalToNumber(cashTotals._sum.amount))} />
        <StatCard label="Prestations actives" value="KAGROM" tone="gold" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel title="Dernieres Certifications" description="Derniers apprenants valides avec acces direct aux documents.">
          <div className="space-y-4">
            {recentCertificates.map((certificate) => (
              <div key={certificate.id} className="rounded-md border border-[color:var(--stroke)] bg-white p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--brand-gold)]">{certificate.certificateNo}</p>
                <p className="mt-2 font-display text-2xl font-bold text-[color:var(--foreground)]">
                  {certificate.enrollment.learner.firstName} {certificate.enrollment.learner.lastName}
                </p>
                <p className="mt-1 text-sm text-[color:var(--foreground-muted)]">
                  {certificate.enrollment.enrollmentModules[0]?.trainingModule?.name || "Module non renseigné"}
                </p>
                <p className="mt-3 text-xs text-[color:var(--foreground-muted)]">Emission : {formatDate(certificate.issuedAt)}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Raccourcis de Gestion" description="Acces rapide aux modules les plus utilises.">
          <div className="grid gap-3">
            <Link href="/dashboard/inscriptions" className="block rounded-md bg-[#eef2ff] p-5 text-[#3730a3] transition hover:bg-[#e0e7ff] font-medium">Inscriptions et nouveaux apprenants</Link>
            <Link href="/dashboard/paiements" className="block rounded-md bg-[#ecfeff] p-5 text-[#155e75] transition hover:bg-[#cffafe] font-medium">Paiements, reçus et tranches</Link>
            <Link href="/dashboard/notes-evaluations" className="block rounded-md bg-[#f0fdf4] p-5 text-[#166534] transition hover:bg-[#dcfce7] font-medium">Notes, évaluations et certificats</Link>
            <Link href="/dashboard/services" className="block rounded-md bg-[#fff7ed] p-5 text-[#9a3412] transition hover:bg-[#ffedd5] font-medium">Services, employés, foyers et affectations</Link>
          </div>
        </Panel>
      </div>
    </div>
  );
}
