import Link from "next/link";
import { DataTable, PageHeader, Panel } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decimalToNumber, formatDate } from "@/lib/utils";
import { Role } from "@prisma/client";

export default async function CertificatesPage() {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.TRAINER]);

  const certificates = await prisma.certificate.findMany({
    orderBy: { issuedAt: "desc" },
    include: {
      enrollment: {
        include: {
          learner: true,
          trainingSession: {
            include: { training: true },
          },
          enrollmentModules: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Certificats et verification"
        title="Authenticite, QR Code et impression"
        description="Tous les certificats valides sont accessibles ici avec verification publique et impression au format KAGROM."
      />

      <Panel title="Registre des certificats" description="Emission automatique apres validation des resultats.">
        <DataTable
          headers={["Certificat", "Apprenant", "Formation", "Resultat", "Actions"]}
          rows={certificates.map((certificate) => {
            const modules = certificate.enrollment.enrollmentModules || [];
            const totalScore = modules.reduce((sum, m) => sum + (m.averageScore ? Number(m.averageScore) : 0), 0);
            const formattedScore = modules.length > 0 ? totalScore / modules.length : 12;
            
            return [
              <div key="certificate">
                <p className="font-semibold">{certificate.certificateNo}</p>
                <p className="text-xs text-[color:var(--foreground-muted)]">{formatDate(certificate.issuedAt)}</p>
              </div>,
              <div key="learner">
                <p>
                  {certificate.enrollment.learner.firstName} {certificate.enrollment.learner.lastName}
                </p>
                <p className="text-xs text-[color:var(--foreground-muted)]">{certificate.enrollment.matricule}</p>
              </div>,
              <div key="training">
                <p>{certificate.enrollment.trainingSession.training.title}</p>
                <p className="text-xs text-[color:var(--foreground-muted)]">{certificate.enrollment.trainingSession.name}</p>
              </div>,
              `${formattedScore.toFixed(2)} / 20`,
              <div key="actions" className="flex flex-wrap gap-2">
                <Link href={`/certificats/${certificate.id}`} className="rounded-md bg-[color:var(--brand-green)] px-3 py-2 text-xs font-semibold text-white">
                  Imprimer
                </Link>
                <Link
                  href={`/api/certificates/verify/${certificate.verificationCode}`}
                  className="rounded-md border border-[color:var(--stroke)] px-3 py-2 text-xs font-semibold"
                >
                  Verifier
                </Link>
              </div>,
            ];
          })}
        />
      </Panel>
    </div>
  );
}
