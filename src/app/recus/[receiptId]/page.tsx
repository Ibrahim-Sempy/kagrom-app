import { notFound } from "next/navigation";
import { Brand } from "@/components/brand";
import { prisma } from "@/lib/prisma";
import { decimalToNumber, formatCurrency, formatDate } from "@/lib/utils";
import { PrintDownloadButtons } from "@/components/PrintDownloadButtons";

export default async function ReceiptPrintPage({
  params,
}: {
  params: Promise<{ receiptId: string }>;
}) {
  const { receiptId } = await params;

  const receipt = await prisma.receipt.findUnique({
    where: { id: receiptId },
    include: {
      payment: {
        include: {
          invoice: true,
        },
      },
    },
  });

  if (!receipt) {
    notFound();
  }

  const invoice = receipt.payment.invoice;

  return (
    <main className="min-h-screen bg-[#f1ead8] p-6 print:bg-white flex flex-col items-center">
      <PrintDownloadButtons filename={`Recu_KAGROM_${receipt.receiptNo}.pdf`} />
      <div className="mt-8 mx-auto w-full max-w-3xl rounded-[36px] border border-[color:var(--stroke)] bg-white p-8 shadow-[0_24px_80px_rgba(34,48,38,0.12)] print:shadow-none print:mt-0">
        <Brand compact />
        <div className="mt-8 rounded-[28px] bg-[linear-gradient(145deg,rgba(79,127,61,0.98),rgba(57,91,44,0.98))] px-6 py-6 text-white">
          <p className="text-xs uppercase tracking-[0.24em] text-white/70">Recu de paiement</p>
          <h1 className="mt-3 font-display text-4xl font-bold">{receipt.receiptNo}</h1>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] bg-[color:var(--surface-2)] p-5">
            <p className="text-sm text-[color:var(--foreground-muted)]">Facture</p>
            <p className="mt-2 text-xl font-semibold">{invoice?.invoiceNo || "Paiement direct"}</p>
          </div>
          <div className="rounded-[24px] bg-[color:var(--surface-2)] p-5">
            <p className="text-sm text-[color:var(--foreground-muted)]">Client</p>
            <p className="mt-2 text-xl font-semibold">{invoice?.clientName || "Apprenant KAGROM"}</p>
          </div>
          <div className="rounded-[24px] bg-[color:var(--surface-2)] p-5">
            <p className="text-sm text-[color:var(--foreground-muted)]">Montant recu</p>
            <p className="mt-2 text-xl font-semibold">{formatCurrency(decimalToNumber(receipt.payment.amount))}</p>
          </div>
          <div className="rounded-[24px] bg-[color:var(--surface-2)] p-5">
            <p className="text-sm text-[color:var(--foreground-muted)]">Date de paiement</p>
            <p className="mt-2 text-xl font-semibold">{formatDate(receipt.payment.paidAt)}</p>
          </div>
          <div className="rounded-[24px] bg-[color:var(--surface-2)] p-5">
            <p className="text-sm text-[color:var(--foreground-muted)]">Mode</p>
            <p className="mt-2 text-xl font-semibold">{receipt.payment.method}</p>
          </div>
          <div className="rounded-[24px] bg-[color:var(--surface-2)] p-5">
            <p className="text-sm text-[color:var(--foreground-muted)]">Reference</p>
            <p className="mt-2 text-xl font-semibold">{receipt.payment.reference || "Sans reference"}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
