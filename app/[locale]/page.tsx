import Link from "next/link";
import ModelCard from "@/components/ModelCard";
import { getDictionary } from "@/lib/dictionaries";
import { resolveLocale } from "@/lib/i18n";
import { models } from "@/lib/models";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: PageProps) {
  const { locale: raw } = await params;
  const locale = resolveLocale(raw);
  const d = getDictionary(locale);
  const featured = models.slice(0, 3);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
        <div className="pointer-events-none absolute -top-52 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-accent/20 blur-[130px]" />
        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-20 sm:pt-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-panel/60 px-3 py-1 text-[12px] text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-mint" />
            {d.home.badge}
          </div>

          <h1 className="mt-6 max-w-3xl text-[34px] font-semibold leading-[1.15] tracking-tight sm:text-[52px]">
            <span className="block">{d.home.titleA}</span>
            <span className="text-gradient block">{d.home.titleB}</span>
          </h1>

          <p className="mt-6 max-w-2xl text-[14.5px] leading-relaxed text-muted">
            {d.home.desc}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/${locale}/models`}
              className="rounded-lg bg-accent px-5 py-2.5 text-[13.5px] font-medium text-[#080b13] transition-opacity hover:opacity-90"
            >
              {d.home.ctaPrimary}
            </Link>
            <Link
              href={`/${locale}/tools/image`}
              className="rounded-lg border border-line px-5 py-2.5 text-[13.5px] text-ink transition-colors hover:border-line2 hover:bg-panel2/50"
            >
              {d.home.ctaSecondary}
            </Link>
          </div>

          <dl className="mt-14 grid max-w-2xl grid-cols-3 gap-4 border-t border-line pt-8">
            {d.home.stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-[11.5px] text-dim">{stat.label}</dt>
                <dd className="mt-1 font-mono text-[19px] tracking-tight text-ink">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[22px] font-semibold tracking-tight">
              {d.home.modelsTitle}
            </h2>
            <p className="mt-2 max-w-lg text-[13.5px] leading-relaxed text-muted">
              {d.home.modelsDesc}
            </p>
          </div>
          <Link
            href={`/${locale}/models`}
            className="text-[13px] text-accent transition-opacity hover:opacity-80"
          >
            {d.home.viewAll} →
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((model) => (
            <ModelCard key={model.slug} model={model} locale={locale} d={d} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8">
        <h2 className="text-[22px] font-semibold tracking-tight">
          {d.home.featuresTitle}
        </h2>
        <div className="mt-8 grid gap-8 border-t border-line pt-8 sm:grid-cols-3">
          {d.home.features.map((feature, index) => (
            <div key={feature.title}>
              <div className="font-mono text-[12px] text-accent">
                0{index + 1}
              </div>
              <h3 className="mt-3 text-[15px] font-medium">{feature.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="panel relative overflow-hidden p-8 sm:p-12">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-mint/10 blur-[80px]" />
          <h2 className="relative max-w-xl text-[26px] font-semibold tracking-tight">
            {d.home.ctaTitle}
          </h2>
          <p className="relative mt-3 max-w-xl text-[13.5px] leading-relaxed text-muted">
            {d.home.ctaDesc}
          </p>
          <Link
            href={`/${locale}/tools/image`}
            className="relative mt-6 inline-block rounded-lg bg-accent px-5 py-2.5 text-[13.5px] font-medium text-[#080b13] transition-opacity hover:opacity-90"
          >
            {d.home.ctaButton}
          </Link>
        </div>
      </section>
    </div>
  );
}
