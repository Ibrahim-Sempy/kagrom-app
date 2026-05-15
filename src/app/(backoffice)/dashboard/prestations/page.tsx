import { PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { PrestationsClientManager } from "./ClientManager";
import { serializeData } from "@/lib/utils";

export default async function ServicesPage() {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.HR]);

  const learners = await prisma.learner.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      {/* <PageHeader
        eyebrow="Prestations de services"
        title="Prestataires, missions et suivi terrain"
        description="Pilotez les métiers de services KAGROM avec affectation des agents, suivi des missions et impression des fiches d'inscription."
      /> */}

      <PrestationsClientManager
        providers={[]}
        missions={[]}
        learners={serializeData(learners)}
      />
    </div>
  );
}
