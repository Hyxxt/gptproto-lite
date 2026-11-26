import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SIZES: Record<string, { w: number; h: number }> = {
  "1:1": { w: 1024, h: 1024 },
  "16:9": { w: 1216, h: 684 },
  "9:16": { w: 684, h: 1216 },
};

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function escapeXml(value: string): string {
  const map: Record<string, string> = {
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;",
  };
  return value.replace(/[<>&'"]/g, (char) => map[char] ?? char);
}

/**
 * 未配置图像模型密钥时，用 prompt 的哈希决定色相，渲染一张确定性的 SVG。
 * 目的是把「输入 → 请求 → 展示 → 下载」这条链路跑通，而不是伪造模型输出，
 * 页面上也明确标了 demo 模式。
 */
function placeholderSvg(prompt: string, w: number, h: number, hue: number): string {
  const short = prompt.length > 64 ? `${prompt.slice(0, 64)}…` : prompt;
  const d = Math.min(w, h);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${hue} 55% 11%)"/>
      <stop offset="1" stop-color="hsl(${(hue + 80) % 360} 58% 8%)"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.42" r="0.62">
      <stop offset="0" stop-color="hsl(${hue} 85% 62%)" stop-opacity="0.42"/>
      <stop offset="1" stop-color="hsl(${hue} 85% 62%)" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  <g stroke="hsl(${hue} 70% 78%)" stroke-opacity="0.28" fill="none" stroke-width="${Math.max(
    1,
    d / 480,
  )}">
    <circle cx="${w / 2}" cy="${h / 2}" r="${d * 0.30}"/>
    <circle cx="${w / 2}" cy="${h / 2}" r="${d * 0.20}"/>
    <path d="M${w / 2} ${h / 2 - d * 0.38} L${w / 2 + d * 0.38} ${h / 2} L${w / 2} ${
      h / 2 + d * 0.38
    } L${w / 2 - d * 0.38} ${h / 2} Z"/>
  </g>
  <text x="${w / 2}" y="${h / 2}" text-anchor="middle" dominant-baseline="middle"
    fill="hsl(${hue} 90% 92%)" font-family="system-ui, sans-serif"
    font-size="${d * 0.035}" letter-spacing="${d * 0.004}">DEMO RENDER</text>
  <text x="${w / 2}" y="${h * 0.82}" text-anchor="middle"
    fill="hsl(${hue} 40% 82%)" fill-opacity="0.72"
    font-family="system-ui, sans-serif" font-size="${d * 0.026}">${escapeXml(short)}</text>
</svg>`;
}

type Body = {
  prompt?: unknown;
  ratio?: unknown;
  count?: unknown;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    const input: unknown = await request.json();
    if (input === null || typeof input !== "object" || Array.isArray(input)) {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }
    body = input as Body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) {
    return NextResponse.json({ error: "empty_prompt" }, { status: 400 });
  }
  if (prompt.length > 400) {
    return NextResponse.json({ error: "prompt_too_long" }, { status: 400 });
  }

  const ratio = typeof body.ratio === "string" && Object.hasOwn(SIZES, body.ratio) ? body.ratio : "1:1";
  const count = Math.min(4, Math.max(1, Number(body.count) || 1));
  const size = SIZES[ratio];

  const apiKey = process.env.IMAGE_API_KEY;
  if (apiKey) {
    try {
      const base = process.env.IMAGE_API_BASE ?? "https://api.openai.com/v1";
      const res = await fetch(`${base}/images/generations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: process.env.IMAGE_MODEL ?? "gpt-image-1",
          prompt,
          size: ratio === "1:1" ? "1024x1024" : ratio === "16:9" ? "1536x1024" : "1024x1536",
          n: count,
        }),
      });

      if (res.ok) {
        const json = (await res.json()) as {
          data?: { url?: string; b64_json?: string }[];
        };
        const images = (json.data ?? [])
          .map((item) =>
            item.url
              ? item.url
              : item.b64_json
                ? `data:image/png;base64,${item.b64_json}`
                : "",
          )
          .filter(Boolean);
        if (images.length > 0) {
          return NextResponse.json({ mode: "live", images });
        }
      }
    } catch {
      // 上游异常时继续走下面的占位图，不让整个页面挂掉
    }
  }

  const baseHue = hash(prompt) % 360;
  const images = Array.from({ length: count }, (_, index) => {
    const hue = (baseHue + index * 47) % 360;
    const svg = placeholderSvg(prompt, size.w, size.h, hue);
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });

  return NextResponse.json({ mode: "demo", images });
}
