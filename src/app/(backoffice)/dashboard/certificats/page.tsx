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
          Session: true,
          notes: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      {/* <PageHeader
        eyebrow="Certificats et verification"
        title="Authenticite, QR Code et impression"
        description="Tous les certificats valides sont accessibles ici avec verification publique et impression au format KAGROM."
      /> */}

      <Panel title="Registre des certificats" description="Emission automatique apres validation des resultats.">
        <DataTable
          headers={["Certificat", "Apprenant", "Session", "Score Moyen", "Actions"]}
          rows={certificates.map((certificate) => {
            const notes = certificate.enrollment.notes || [];
            const averageScore = notes.length > 0
              ? notes.reduce((sum, n) => sum + (Number(n.scoreTheory) + Number(n.scorePractical)) / 2, 0) / notes.length
              : 0;

            return [
              <div key="certificate">
                <p className="font-semibold">{certificate.certificateNo}</p>
                <p className="text-xs text-[color:var(--foreground-muted)]">{formatDate(certificate.issuedAt)}</p>
              </div>,
              <div key="learner">
                <p>
                  {certificate.enrollment.learner.firstName} {certificate.enrollment.learner.lastName}
                </p>
                <p className="text-xs text-[color:var(--foreground-muted)]">{certificate.enrollment.learner.registrationNo}</p>
              </div>,
              // <div key="session">
              //   <p>{certificate.enrollment.Session?.label || "Session"}</p>
              //   <p className="text-xs text-[color:var(--foreground-muted)]">{formatDate(certificate.enrollment.Session?.startDate)}</p>
              // </div>,
              `${averageScore.toFixed(2)} / 20`,
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
