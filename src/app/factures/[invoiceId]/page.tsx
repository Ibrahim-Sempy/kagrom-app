import { notFound } from "next/navigation";
import { Brand } from "@/components/brand";
import { prisma } from "@/lib/prisma";
import { decimalToNumber, formatCurrency, formatDate } from "@/lib/utils";
import { PrintDownloadButtons } from "@/components/PrintDownloadButtons";

export default async function InvoicePrintPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      payments: true,
      enrollment: {
        include: {
          learner: true,
          enrollmentModules: { include: { trainingModule: true } },
        }
      },
      mission: true,
      issuedBy: true,
    },
  });

  if (!invoice) {
    notFound();
  }

  const amount = decimalToNumber(invoice.amount);
  const paid = invoice.payments.reduce((sum, p) => sum + decimalToNumber(p.amount), 0);
  const due = amount - paid;

  return (
    <main className="min-h-screen bg-[#f1ead8] p-6 print:bg-white print:p-0 flex flex-col items-center">
      <PrintDownloadButtons filename={`Facture_KAGROM_${invoice.invoiceNo}.pdf`} />
      <div className="mt-8 mx-auto w-full max-w-3xl rounded-[36px] border border-[color:var(--stroke)] bg-white p-8 shadow-[0_24px_80px_rgba(34,48,38,0.12)] print:shadow-none print:border-none print:rounded-none print:mt-0">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <Brand compact />
          <div className="text-right text-sm text-[color:var(--foreground-muted)]">
            <p className="font-bold text-[#112240] text-lg">KAGROM SARLU</p>
            <p>RCCM: GN.TCC.2025.18254</p>
            <p>T6, Conakry, Guinée</p>
            <p>Tel: +224 612 50 36 48</p>
          </div>
        </div>

        {/* Title & Status */}
        <div className="mt-8 rounded-[28px] bg-[#c49b38] px-6 py-6 text-white flex justify-between items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-white/80">Facture</p>
            <h1 className="mt-2 font-display text-4xl font-bold">{invoice.invoiceNo}</h1>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold opacity-90 uppercase">{invoice.status}</p>
            <p className="mt-1 text-xs">Émise le {formatDate(invoice.createdAt)}</p>
          </div>
        </div>

        {/* Client & Info */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] bg-[color:var(--surface-2)] p-5">
            <p className="text-sm text-[color:var(--foreground-muted)]">Facturé à</p>
            <p className="mt-2 text-xl font-semibold">{invoice.clientName}</p>
            {invoice.enrollment && (
              <p className="text-sm mt-1 text-[color:var(--foreground-muted)]">
                Apprenant (Matricule: {invoice.enrollment.matricule})
              </p>
            )}
            {invoice.mission && (
              <p className="text-sm mt-1 text-[color:var(--foreground-muted)]">
                Client Prestation (Mission: {invoice.mission.missionNo})
              </p>
            )}
          </div>
          
          <div className="rounded-[24px] bg-[color:var(--surface-2)] p-5">
            <p className="text-sm text-[color:var(--foreground-muted)]">Date d'échéance</p>
            <p className="mt-2 text-xl font-semibold">{formatDate(invoice.dueDate)}</p>
          </div>
        </div>

        {/* Description */}
        <div className="mt-4 rounded-[24px] bg-[color:var(--surface-2)] p-5">
          <p className="text-sm text-[color:var(--foreground-muted)]">Description</p>
          <p className="mt-2 text-lg font-medium">{invoice.description}</p>
        </div>

        {/* Summary */}
        <div className="mt-8 border-t border-[color:var(--stroke)] pt-8">
          <div className="flex justify-between py-2 text-lg">
            <span className="text-[color:var(--foreground-muted)]">Montant Total</span>
            <span className="font-semibold">{formatCurrency(amount)}</span>
          </div>
          <div className="flex justify-between py-2 text-lg">
            <span className="text-[color:var(--foreground-muted)]">Montant Payé</span>
            <span className="font-semibold text-green-700">{formatCurrency(paid)}</span>
          </div>
          <div className="flex justify-between py-4 mt-2 text-2xl border-t border-[color:var(--stroke)]">
            <span className="font-bold text-[#112240]">Reste à Payer</span>
            <span className="font-bold text-[#a41034]">{formatCurrency(due)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-xs text-[color:var(--foreground-muted)]">
          <p>Merci de votre confiance. Pour tout règlement, veuillez préciser le numéro de facture.</p>
          <p className="mt-1">Généré par {invoice.issuedBy.name}</p>
        </div>

      </div>
    </main>
  );
}
