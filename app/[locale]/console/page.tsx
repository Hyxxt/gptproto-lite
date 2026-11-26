import { pageAlternates } from "@/lib/site";
import type { Metadata } from "next";
import KeyManager from "@/components/KeyManager";
import LogTable from "@/components/LogTable";
import ModelShareBars from "@/components/ModelShareBars";
import UsageChart from "@/components/UsageChart";
import { getDictionary } from "@/lib/dictionaries";
import { compactNumber, formatLogTime } from "@/lib/format";
import { resolveLocale } from "@/lib/i18n";
import { buildUsageSnapshot } from "@/lib/usage";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const d = getDictionary(resolveLocale(raw));
  return {
    alternates: pageAlternates(resolveLocale(raw), "/console"),
    title: d.consolePage.title,
    description: d.consolePage.desc,
    robots: { index: false, follow: false },
  };
}

function thousands(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default async function ConsolePage({ params }: PageProps) {
  const { locale: raw } = await params;
  const locale = resolveLocale(raw);
  const d = getDictionary(locale);
  const snapshot = buildUsageSnapshot();

  // 时间在服务端格式化好再交给客户端组件，避免时区不同造成 hydration 不一致
  const rows = snapshot.logs.map((log) => ({
    ...log,
    timeLabel: formatLogTime(log.at, locale),
  }));

  const kpis = [
    { label: d.consolePage.kpi.requests, value: thousands(snapshot.totals.requests) },
    { label: d.consolePage.kpi.tokens, value: compactNumber(snapshot.totals.tokens) },
    { label: d.consolePage.kpi.cost, value: `¥${thousands(snapshot.totals.cost)}` },
    { label: d.consolePage.kpi.success, value: `${snapshot.totals.successRate}%` },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="text-[28px] font-semibold tracking-tight">
        {d.consolePage.title}
      </h1>
      <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-muted">
        {d.consolePage.desc}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="panel p-4">
            <div className="text-[11.5px] text-dim">{kpi.label}</div>
            <div className="mt-2 font-mono text-[21px] tracking-tight text-ink">
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      <section className="panel mt-4 p-5">
        <div className="mb-4">
          <h2 className="text-[13.5px] font-medium">{d.consolePage.trendTitle}</h2>
          <p className="mt-1 text-[12px] text-dim">{d.consolePage.trendDesc}</p>
        </div>
        <UsageChart series={snapshot.series} label={d.consolePage.trendTitle} />
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="panel p-5">
          <div className="mb-5">
            <h2 className="text-[13.5px] font-medium">
              {d.consolePage.distTitle}
            </h2>
            <p className="mt-1 text-[12px] text-dim">
              {d.consolePage.distDesc}
            </p>
          </div>
          <ModelShareBars items={snapshot.byModel} />
        </section>

        <section className="panel p-5">
          <div className="mb-5">
            <h2 className="text-[13.5px] font-medium">
              {d.consolePage.keysTitle}
            </h2>
            <p className="mt-1 text-[12px] text-dim">{d.consolePage.keysDesc}</p>
          </div>
          <KeyManager t={d.consolePage} />
        </section>
      </div>

      <section className="panel mt-4 p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-[13.5px] font-medium">
              {d.consolePage.logsTitle}
            </h2>
            <p className="mt-1 text-[12px] text-dim">
              {d.consolePage.logsDesc}
            </p>
          </div>
          <span className="font-mono text-[11px] text-dim">
            {formatLogTime(snapshot.generatedAt, locale)}
          </span>
        </div>
        <LogTable rows={rows} t={d.consolePage} />
      </section>
    </div>
  );
}
