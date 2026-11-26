import type { DailyUsage } from "@/lib/usage";
import { compactNumber } from "@/lib/format";

type Props = {
  series: DailyUsage[];
  label: string;
};

const W = 720;
const H = 220;
const PAD_LEFT = 38;
const PAD_RIGHT = 10;
const PAD_TOP = 18;
const PAD_BOTTOM = 26;

export default function UsageChart({ series, label }: Props) {
  const max = Math.max(...series.map((d) => d.requests));
  const innerW = W - PAD_LEFT - PAD_RIGHT;
  const innerH = H - PAD_TOP - PAD_BOTTOM;
  const slot = innerW / series.length;
  const barW = Math.max(4, slot * 0.62);
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  const peak = series.reduce(
    (best, item) => (item.requests > best.requests ? item : best),
    series[0],
  );

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={label}
    >
      <defs>
        <linearGradient id="bar-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6f8cff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#6f8cff" stopOpacity="0.28" />
        </linearGradient>
      </defs>

      {gridLines.map((ratio) => {
        const y = PAD_TOP + innerH * (1 - ratio);
        return (
          <g key={ratio}>
            <line
              x1={PAD_LEFT}
              y1={y}
              x2={W - PAD_RIGHT}
              y2={y}
              stroke="#1d2434"
              strokeWidth="1"
              strokeDasharray={ratio === 0 ? "0" : "3 4"}
            />
            <text
              x={PAD_LEFT - 6}
              y={y + 3}
              textAnchor="end"
              className="fill-[#5d677e]"
              fontSize="9"
              fontFamily="ui-monospace, monospace"
            >
              {compactNumber(Math.round(max * ratio))}
            </text>
          </g>
        );
      })}

      {series.map((item, index) => {
        const h = (item.requests / max) * innerH;
        const x = PAD_LEFT + index * slot + (slot - barW) / 2;
        const y = PAD_TOP + innerH - h;
        const isPeak = item.date === peak.date;
        return (
          <rect
            key={item.date}
            x={x}
            y={y}
            width={barW}
            height={Math.max(h, 1)}
            rx={2}
            fill={isPeak ? "#43e2c4" : "url(#bar-g)"}
            opacity={isPeak ? 1 : 0.88}
          >
            <title>
              {`${item.date} · ${item.requests} req · ${compactNumber(item.tokens)} tok`}
            </title>
          </rect>
        );
      })}

      {[0, Math.floor(series.length / 2), series.length - 1].map((index) => {
        const item = series[index];
        const x = PAD_LEFT + index * slot + slot / 2;
        return (
          <text
            key={`x-${item.date}`}
            x={x}
            y={H - 8}
            textAnchor="middle"
            className="fill-[#5d677e]"
            fontSize="9"
            fontFamily="ui-monospace, monospace"
          >
            {item.date.slice(5)}
          </text>
        );
      })}
    </svg>
  );
}
