import Link from "next/link";
import { Prisma, Role } from "@prisma/client";
import { DataTable, PageHeader, Panel } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decimalToNumber, formatCurrency, formatDate } from "@/lib/utils";
import { PaymentsForm } from "./PaymentsForm";
import { PaymentsToolbar } from "./PaymentsToolbar";

export const revalidate = 0;

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;

function readSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function parsePositiveInt(value: string, fallback: number) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function resolvePageSize(value: string, fallback: number) {
  const parsed = parsePositiveInt(value, fallback);
  return PAGE_SIZE_OPTIONS.includes(parsed as (typeof PAGE_SIZE_OPTIONS)[number]) ? parsed : fallback;
}

function buildPaidAtFilter(paidAt: string): Prisma.DateTimeFilter | undefined {
  if (!paidAt) {
    return undefined;
  }

  const start = new Date(`${paidAt}T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return { gte: start, lt: end };
}

type PaymentsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PaymentsPage({ searchParams }: PaymentsPageProps) {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.ACCOUNTANT]);

  const params = await searchParams;
  const invoiceId = readSearchParam(params.invoiceId);
  const paymentModeId = readSearchParam(params.paymentModeId);
  const paidAt = readSearchParam(params.paidAt);
  const requestedPage = parsePositiveInt(readSearchParam(params.page), 1);
  const pageSize = resolvePageSize(readSearchParam(params.pageSize), 10);

  const where: Prisma.PaymentWhereInput = {};

  if (invoiceId) {
    where.invoiceId = invoiceId;
  }

  if (paymentModeId) {
    where.paymentModeId = paymentModeId;
  }

  const paidAtFilter = buildPaidAtFilter(paidAt);
  if (paidAtFilter) {
    where.paidAt = paidAtFilter;
  }

  const [invoices, installments, paymentModes, totalPayments] = await Promise.all([
    prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        enrollment: { include: { learner: true } },
        assignment: { include: { household: true } },
      },
    }),
    prisma.paymentInstallment.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.paymentModeOption.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.payment.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalPayments / pageSize));
  const page = Math.min(requestedPage, totalPages);

  const payments = await prisma.payment.findMany({
    where,
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { paidAt: "desc" },
    include: {
      invoice: {
        include: {
          enrollment: { include: { learner: true } },
          assignment: { include: { household: true } },
        },
      },
      installment: true,
      receipt: true,
      paymentMode: true,
    },
  });

  const invoiceOptions = invoices.map((invoice) => {
    const target = invoice.enrollment
      ? `${invoice.enrollment.learner.firstName} ${invoice.enrollment.learner.lastName}`
      : invoice.assignment
        ? `${invoice.assignment.household.firstName} ${invoice.assignment.household.lastName}`
        : "Sans beneficiaire";

    return {
      value: invoice.id,
      label: `${invoice.invoiceNo} - ${target} - ${formatCurrency(decimalToNumber(invoice.ammount))}`,
    };
  });

  const paymentModeOptions = paymentModes.map((mode) => ({
    value: mode.id,
    label: mode.label,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Formation"
        title="Gestion des Paiements"
        description="Enregistrez les paiements a partir des factures, laissez les references se generer automatiquement puis retrouvez l'historique avec filtres et pagination."
      />

      <PaymentsForm
        invoices={invoiceOptions}
        installments={installments.map((installment) => ({
          value: installment.id,
          label: installment.label,
        }))}
        paymentModes={paymentModeOptions}
      />

      <Panel title="Historique des paiements" description="Filtrez par facture, mode ou date, puis consultez les references automatiques de paiement et de recu.">
        <PaymentsToolbar
          invoices={invoiceOptions}
          paymentModes={paymentModeOptions}
          filters={{ invoiceId, paymentModeId, paidAt }}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          totalItems={totalPayments}
          currentCount={payments.length}
        />

        <div className="mt-6">
          {payments.length ? (
            <DataTable
              headers={["Date", "Facture", "Beneficiaire", "Montant", "Mode", "Reference auto", "Tranche", "Recu"]}
              rows={payments.map((payment) => {
                const beneficiary = payment.invoice?.enrollment
                  ? `${payment.invoice.enrollment.learner.firstName} ${payment.invoice.enrollment.learner.lastName}`
                  : payment.invoice?.assignment
                    ? `${payment.invoice.assignment.household.firstName} ${payment.invoice.assignment.household.lastName}`
                    : "Sans beneficiaire";

                return [
                  formatDate(payment.paidAt),
                  <div key={`${payment.id}-invoice`}>
                    <p className="font-semibold">{payment.invoice?.invoiceNo || "-"}</p>
                    <p className="text-xs text-[color:var(--foreground-muted)]">{payment.paymentNo}</p>
                  </div>,
                  beneficiary,
                  formatCurrency(decimalToNumber(payment.amount)),
                  payment.paymentMode?.label || "-",
                  <div key={`${payment.id}-reference`}>
                    <p className="font-semibold">{payment.paymentNo}</p>
                    <p className="text-xs text-[color:var(--foreground-muted)]">{payment.receipt?.receiptNo || "Recu en attente"}</p>
                  </div>,
                  payment.installment?.label || "Libre",
                  payment.receipt ? (
                    <Link href={`/recus/${payment.receipt.id}`} className="rounded-full bg-[color:var(--brand-green)] px-3 py-2 text-xs font-semibold text-white">
                      Recu
                    </Link>
                  ) : (
                    "-"
                  ),
                ];
              })}
            />
          ) : (
            <div className="rounded-md border border-dashed border-[color:var(--stroke)] bg-[color:var(--surface-2)] px-5 py-8 text-center text-sm text-[color:var(--foreground-muted)]">
              Aucun paiement ne correspond aux filtres selectionnes.
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
