import { models } from "./models";

export interface DailyUsage {
  /** YYYY-MM-DD */
  date: string;
  requests: number;
  tokens: number;
  cost: number;
}

export interface ModelShare {
  slug: string;
  name: string;
  requests: number;
  share: number;
}

export type LogStatus = "ok" | "slow" | "limited";

export interface LogRow {
  id: string;
  /** ISO 时间戳 */
  at: string;
  model: string;
  endpoint: string;
  tokens: number;
  latencyMs: number;
  status: LogStatus;
}

export interface UsageSnapshot {
  totals: {
    requests: number;
    tokens: number;
    cost: number;
    successRate: number;
  };
  series: DailyUsage[];
  byModel: ModelShare[];
  logs: LogRow[];
  generatedAt: string;
}

/** 固定种子的伪随机，保证每次构建出来的图一样，截图和文档才对得上。 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ENDPOINTS: Record<string, string> = {
  text: "/v1/chat/completions",
  vision: "/v1/chat/completions",
  image: "/v1/images/generations",
  video: "/v1/videos",
  embedding: "/v1/embeddings",
};

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function dateKey(d: Date): string {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

export function buildUsageSnapshot(now: Date = new Date("2026-11-26T00:00:00Z")): UsageSnapshot {
  const rand = mulberry32(20261126);
  const series: DailyUsage[] = [];

  for (let i = 29; i >= 0; i -= 1) {
    const day = new Date(now.getTime() - i * 86400000);
    const weekday = day.getUTCDay();
    // 周末调用量天然低一档，曲线才有形状，不是一条平线
    const weekendFactor = weekday === 0 || weekday === 6 ? 0.55 : 1;
    const drift = 1 + (29 - i) * 0.012;
    const requests = Math.round(
      (180 + rand() * 260) * weekendFactor * drift,
    );
    const tokens = Math.round(requests * (620 + rand() * 480));
    const cost = Number((tokens / 1_000_000 * 5.4).toFixed(2));
    series.push({ date: dateKey(day), requests, tokens, cost });
  }

  const totalRequests = series.reduce((sum, d) => sum + d.requests, 0);
  const totalTokens = series.reduce((sum, d) => sum + d.tokens, 0);
  const totalCost = Number(
    series.reduce((sum, d) => sum + d.cost, 0).toFixed(2),
  );

  // 用量分布：旗舰模型占大头，向量模型调用次数多但单价低
  const weights = [0.34, 0.22, 0.14, 0.18, 0.03, 0.09];
  const byModel: ModelShare[] = models.map((model, index) => {
    const requests = Math.round(totalRequests * weights[index]);
    return {
      slug: model.slug,
      name: model.name,
      requests,
      share: Number(((requests / totalRequests) * 100).toFixed(1)),
    };
  });
  byModel.sort((a, b) => b.requests - a.requests);

  const logs: LogRow[] = [];
  for (let i = 0; i < 24; i += 1) {
    const model = models[Math.floor(rand() * models.length)];
    const at = new Date(now.getTime() - i * (11 + rand() * 90) * 60000);
    const roll = rand();
    const status: LogStatus = roll > 0.94 ? "limited" : roll > 0.82 ? "slow" : "ok";
    const baseLatency =
      model.modality === "video"
        ? 18000 + rand() * 9000
        : model.modality === "image"
          ? 2600 + rand() * 1600
          : model.latencyMs + rand() * 400;
    logs.push({
      id: `req_${(1000 + i * 37).toString(36)}${Math.floor(rand() * 1e6).toString(36)}`,
      at: at.toISOString(),
      model: model.slug,
      endpoint: ENDPOINTS[model.modality] ?? "/v1/chat/completions",
      tokens: Math.round(180 + rand() * 3200),
      latencyMs: Math.round(baseLatency),
      status,
    });
  }

  return {
    totals: {
      requests: totalRequests,
      tokens: totalTokens,
      cost: totalCost,
      successRate: 99.94,
    },
    series,
    byModel,
    logs,
    generatedAt: now.toISOString(),
  };
}
