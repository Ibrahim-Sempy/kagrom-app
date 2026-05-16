import { createCashEntryAction } from "@/app/actions";
import { DataTable, Field, PageHeader, Panel, SelectField, SubmitButton, TextArea } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decimalToNumber, formatCurrency, formatDate } from "@/lib/utils";
import { Role } from "@prisma/client";

export default async function CashPage() {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.ACCOUNTANT]);

  const entries = await prisma.cashEntry.findMany({ orderBy: { date: "desc" } });
  const totals = entries.reduce(
    (acc, item) => {
      const amount = decimalToNumber(item.amount);
      if (item.type === "INCOME") acc.income += amount;
      else acc.expense += amount;
      return acc;
    },
    { income: 0, expense: 0 },
  );

  return (
    <div className="space-y-6">
      {/* <PageHeader
        eyebrow="Formation"
        title="Gestion Caisse"
        description="Suivi des operations de caisse, recettes, depenses, solde et justification."
      /> */}

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Panel title="Nouvelle Operation" description="Saisie manuelle d'une recette ou d'une depense de caisse.">
          <form action={createCashEntryAction} className="grid gap-4">
            <Field label="Date" name="date" type="date" required />
            <Field label="Libelle" name="label" required />
            <SelectField
              label="Type"
              name="type"
              required
              options={[
                { value: "INCOME", label: "Recette" },
                { value: "EXPENSE", label: "Depense" },
              ]}
            />
            <Field label="Montant (GNF)" name="amount" type="number" required />
            <TextArea label="Justification" name="justification" />
            <SubmitButton label="Enregistrer" />
          </form>
        </Panel>

        <div className="space-y-6">
          <Panel title="Operations de Caisse" description="Historique des mouvements financiers et impact sur le solde.">
            <DataTable
              headers={["Date", "Libelle", "Type", "Montant", "Justification"]}
              rows={entries.map((entry) => [
                formatDate(entry.date),
                entry.label,
                entry.type === "INCOME" ? "Recette" : "Depense",
                formatCurrency(decimalToNumber(entry.amount)),
                entry.justification || "-",
              ])}
            />
          </Panel>

          <Panel title="Rapport et Statistiques" description="Vue simplifiee des recettes, depenses et solde actuel.">
            <div className="space-y-3 text-lg">
              <p className="flex justify-between"><span>Total Recettes</span><strong className="text-green-600">{formatCurrency(totals.income)}</strong></p>
              <p className="flex justify-between"><span>Total Depenses</span><strong className="text-red-500">{formatCurrency(totals.expense)}</strong></p>
              <p className="flex justify-between border-t border-[color:var(--stroke)] pt-3"><span>Solde</span><strong className="text-blue-600">{formatCurrency(totals.income - totals.expense)}</strong></p>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
