import type { ModelShare } from "@/lib/usage";
import { compactNumber } from "@/lib/format";

type Props = {
  items: ModelShare[];
};

export default function ModelShareBars({ items }: Props) {
  const max = Math.max(...items.map((item) => item.share));

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.slug}>
          <div className="flex items-baseline justify-between">
            <span className="text-[12.5px] text-ink">{item.name}</span>
            <span className="font-mono text-[11.5px] text-dim">
              {compactNumber(item.requests)} · {item.share}%
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-panel2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-mint"
              style={{ width: `${(item.share / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
