import type { Metadata } from "next";
import Link from "next/link";
import CodeBlock from "@/components/CodeBlock";
import { getDictionary } from "@/lib/dictionaries";
import { formatLatency, money, unitLabel } from "@/lib/format";
import { resolveLocale } from "@/lib/i18n";
import { getModel, getSampleCode, models, type ModelSpec } from "@/lib/models";
import { pageAlternates } from "@/lib/site";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return models.map(({ slug }) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = resolveLocale(raw);
  const model = getModel(slug);
  if (!model) return {};

  const d = getDictionary(locale);
  const title = `${model.name} · ${d.modality[model.modality]}`;
  return {
    title,
    description: model.summary[locale],
    alternates: pageAlternates(locale, `/models/${slug}`),
    openGraph: {
      title,
      description: model.summary[locale],
      type: "article",
    },
  };
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line/70 py-2.5 last:border-0">
      <dt className="text-[12.5px] text-dim">{label}</dt>
      <dd className="font-mono text-[12.5px] text-ink">{value}</dd>
    </div>
  );
}

export default async function ModelDetailPage({ params }: PageProps) {
  const { locale: raw, slug } = await params;
  const locale = resolveLocale(raw);
  const d = getDictionary(locale);
  const model = getModel(slug) as ModelSpec;
  const unit = unitLabel(model.pricing.unit, d.modelDetail);
  const related = models
    .filter((item) => item.modality === model.modality && item.slug !== model.slug)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <Link
        href={`/${locale}/models`}
        className="text-[12.5px] text-dim transition-colors hover:text-ink"
      >
        ← {d.modelDetail.back}
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[30px] font-semibold tracking-tight">
              {model.name}
            </h1>
            {model.flagship && (
              <span className="rounded border border-mint/30 bg-mint/10 px-2 py-0.5 text-[10.5px] uppercase tracking-wide text-mint">
                {d.modelDetail.flagship}
              </span>
            )}
          </div>
          <p className="mt-1.5 text-[13px] text-dim">
            {model.vendor} · {d.modality[model.modality]}
          </p>
        </div>
        <Link
          href={`/${locale}/console`}
          className="rounded-lg border border-line px-4 py-2 text-[12.5px] text-ink transition-colors hover:border-line2 hover:bg-panel2/50"
        >
          {d.modelDetail.cta}
        </Link>
      </div>

      <p className="mt-6 max-w-3xl text-[14px] leading-relaxed text-muted">
        {model.summary[locale]}
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <h2 className="text-[12px] font-medium uppercase tracking-wider text-dim">
            {d.modelDetail.highlights}
          </h2>
          <ul className="mt-4 space-y-3">
            {model.highlights[locale].map((item) => (
              <li key={item} className="flex gap-3 text-[13.5px] text-muted">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-mint" />
                {item}
              </li>
            ))}
          </ul>

          <h2 className="mt-10 text-[12px] font-medium uppercase tracking-wider text-dim">
            {d.modelDetail.sample}
          </h2>
          <div className="mt-4">
            <CodeBlock
              code={getSampleCode(model)}
              copyLabel={d.modelDetail.copy}
              copiedLabel={d.modelDetail.copied}
            />
          </div>
        </div>

        <aside className="space-y-4">
          <div className="panel p-5">
            <h2 className="text-[12px] font-medium uppercase tracking-wider text-dim">
              {d.modelDetail.pricing}
            </h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-[12.5px] text-muted">
                  {d.modelDetail.priceInput}
                </span>
                <span className="font-mono text-[16px] text-ink">
                  {money(model.pricing.input, d.modelDetail.priceFree)}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-[12.5px] text-muted">
                  {d.modelDetail.priceOutput}
                </span>
                <span className="font-mono text-[16px] text-ink">
                  {money(model.pricing.output, d.modelDetail.priceFree)}
                </span>
              </div>
            </div>
            <p className="mt-4 border-t border-line pt-3 text-[11.5px] text-dim">
              {unit}
            </p>
          </div>

          <div className="panel p-5">
            <h2 className="text-[12px] font-medium uppercase tracking-wider text-dim">
              {d.modelDetail.specs}
            </h2>
            <dl className="mt-3">
              <SpecRow
                label={d.modelDetail.specContext}
                value={`${model.contextK}K`}
              />
              <SpecRow
                label={d.modelDetail.specLatency}
                value={formatLatency(model.latencyMs)}
              />
              <SpecRow
                label={d.modelDetail.specThroughput}
                value={model.throughput}
              />
              <SpecRow
                label={d.modelDetail.specRelease}
                value={model.release}
              />
              <SpecRow
                label={d.modelDetail.specModality}
                value={d.modality[model.modality]}
              />
            </dl>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <div className="mt-16 border-t border-line pt-8">
          <h2 className="text-[12px] font-medium uppercase tracking-wider text-dim">
            {d.modelDetail.related}
          </h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/${locale}/models/${item.slug}`}
                className="rounded-lg border border-line px-4 py-3 transition-colors hover:border-line2 hover:bg-panel2/40"
              >
                <div className="text-[13.5px] text-ink">{item.name}</div>
                <div className="mt-1 line-clamp-1 text-[11.5px] text-dim">
                  {item.tagline[locale]}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
