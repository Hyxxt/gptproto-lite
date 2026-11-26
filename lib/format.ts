import type { Dictionary } from "./dictionaries";
import type { PriceUnit } from "./models";

export function unitLabel(
  unit: PriceUnit,
  d: Pick<
    Dictionary["modelDetail"],
    "unitPerMTokens" | "unitPerImage" | "unitPerSecond"
  >,
): string {
  if (unit === "perImage") return d.unitPerImage;
  if (unit === "perSecond") return d.unitPerSecond;
  return d.unitPerMTokens;
}

export function money(value: number | null, free: string): string {
  if (value === null) return free;
  if (Number.isInteger(value)) return `¥${value}`;
  return `¥${value.toFixed(2).replace(/0$/, "")}`;
}

export function compactNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(value);
}

export function formatLatency(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

/** 统一的时间格式，服务端和客户端都要稳定，避免 hydration 不一致。 */
export function formatLogTime(iso: string, locale: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return locale === "en" ? `${date} ${time}` : `${date.slice(5)} ${time}`;
}
