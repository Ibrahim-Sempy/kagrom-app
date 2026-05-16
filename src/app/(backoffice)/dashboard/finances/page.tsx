import Link from "next/link";
import { createInvoiceAction, recordPaymentAction } from "@/app/actions";
import { DataTable, Field, PageHeader, Panel, SelectField, SubmitButton, TextArea } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decimalToNumber, formatCurrency, formatDate } from "@/lib/utils";
import { Role } from "@prisma/client";

export default async function FinancesPage() {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.ACCOUNTANT]);

  const [invoices, payments] = await Promise.all([
    prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      include: { payments: true, enrollment: {include: {learner: true}}, assignment: { include: { employee: true, household: true } } },
    }),
    prisma.payment.findMany({
      orderBy: { paidAt: "desc" },
      include: { receipt: true, invoice: true, paymentMode: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* <PageHeader
        eyebrow="Facturation et comptabilite simplifiee"
        title="Factures, paiements et recus"
        description="Suivi des entrees financieres, historique des transactions et impression immediate des recus."
      /> */}

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Nouvelle facture" description="Facturation d'une mission de prestation ou d'un besoin ponctuel.">
          <form action={createInvoiceAction} className="grid gap-4 md:grid-cols-2">
            <SelectField
              label="Type de facture"
              name="type"
              required
              options={[
                { value: "client", label: "Client (Foyer)" },
                { value: "learner", label: "Apprenant" },
              ]}
            />
            <SelectField
              label="Enrollment/Assignment"
              name="enrollmentId"
              options={[
                ...invoices
                  .filter((inv) => inv.enrollmentId)
                  .map((inv) => ({
                    value: inv.enrollmentId || "",
                    label: `Inscription - ${inv.enrollment?.learner?.firstName} ${inv.enrollment?.learner?.lastName}`,
                  })),
              ]}
            />
            <Field label="Montant" name="amount" type="number" required />
            <Field label="Echeance" name="dueDate" type="date" required />
            <div className="md:col-span-2">
              <TextArea label="Description" name="description" />
            </div>
            <div className="md:col-span-2">
              <SubmitButton label="Emettre la facture" />
            </div>
          </form>
        </Panel>

        <Panel title="Enregistrer un paiement" description="Chaque paiement genere automatiquement un recu.">
          <form action={recordPaymentAction} className="grid gap-4 md:grid-cols-2">
            <SelectField
              label="Facture"
              name="invoiceId"
              required
              options={invoices.map((invoice) => ({
                value: invoice.id,
                label: `${invoice.invoiceNo} - ${formatCurrency(decimalToNumber(invoice.ammount))}`,
              }))}
            />
            <Field label="Montant paye" name="amount" type="number" required />
            <Field label="Date de paiement" name="paidAt" type="date" required />
            <SelectField
              label="Mode de paiement"
              name="paymentModeId"
              required
              options={[
                { value: "cash", label: "Especes" },
                { value: "mobile_money", label: "Mobile Money" },
                { value: "bank_transfer", label: "Virement bancaire" },
                { value: "card", label: "Carte" },
              ]}
            />
            <div className="md:col-span-2">
              <SubmitButton label="Valider le paiement" />
            </div>
          </form>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Panel title="Factures emises" description="Etat des factures et progression d'encaissement.">
          <DataTable
            headers={["Facture", "Type", "Montant", "Encaisse", "Statut"]}
            rows={invoices.map((invoice) => {
              const paid = invoice.payments.reduce((sum, payment) => sum + decimalToNumber(payment.amount), 0);
              const recipient =
                invoice.type === "learner"
                  ? `${invoice.enrollment?.learner?.firstName} ${invoice.enrollment?.learner?.lastName}`
                  : `${invoice.assignment?.household?.firstName} ${invoice.assignment?.household?.lastName}`;

              return [
                <div key="invoice">
                  <p className="font-semibold">{invoice.invoiceNo}</p>
                  <p className="text-xs text-[color:var(--foreground-muted)]">{recipient}</p>
                </div>,
                invoice.type === "learner" ? "Apprenant" : "Client",
                formatCurrency(decimalToNumber(invoice.ammount)),
                formatCurrency(paid),
                invoice.status,
              ];
            })}
          />
        </Panel>

        <Panel title="Historique des transactions" description="Journal simplifie des encaissements et acces direct au recu.">
          <DataTable
            headers={["Paiement", "Facture", "Montant", "Mode", "Recu"]}
            rows={payments.map((payment) => [
              <div key="payment">
                <p className="font-semibold">{payment.paymentNo}</p>
                <p className="text-xs text-[color:var(--foreground-muted)]">{formatDate(payment.paidAt)}</p>
              </div>,
              payment.invoice?.invoiceNo || "-",
              formatCurrency(decimalToNumber(payment.amount)),
              payment.paymentMode?.label || "-",
              payment.receipt ? (
                <Link href={`/recus/${payment.receipt.id}`} className="inline-flex rounded-full bg-[color:var(--brand-gold)] px-3 py-2 text-xs font-semibold text-white">
                  Imprimer
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
