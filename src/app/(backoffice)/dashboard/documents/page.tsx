import Link from "next/link";
import { redirect } from "next/navigation";
import { createEnrollmentInvoiceAction } from "@/app/actions";
import { DataTable, PageHeader, Panel, SelectField, SubmitButton } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Role } from "@prisma/client";

export default async function DocumentsPage() {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.ACCOUNTANT, Role.TRAINER]);

  const [enrollments, documents] = await Promise.all([
    prisma.enrollment.findMany({
      orderBy: { registrationDate: "desc" },
      include: { learner: true, trainingModule: true, certificate: true, invoices: true },
    }),
    prisma.document.findMany({
      orderBy: { createdAt: "desc" },
      include: { enrollment: { include: { learner: true } }, invoice: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Documents"
        title="Gestion des Documents"
        description="Acces centralise aux factures, recus, certificats, badges et releves de notes."
      />

      <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
        <Panel title="Selectionner un Apprenant" description="Generez directement les documents utiles a partir d'un dossier apprenant.">
          <SelectField
            label="Rechercher un apprenant"
            name="enrollment"
            options={enrollments.map((enrollment) => ({
              value: enrollment.id,
              label: `${enrollment.matricule} - ${enrollment.learner.firstName} ${enrollment.learner.lastName}`,
            }))}
          />

          {enrollments[0] ? (
            <div className="mt-6 rounded-[24px] bg-[#b8e7f2] p-5 text-[#0b3850]">
              <p><strong>Matricule:</strong> {enrollments[0].matricule}</p>
              <p><strong>Nom:</strong> {enrollments[0].learner.firstName} {enrollments[0].learner.lastName}</p>
              <p><strong>Module:</strong> {enrollments[0].trainingModule?.name || "-"}</p>
            </div>
          ) : null}

          {enrollments[0] ? (
            <div className="mt-5 space-y-3">
              <Link href={`/certificats/${enrollments[0].certificate?.id ?? ""}`} className="flex justify-center rounded-2xl bg-[#4f46e5] px-4 py-3 text-sm font-semibold text-white">
                Generer Certificat
              </Link>
              <Link href={`/badges/${enrollments[0].id}`} className="flex justify-center rounded-2xl bg-[#4f46e5] px-4 py-3 text-sm font-semibold text-white">
                Generer Badge
              </Link>
              <Link href={`/releves/${enrollments[0].id}`} className="flex justify-center rounded-2xl bg-[#4f46e5] px-4 py-3 text-sm font-semibold text-white">
                Generer Relevé de Notes
              </Link>
              
              {enrollments[0].invoices?.length > 0 ? (
                <Link href={`/factures/${enrollments[0].invoices[0].id}`} className="flex justify-center rounded-2xl bg-[#c49b38] px-4 py-3 text-sm font-semibold text-white">
                  Voir Facture
                </Link>
              ) : (
                <form action={async () => {
                  "use server";
                  const invoiceId = await createEnrollmentInvoiceAction(enrollments[0].id);
                  redirect(`/factures/${invoiceId}`);
                }}>
                  <button type="submit" className="w-full flex justify-center rounded-2xl bg-[#c49b38] px-4 py-3 text-sm font-semibold text-white hover:bg-[#a6802b]">
                    Generer Facture
                  </button>
                </form>
              )}
            </div>
          ) : null}
        </Panel>

        <Panel title="Historique des Documents" description="Trace des documents deja generes dans l'application.">
          <DataTable
            headers={["Date", "Apprenant", "Type", "Statut", "Actions"]}
            rows={documents.map((document) => [
              formatDate(document.createdAt),
              document.enrollment ? `${document.enrollment.learner.firstName} ${document.enrollment.learner.lastName}` : document.invoice?.clientName || "-",
              document.type,
              document.status,
              <span key="action" className="text-xs text-[color:var(--foreground-muted)]">Archive</span>,
            ])}
          />
        </Panel>
      </div>
    </div>
  );
}
