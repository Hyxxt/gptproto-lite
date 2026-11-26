import Link from "next/link";
import type { Dictionary } from "@/lib/dictionaries";
import { formatLatency, money, unitLabel } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import type { ModelSpec } from "@/lib/models";

type Props = {
  model: ModelSpec;
  locale: Locale;
  d: Dictionary;
};

const modalityTone: Record<ModelSpec["modality"], string> = {
  text: "text-accent bg-accent/10 border-accent/25",
  vision: "text-mint bg-mint/10 border-mint/25",
  image: "text-[#f0a4ff] bg-[#f0a4ff]/10 border-[#f0a4ff]/25",
  video: "text-[#ffb27a] bg-[#ffb27a]/10 border-[#ffb27a]/25",
  embedding: "text-[#a8b6d8] bg-[#a8b6d8]/10 border-[#a8b6d8]/25",
};

export default function ModelCard({ model, locale, d }: Props) {
  const unit = unitLabel(model.pricing.unit, d.modelDetail);
  const priceMain =
    model.pricing.input !== null ? model.pricing.input : model.pricing.output;
  const priceHint =
    model.pricing.input !== null && model.pricing.output !== null
      ? `${money(model.pricing.input, d.modelDetail.priceFree)} / ${money(
          model.pricing.output,
          d.modelDetail.priceFree,
        )}`
      : money(priceMain, d.modelDetail.priceFree);

  return (
    <Link
      href={`/${locale}/models/${model.slug}`}
      className="panel group flex flex-col p-5 transition-colors hover:border-line2 hover:bg-panel2/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-semibold tracking-tight">
              {model.name}
            </span>
            {model.flagship && (
              <span className="rounded border border-mint/30 bg-mint/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-mint">
                {d.modelDetail.flagship}
              </span>
            )}
          </div>
          <div className="mt-1 text-[12px] text-dim">{model.vendor}</div>
        </div>
        <span
          className={`shrink-0 rounded border px-2 py-0.5 text-[11px] ${modalityTone[model.modality]}`}
        >
          {d.modality[model.modality]}
        </span>
      </div>

      <p className="mt-4 line-clamp-2 text-[13px] leading-relaxed text-muted">
        {model.summary[locale]}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4">
        <div>
          <div className="text-[11px] text-dim">{d.modelDetail.specContext}</div>
          <div className="mt-0.5 font-mono text-[13px] text-ink">
            {model.contextK}K
          </div>
        </div>
        <div>
          <div className="text-[11px] text-dim">{d.modelDetail.specLatency}</div>
          <div className="mt-0.5 font-mono text-[13px] text-ink">
            {formatLatency(model.latencyMs)}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between">
        <div>
          <div className="font-mono text-[13px] text-ink">{priceHint}</div>
          <div className="text-[11px] text-dim">{unit}</div>
        </div>
        <span className="text-[12px] text-dim transition-colors group-hover:text-accent">
          {d.common.view} →
        </span>
      </div>
    </Link>
  );
}
