"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type NotesTab = "learners" | "employees";

const TAB_LABELS: Record<NotesTab, string> = {
  learners: "Notes apprenants",
  employees: "Notes employes",
};

export function NotesTabs({ activeTab }: { activeTab: NotesTab }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTabChange = (tab: NotesTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <div className="flex flex-wrap gap-3">
      {(["learners", "employees"] as NotesTab[]).map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => handleTabChange(tab)}
          className={`inline-flex items-center rounded-md border px-4 py-3 text-sm font-semibold transition ${
            tab === activeTab
              ? "border-[color:var(--brand-green)] bg-[color:var(--brand-green)] text-white"
              : "border-[color:var(--stroke)] bg-white text-[color:var(--foreground)] hover:bg-[color:var(--surface-2)]"
          }`}
        >
          {TAB_LABELS[tab]}
        </button>
      ))}
    </div>
  );
}
