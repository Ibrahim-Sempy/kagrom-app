"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function DocumentSelect({
  options,
}: {
  options: { value: string; label: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentValue = searchParams.get("enrollmentId") || options[0]?.value || "";

  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-[color:var(--foreground)]">Rechercher un apprenant</span>
      <select
        value={currentValue}
        onChange={(e) => {
          router.push(`?enrollmentId=${e.target.value}`);
        }}
        className="h-12 w-full rounded-md border border-[color:var(--stroke)] bg-[color:var(--surface-2)] px-4 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--brand-gold)] focus:bg-white"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
