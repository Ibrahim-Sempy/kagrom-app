import { createUserAction, updatePasswordAction } from "@/app/actions";
import { DataTable, Field, PageHeader, Panel, SelectField, SubmitButton } from "@/components/ui";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Role } from "@prisma/client";

export default async function SecurityPage() {
  await requireRole([Role.ADMIN]);
  const [users, currentUser] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "desc" } }),
    getCurrentUser(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Configuration"
        title="Utilisateurs & Roles"
        description="Gestion securisee des comptes, des roles et du mot de passe."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Creer un utilisateur" description="Provisionnez les acces internes selon les responsabilites.">
          <form action={createUserAction} className="grid gap-4 md:grid-cols-2">
            <Field label="Nom complet" name="name" required />
            <Field label="Telephone" name="phone" />
            <Field label="Email" name="email" type="email" required />
            <Field label="Mot de passe initial" name="password" type="password" required />
            <div className="md:col-span-2">
              <SelectField
                label="Role"
                name="role"
                required
                options={[
                  { value: "ADMIN", label: "Administrateur" },
                  { value: "MANAGER", label: "Gestionnaire" },
                  { value: "ACCOUNTANT", label: "Comptable" },
                  { value: "TRAINER", label: "Formateur" },
                  { value: "HR", label: "RH" },
                ]}
              />
            </div>
            <div className="md:col-span-2">
              <SubmitButton label="Creer le compte" />
            </div>
          </form>
        </Panel>

        <Panel title="Changer mon mot de passe" description={`Compte connecte : ${currentUser?.name ?? ""}`}>
          <form action={updatePasswordAction} className="space-y-4">
            <Field label="Nouveau mot de passe" name="password" type="password" required />
            <SubmitButton label="Mettre a jour" />
          </form>
        </Panel>
      </div>

      <Panel title="Comptes actifs" description="Chaque utilisateur voit uniquement les modules autorises par son role.">
        <DataTable
          headers={["Utilisateur", "Role", "Telephone", "Creation", "Statut"]}
          rows={users.map((user) => [
            <div key="user">
              <p className="font-semibold">{user.name}</p>
              <p className="text-xs text-[color:var(--foreground-muted)]">{user.email}</p>
            </div>,
            user.role,
            user.phone || "-",
            formatDate(user.createdAt),
            user.mustChangePass ? "Doit changer son mot de passe" : "Actif",
          ])}
        />
      </Panel>
    </div>
  );
}
