import Link from "next/link";
import { createInvoiceAction, recordPaymentAction } from "@/app/actions";
import { DataTable, Field, PageHeader, Panel, SelectField, SubmitButton, TextArea } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decimalToNumber, formatCurrency, formatDate } from "@/lib/utils";
import { Role } from "@prisma/client";

export default async function FinancesPage() {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.ACCOUNTANT]);

  const [missions, invoices, payments] = await Promise.all([
    prisma.serviceMission.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      include: { payments: true },
    }),
    prisma.payment.findMany({
      orderBy: { paidAt: "desc" },
      include: { receipt: true, invoice: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Facturation et comptabilite simplifiee"
        title="Factures, paiements et recus"
        description="Suivi des entrees financieres, historique des transactions et impression immediate des recus."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Nouvelle facture" description="Facturation d'une mission de prestation ou d'un besoin ponctuel.">
          <form action={createInvoiceAction} className="grid gap-4 md:grid-cols-2">
            <Field label="Client" name="clientName" required />
            <Field label="Montant" name="amount" type="number" required />
            <Field label="Echeance" name="dueDate" type="date" required />
            <SelectField
              label="Mission liee"
              name="missionId"
              options={missions.map((mission) => ({
                value: mission.id,
                label: `${mission.missionNo} - ${mission.clientName}`,
              }))}
            />
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
                label: `${invoice.invoiceNo} - ${invoice.clientName}`,
              }))}
            />
            <Field label="Montant paye" name="amount" type="number" required />
            <Field label="Date de paiement" name="paidAt" type="date" required />
            <SelectField
              label="Mode de paiement"
              name="method"
              required
              options={[
                { value: "CASH", label: "Especes" },
                { value: "MOBILE_MONEY", label: "Mobile Money" },
                { value: "BANK_TRANSFER", label: "Virement bancaire" },
                { value: "CARD", label: "Carte" },
              ]}
            />
            <div className="md:col-span-2">
              <Field label="Reference" name="reference" />
            </div>
            <div className="md:col-span-2">
              <SubmitButton label="Valider le paiement" />
            </div>
          </form>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Panel title="Factures emises" description="Etat des factures et progression d'encaissement.">
          <DataTable
            headers={["Facture", "Description", "Montant", "Encaisse", "Statut"]}
            rows={invoices.map((invoice) => {
              const paid = invoice.payments.reduce((sum, payment) => sum + decimalToNumber(payment.amount), 0);

              return [
                <div key="invoice">
                  <p className="font-semibold">{invoice.invoiceNo}</p>
                  <p className="text-xs text-[color:var(--foreground-muted)]">{invoice.clientName}</p>
                </div>,
                <div key="description">
                  <p>{invoice.description}</p>
                  <p className="text-xs text-[color:var(--foreground-muted)]">{formatDate(invoice.dueDate)}</p>
                </div>,
                formatCurrency(decimalToNumber(invoice.amount)),
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
              payment.method,
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
