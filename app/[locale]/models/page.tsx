import { pageAlternates } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import ModelCard from "@/components/ModelCard";
import { getDictionary } from "@/lib/dictionaries";
import { resolveLocale } from "@/lib/i18n";
import { getModelsByModality, modalityOrder, type Modality } from "@/lib/models";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ m?: string | string[] }>;
};

export async function generateMetadata({
  params, searchParams,
}: PageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const active = readModality((await searchParams).m);
  const d = getDictionary(resolveLocale(raw));
  return {
    alternates: pageAlternates(resolveLocale(raw), `/models${active === "all" ? "" : `?m=${active}`}`),
    title: d.modelsPage.title,
    description: d.modelsPage.desc,
  };
}

function readModality(value: string | string[] | undefined): Modality | "all" {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate) return "all";
  return modalityOrder.includes(candidate as Modality)
    ? (candidate as Modality)
    : "all";
}

export default async function ModelsPage({ params, searchParams }: PageProps) {
  const { locale: raw } = await params;
  const locale = resolveLocale(raw);
  const d = getDictionary(locale);
  const query = await searchParams;
  const active = readModality(query.m);
  const list = getModelsByModality(active);

  const filters: { key: Modality | "all"; label: string }[] = [
    { key: "all", label: d.modelsPage.filterAll },
    ...modalityOrder.map((modality) => ({
      key: modality,
      label: d.modality[modality],
    })),
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="text-[28px] font-semibold tracking-tight">
        {d.modelsPage.title}
      </h1>
      <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-muted">
        {d.modelsPage.desc}
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-2 border-y border-line py-4">
        <span className="mr-1 text-[11.5px] uppercase tracking-wider text-dim">
          {d.modelsPage.filterLabel}
        </span>
        {filters.map((filter) => {
          const isActive = filter.key === active;
          const href =
            filter.key === "all"
              ? `/${locale}/models`
              : `/${locale}/models?m=${filter.key}`;
          return (
            <Link
              key={filter.key}
              href={href}
              className={`rounded-full border px-3 py-1 text-[12.5px] transition-colors ${
                isActive
                  ? "border-accent/50 bg-accent/12 text-ink"
                  : "border-line text-muted hover:border-line2 hover:text-ink"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
        <span className="ml-auto font-mono text-[11.5px] text-dim">
          {list.length} {d.modelsPage.total}
        </span>
      </div>

      {list.length === 0 ? (
        <p className="py-20 text-center text-[13px] text-dim">
          {d.modelsPage.empty}
        </p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((model) => (
            <ModelCard key={model.slug} model={model} locale={locale} d={d} />
          ))}
        </div>
      )}
    </div>
  );
}
