import Link from "next/link";
import { createEnrollmentPaymentAction } from "@/app/actions";
import { DataTable, Field, PageHeader, Panel, SelectField, SubmitButton } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decimalToNumber, formatCurrency, formatDate } from "@/lib/utils";
import { Role } from "@prisma/client";

export default async function PaymentsPage() {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.ACCOUNTANT]);

  const [enrollments, installments, payments] = await Promise.all([
    prisma.enrollment.findMany({
      orderBy: { registrationDate: "desc" },
      include: { learner: true, trainingModule: true },
    }),
    prisma.paymentInstallment.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.payment.findMany({
      orderBy: { paidAt: "desc" },
      include: { enrollment: { include: { learner: true, trainingModule: true } }, installment: true, receipt: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Formation"
        title="Gestion des Paiements"
        description="Enregistrez les paiements par apprenant et par tranche, puis suivez l'historique avec recu automatique."
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel title="Enregistrer un Paiement" description="Paiement d'une tranche ou d'un reglement libre relie a l'inscription.">
          <form action={createEnrollmentPaymentAction} className="grid gap-4 md:grid-cols-2">
            <SelectField
              label="Apprenant"
              name="enrollmentId"
              required
              options={enrollments.map((enrollment) => ({
                value: enrollment.id,
                label: `${enrollment.matricule} - ${enrollment.learner.firstName} ${enrollment.learner.lastName}`,
              }))}
            />
            <SelectField
              label="Tranche"
              name="installmentId"
              options={installments.map((installment) => ({ value: installment.id, label: installment.label }))}
            />
            <Field label="Montant (GNF)" name="amount" type="number" required />
            <Field label="Date de Paiement" name="paidAt" type="date" required />
            <SelectField
              label="Mode de Paiement"
              name="method"
              required
              options={[
                { value: "CASH", label: "Espece" },
                { value: "MOBILE_MONEY", label: "Mobile Money" },
                { value: "BANK_TRANSFER", label: "Virement" },
                { value: "CARD", label: "Carte" },
              ]}
            />
            <Field label="Reference" name="reference" />
            <div className="md:col-span-2">
              <Field label="Commentaire" name="comment" />
            </div>
            <div className="md:col-span-2">
              <SubmitButton label="Enregistrer le Paiement" />
            </div>
          </form>
        </Panel>

        <Panel title="Historique des Paiements" description="Vue detaillee des paiements saisis avec acces au recu.">
          <DataTable
            headers={["Date", "Apprenant", "Tranche", "Montant", "Mode", "Actions"]}
            rows={payments.map((payment) => [
              formatDate(payment.paidAt),
              <div key="learner">
                <p className="font-semibold">
                  {payment.enrollment?.learner.firstName} {payment.enrollment?.learner.lastName}
                </p>
                <p className="text-xs text-[color:var(--foreground-muted)]">{payment.enrollment?.matricule}</p>
              </div>,
              payment.installment?.label || "Libre",
              formatCurrency(decimalToNumber(payment.amount)),
              payment.method,
              payment.receipt ? (
                <Link href={`/recus/${payment.receipt.id}`} className="rounded-full bg-[color:var(--brand-green)] px-3 py-2 text-xs font-semibold text-white">
                  Recu
                </Link>
              ) : (
                "-"
              ),
            ])}
          />
        </Panel>
      </div>
    </div>
  );
}
