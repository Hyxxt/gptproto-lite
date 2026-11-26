export type Modality = "text" | "vision" | "image" | "video" | "embedding";

export type PriceUnit = "perMTokens" | "perImage" | "perSecond";

export interface Localized {
  zh: string;
  en: string;
}

export interface ModelSpec {
  slug: string;
  name: string;
  vendor: string;
  modality: Modality;
  tagline: Localized;
  summary: Localized;
  /** 上下文窗口，单位 K token；生成类模型填输出上限。 */
  contextK: number;
  pricing: {
    input: number | null;
    output: number | null;
    unit: PriceUnit;
  };
  latencyMs: number;
  throughput: string;
  release: string;
  highlights: { zh: string[]; en: string[] };
  flagship?: boolean;
}

/**
 * 全部是本项目自建的演示数据，模型名与厂商名均为虚构，
 * 不对应任何真实商业模型，避免误导访客。
 */
export const models: ModelSpec[] = [
  {
    slug: "aurora-4",
    name: "Aurora 4",
    vendor: "GPTProto Labs",
    modality: "text",
    flagship: true,
    tagline: { zh: "旗舰推理模型", en: "Flagship reasoning model" },
    summary: {
      zh: "面向复杂推理与长文档处理的主力模型。支持 256K 上下文，在代码理解、结构化抽取与多步规划上表现稳定，适合作为服务端默认模型。",
      en: "The workhorse for complex reasoning and long-document work. A 256K context window, stable code comprehension, structured extraction and multi-step planning make it a sensible server-side default.",
    },
    contextK: 256,
    pricing: { input: 3, output: 12, unit: "perMTokens" },
    latencyMs: 620,
    throughput: "78 tok/s",
    release: "2026-08",
    highlights: {
      zh: [
        "256K 上下文，单次可吞下约 40 万字中文",
        "原生支持 JSON Schema 约束输出",
        "流式响应首字延迟中位数 620ms",
      ],
      en: [
        "256K context — roughly 180k English words in one call",
        "Native JSON Schema constrained decoding",
        "Median 620ms time-to-first-token on streaming",
      ],
    },
  },
  {
    slug: "aurora-4-mini",
    name: "Aurora 4 Mini",
    vendor: "GPTProto Labs",
    modality: "text",
    tagline: { zh: "轻量高并发", en: "Lightweight, high concurrency" },
    summary: {
      zh: "同代蒸馏版本，参数量更小、吞吐更高，专门给分类、改写、意图识别这类高频低难度任务用。",
      en: "A distilled sibling tuned for high-frequency, low-difficulty work: classification, rewriting, intent detection.",
    },
    contextK: 128,
    pricing: { input: 0.4, output: 1.6, unit: "perMTokens" },
    latencyMs: 240,
    throughput: "190 tok/s",
    release: "2026-08",
    highlights: {
      zh: ["单卡可跑，成本约为旗舰的 1/7", "190 tok/s 吞吐", "适合做前置路由与兜底"],
      en: [
        "Runs on a single card at ~1/7 the flagship cost",
        "190 tok/s throughput",
        "Great as a router or fallback tier",
      ],
    },
  },
  {
    slug: "aurora-vision",
    name: "Aurora Vision",
    vendor: "GPTProto Labs",
    modality: "vision",
    tagline: { zh: "多模态理解", en: "Multimodal understanding" },
    summary: {
      zh: "图 + 文联合输入，用于截图问答、票据识别、图表读取。支持一次传入多张图片并做跨图比对。",
      en: "Accepts images and text together for screenshot Q&A, invoice parsing and chart reading. Multiple images per call, compared across each other.",
    },
    contextK: 128,
    pricing: { input: 1.2, output: 4.8, unit: "perMTokens" },
    latencyMs: 510,
    throughput: "55 tok/s",
    release: "2026-06",
    highlights: {
      zh: ["单次最多 8 张图", "支持 PDF 页面直接转图输入", "表格与坐标轴读取准确率更高"],
      en: [
        "Up to 8 images per request",
        "PDF pages can be passed as images directly",
        "Stronger on tables and axis labels",
      ],
    },
  },
  {
    slug: "lumen-image-2",
    name: "Lumen Image 2",
    vendor: "GPTProto Labs",
    modality: "image",
    tagline: { zh: "文生图 / 图生图", en: "Text-to-image & image-to-image" },
    summary: {
      zh: "图像生成模型，支持文生图与参考图改图，输出 1:1、16:9、9:16 三种比例，单次可出 4 张候选。",
      en: "Image generation with text-to-image and reference-guided editing. Ships 1:1, 16:9 and 9:16 ratios, up to four candidates per call.",
    },
    contextK: 4,
    pricing: { input: null, output: 0.04, unit: "perImage" },
    latencyMs: 3200,
    throughput: "3.2s / 张",
    release: "2026-09",
    highlights: {
      zh: ["单张成本 0.04 元", "支持负面提示词与风格种子", "同一 seed 可复现结果"],
      en: [
        "¥0.04 per image",
        "Negative prompts and style seeds supported",
        "Reproducible output for a fixed seed",
      ],
    },
  },
  {
    slug: "kinetic-video-1",
    name: "Kinetic Video 1",
    vendor: "GPTProto Labs",
    modality: "video",
    tagline: { zh: "短视频生成", en: "Short-form video" },
    summary: {
      zh: "按秒计费的视频生成模型，支持首帧图控制运镜，输出 4 秒与 8 秒两档，适合做产品演示与素材预演。",
      en: "Billed per second of output. First-frame conditioning steers the camera; 4s and 8s clips suit product demos and storyboard previz.",
    },
    contextK: 2,
    pricing: { input: null, output: 0.18, unit: "perSecond" },
    latencyMs: 24000,
    throughput: "24s / 4s 片",
    release: "2026-10",
    highlights: {
      zh: ["4s / 8s 两档时长", "支持首帧图与运镜描述", "异步任务，轮询取结果"],
      en: [
        "4s and 8s output lengths",
        "First-frame image plus camera-motion prompt",
        "Async job, poll for the result",
      ],
    },
  },
  {
    slug: "vector-text-3",
    name: "Vector Text 3",
    vendor: "GPTProto Labs",
    modality: "embedding",
    tagline: { zh: "文本向量化", en: "Text embeddings" },
    summary: {
      zh: "1024 维文本向量，面向检索与聚类。批量接口单次最多 256 条，用于知识库索引构建。",
      en: "1024-dimension embeddings for retrieval and clustering. Batch endpoint takes up to 256 inputs, built for knowledge-base indexing.",
    },
    contextK: 8,
    pricing: { input: 0.02, output: null, unit: "perMTokens" },
    latencyMs: 35,
    throughput: "1.2k tok/s",
    release: "2026-03",
    highlights: {
      zh: ["1024 维，余弦相似度直接可用", "批量 256 条 / 次", "中文长句表现优于同价位模型"],
      en: [
        "1024 dimensions, cosine-ready",
        "256 inputs per batch call",
        "Better on long Chinese sentences than same-tier peers",
      ],
    },
  },
];

