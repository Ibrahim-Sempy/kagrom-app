"use client";

import type { FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Field, SelectField } from "@/components/ui";

type ToolbarField = {
  name: string;
  label: string;
  type?: "text" | "date";
  defaultValue: string;
  options?: Array<{ value: string; label: string }>;
};

function getVisiblePages(totalPages: number, currentPage: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  const normalizedStart = Math.max(1, end - 4);

  return Array.from({ length: end - normalizedStart + 1 }, (_, index) => normalizedStart + index);
}

export function NotesToolbar({
  scope,
  activeTab,
  fields,
  page,
  pageSize,
  totalPages,
  totalItems,
  currentCount,
}: {
  scope: "learner" | "employee";
  activeTab: "learners" | "employees";
  fields: ToolbarField[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  currentCount: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = `${scope}Page`;
  const pageSizeParam = `${scope}PageSize`;

  const navigateWithParams = (params: URLSearchParams) => {
    params.set("tab", activeTab);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const handleFilterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams(searchParams.toString());

    for (const field of fields) {
      const value = formData.get(field.name)?.toString() ?? "";

      if (value) {
        params.set(field.name, value);
      } else {
        params.delete(field.name);
      }
    }

    params.set(pageParam, "1");
    navigateWithParams(params);
  };

  const handleReset = () => {
    const params = new URLSearchParams(searchParams.toString());

    for (const field of fields) {
      params.delete(field.name);
    }

    params.set(pageParam, "1");
    navigateWithParams(params);
  };

  const handlePageChange = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(pageParam, String(nextPage));
    navigateWithParams(params);
  };

  const handlePageSizeChange = (nextPageSize: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(pageSizeParam, nextPageSize);
    params.set(pageParam, "1");
    navigateWithParams(params);
  };

  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = totalItems === 0 ? 0 : from + currentCount - 1;
  const visiblePages = getVisiblePages(totalPages, page);

  return (
    <div className="space-y-5">
      <form onSubmit={handleFilterSubmit} className={`grid gap-4 ${fields.length > 2 ? "xl:grid-cols-4" : "xl:grid-cols-3"} md:grid-cols-2`}>
        {fields.map((field) =>
          field.options ? (
            <SelectField
              key={field.name}
              label={field.label}
              name={field.name}
              defaultValue={field.defaultValue}
              options={field.options}
            />
          ) : (
            <Field
              key={field.name}
              label={field.label}
              name={field.name}
              type={field.type || "text"}
              defaultValue={field.defaultValue}
            />
          ),
        )}

        <div className="flex items-end gap-3">
          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center rounded-md bg-[color:var(--brand-green)] px-5 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-green-strong)]"
          >
            Appliquer
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex h-12 items-center justify-center rounded-md border border-[color:var(--stroke)] px-5 text-sm font-semibold text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-2)]"
          >
            Reinitialiser
          </button>
        </div>
      </form>

      <div className="flex flex-col gap-4 border-t border-[color:var(--stroke)] pt-4 xl:flex-row xl:items-center xl:justify-between">
        <p className="text-sm text-[color:var(--foreground-muted)]">
          {totalItems} resultat{totalItems > 1 ? "s" : ""} - affichage {from}-{to}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2 text-sm text-[color:var(--foreground-muted)]">
            <span>Lignes</span>
            <select
              value={String(pageSize)}
              onChange={(event) => handlePageSizeChange(event.target.value)}
              className="h-10 rounded-md border border-[color:var(--stroke)] bg-white px-3 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--brand-gold)]"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(Math.max(page - 1, 1))}
              disabled={page <= 1}
              className="inline-flex h-10 items-center justify-center rounded-md border border-[color:var(--stroke)] px-4 text-sm font-medium text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-2)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Prec
            </button>

            {visiblePages.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => handlePageChange(pageNumber)}
                className={`inline-flex h-10 min-w-10 items-center justify-center rounded-md border px-3 text-sm font-medium transition ${
                  pageNumber === page
                    ? "border-[color:var(--brand-green)] bg-[color:var(--brand-green)] text-white"
                    : "border-[color:var(--stroke)] text-[color:var(--foreground)] hover:bg-[color:var(--surface-2)]"
                }`}
              >
                {pageNumber}
              </button>
            ))}

            <button
              type="button"
              onClick={() => handlePageChange(Math.min(page + 1, totalPages))}
              disabled={page >= totalPages}
              className="inline-flex h-10 items-center justify-center rounded-md border border-[color:var(--stroke)] px-4 text-sm font-medium text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-2)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Suiv
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
