import Link from "next/link";
import { createLearnerAction } from "@/app/actions";
import { LearnerActions } from "./ClientModals";
import { serializeData } from "@/lib/utils";
import { DataTable, Field, PageHeader, Panel, SelectField, SubmitButton } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Role } from "@prisma/client";

export const revalidate = 0;
export default async function LearnersPage({ searchParams }: { searchParams: Promise<{ page?: string }>; }) {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.TRAINER, Role.HR]);

  const page = parseInt((await searchParams).page || "1") || 1;
  const limit = 2;

  const learners = await prisma.learner.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      enrollments: {
        include: {
          Session: {
          },
        },
      },
    },
  });

  console.log("Learners with enrollments:", JSON.stringify(learners, null, 2));
  
  const totalLearners = await prisma.learner.count();
  const totalPages = Math.ceil(totalLearners / limit);
  const modules = await prisma.trainingModule.findMany({ orderBy: { name: "asc" } });


  return (
    <div className="space-y-6">

      <div className="grid gap-6">
        
        <Panel
          title="Liste des apprenants"
          actions={
            <Link
              href="/dashboard/inscriptions"
              className="inline-flex items-center gap-2 rounded bg-[color:var(--brand-green)] px-4 py-2 text-sm font-semibold text-white"
            >
              <i className="bi bi-plus-lg"></i>
              Nouvel apprenant
            </Link>
          }
        >
          
          <div className="width-100 border-b border-[color:var(--stroke)] mb-4 pb-2 text-medium font-bold text-[color:var(--foreground)] md:col-span-4">
          </div>
          {/* champ de recherche */}
          <div className="mb-4 grid gap-4 md:grid-cols-4">
            <Field label="Matricule" name="matricule" required />
            <Field label="Prenom" name="firstName" required />
            <SelectField label="Module" name="module" options={modules.map((m) => ({ value: m.id, label: m.name }))} />
            <SelectField label="Statut" name="status" options={[{ value: "Actif", label: "Actif" },{value: "Completed", label: "Complète" }, { value: "Inactif", label: "Inactif" }]} />
          </div>
          <DataTable
            headers={["Matricule", "Nom", "Telephone", "Statut", "Derniere session", "Badge", "Actions"]}
            rows={learners.map((learner) => {
              const latestEnrollment = learner.enrollments[0];

              return [
                <span key="reg" className="font-semibold">
                  {learner.registrationNo}
                </span>,
                <div key="name">
                  <p className="font-semibold">
                    {learner.firstName} {learner.lastName}
                  </p>
                  <p className="text-xs text-[color:var(--foreground-muted)]">{learner.email || "Sans email"}</p>
                </div>,
                learner.phone,
                learner.status,
                latestEnrollment ? (
                  <div key="session">
                    <p>{latestEnrollment.Session.label}</p>
                    <p className="text-xs text-[color:var(--foreground-muted)]">{formatDate(latestEnrollment.createdAt)}</p>
                  </div>
                ) : (
                  "Aucune inscription"
                ),
                latestEnrollment ? (
                  <Link
                    key="badge"
                    href={`/badges/${latestEnrollment.id}`}
                    className="inline-flex rounded-full bg-[color:var(--brand-green)] px-4 py-2 text-xs font-semibold text-white"
                  >
                    Imprimer
                  </Link>
                ) : (
                  "-"
                ),
                <LearnerActions key="actions" learner={serializeData(learner)} />,
              ];
            })}
          />
          <div className="flex items-center justify-end gap-2 mt-6">
  
            <Link
              href={`?page=${Math.max(page - 1, 1)}`}
              className="px-3 py-1 border rounded"
            >
              Prev
            </Link>

            <div className="hidden sm:flex gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Link
                  key={i}
                  href={`?page=${i + 1}`}
                  className={`px-3 py-1 border rounded ${
                    i + 1 === page ? "bg-[color:var(--brand-green)] text-white" : ""
                  }`}
                >
                  {i + 1}
                </Link>
              ))}
            </div>

            <Link
              href={`?page=${Math.min(page + 1, totalPages)}`}
              className="px-3 py-1 border rounded"
            >
              Next
            </Link>

          </div>
        </Panel>
      </div>
    </div>
  );
}