export function getModel(slug: string): ModelSpec | undefined {
  return models.find((model) => model.slug === slug);
}

export function getModelsByModality(modality: Modality | "all"): ModelSpec[] {
  if (modality === "all") return models;
  return models.filter((model) => model.modality === modality);
}

export const modalityOrder: Modality[] = [
  "text",
  "vision",
  "image",
  "video",
  "embedding",
];

/** 详情页的调用示例：按模态给出不同端点的代码。 */
export function getSampleCode(model: ModelSpec): string {
  if (model.modality === "image") {
    return `const res = await fetch("https://api.gptproto.lite/v1/images/generations", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: \`Bearer \${process.env.GPTPROTO_API_KEY}\`,
  },
  body: JSON.stringify({
    model: "${model.slug}",
    prompt: "a quiet harbor at dawn, thick fog, film grain",
    size: "1024x1024",
    n: 1,
  }),
});

const { data } = await res.json();
console.log(data[0].url);`;
  }

  if (model.modality === "embedding") {
    return `const res = await fetch("https://api.gptproto.lite/v1/embeddings", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: \`Bearer \${process.env.GPTPROTO_API_KEY}\`,
  },
  body: JSON.stringify({
    model: "${model.slug}",
    input: ["退货政策是什么", "发票怎么开"],
  }),
});

const { data } = await res.json();
console.log(data.map((d) => d.embedding.length)); // 1024`;
  }

  if (model.modality === "video") {
    return `const job = await fetch("https://api.gptproto.lite/v1/videos", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: \`Bearer \${process.env.GPTPROTO_API_KEY}\`,
  },
  body: JSON.stringify({
    model: "${model.slug}",
    prompt: "slow dolly-in on a ceramic cup, morning light",
    duration: 4,
  }),
}).then((r) => r.json());

// 异步任务，轮询直到 status === "succeeded"
let state = job;
while (state.status !== "succeeded") {
  await new Promise((r) => setTimeout(r, 3000));
  state = await fetch(\`https://api.gptproto.lite/v1/videos/\${job.id}\`, {
    headers: { Authorization: \`Bearer \${process.env.GPTPROTO_API_KEY}\` },
  }).then((r) => r.json());
}
console.log(state.url);`;
  }

  return `const res = await fetch("https://api.gptproto.lite/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: \`Bearer \${process.env.GPTPROTO_API_KEY}\`,
  },
  body: JSON.stringify({
    model: "${model.slug}",
    messages: [{ role: "user", content: "用三句话解释什么是服务端渲染" }],
    stream: true,
  }),
});

for await (const chunk of res.body!) {
  process.stdout.write(new TextDecoder().decode(chunk));
}`;
}
