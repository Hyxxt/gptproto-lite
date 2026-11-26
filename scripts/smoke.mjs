const BASE = process.env.SMOKE_BASE ?? "http://127.0.0.1:3100";

const routes = [
  { path: "/", expect: [307, 308] },
  { path: "/zh", expect: [200], must: ["Aurora 4", "模型目录"] },
  { path: "/en", expect: [200], must: ["Model catalog"] },
  { path: "/zh/models", expect: [200], must: ["模型目录"] },
  { path: "/zh/models?m=image", expect: [200], must: ["Lumen Image 2"] },
  { path: "/zh/models/aurora-4", expect: [200], must: ["256K", "调用示例"] },
  { path: "/en/models/aurora-4", expect: [200], must: ["Sample request"] },
  { path: "/zh/tools/image", expect: [200], must: ["图片生成工具"] },
  { path: "/zh/console", expect: [200], must: ["请求日志", "API Key"] },
  { path: "/sitemap.xml", expect: [200], must: ["/zh/models/aurora-4"] },
  { path: "/robots.txt", expect: [200], must: ["sitemap.xml"] },
  { path: "/zh/models/not-a-model", expect: [404] },
];

let failed = 0;

for (const route of routes) {
  const res = await fetch(`${BASE}${route.path}`, { redirect: "manual" });
  const body = await res.text();
  const statusOk = route.expect.includes(res.status);
  const missing = (route.must ?? []).filter((needle) => !body.includes(needle));
  const ok = statusOk && missing.length === 0;
  if (!ok) failed += 1;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${route.path.padEnd(30)} ${res.status}${
      res.headers.get("location") ? ` → ${res.headers.get("location")}` : ""
    }${missing.length ? `  missing: ${missing.join(", ")}` : ""}`,
  );
}

// Accept-Language 协商
const enRes = await fetch(`${BASE}/`, {
  redirect: "manual",
  headers: { "Accept-Language": "en-US,en;q=0.9" },
});
const enLoc = enRes.headers.get("location");
console.log(
  `${enLoc === "/en" ? "PASS" : "FAIL"}  Accept-Language: en → ${enLoc}`,
);
if (enLoc !== "/en") failed += 1;

for (const [header, expected] of [
  ["zh-CN,zh;q=0.9,en;q=0.5", "/zh"],
  ["zh;q=0.4,en-GB;q=0.9", "/en"],
  ["en;q=0", "/zh"],
]) {
  const res = await fetch(`${BASE}/`, { redirect: "manual", headers: { "Accept-Language": header } });
  const ok = res.status === 307 && res.headers.get("location") === expected &&
    res.headers.get("vary")?.toLowerCase().includes("accept-language");
  console.log(`${ok ? "PASS" : "FAIL"}  ${header} → ${expected}`);
  if (!ok) failed += 1;
}

const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
const publicPaths = Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g), match => new URL(match[1]).pathname);
const unique = new Set(publicPaths);
const sitemapOk = unique.size === 18 && publicPaths.length === 18 &&
  !publicPaths.some(path => path.endsWith("/console"));
console.log(`${sitemapOk ? "PASS" : "FAIL"}  sitemap: ${unique.size} public URLs`);
if (!sitemapOk) failed += 1;

for (const path of [...unique, "/zh/models?m=image", "/en/models?m=image"]) {
  const res = await fetch(`${BASE}${path}`);
  const body = await res.text();
  const href = body.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  const target = href && new URL(href);
  const ok = res.ok && target && target.pathname + target.search === path &&
    ["zh-CN", "en", "x-default"].every(lang => body.includes(`hrefLang="${lang}"`) || body.includes(`hreflang="${lang}"`));
  console.log(`${ok ? "PASS" : "FAIL"}  canonical and hreflang: ${path}`);
  if (!ok) failed += 1;
}

// 图片生成接口
const gen = await fetch(`${BASE}/api/generate-image`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ prompt: "a quiet harbor at dawn, film grain", ratio: "16:9", count: 2 }),
});
const genJson = await gen.json();
const genOk = gen.status === 200 && genJson.images?.length === 2 && genJson.images[0].startsWith("data:image/svg+xml");
console.log(
  `${genOk ? "PASS" : "FAIL"}  POST /api/generate-image  mode=${genJson.mode} images=${genJson.images?.length}`,
);
if (!genOk) failed += 1;

// 空 prompt 校验
const bad = await fetch(`${BASE}/api/generate-image`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ prompt: "  " }),
});
console.log(`${bad.status === 400 ? "PASS" : "FAIL"}  empty prompt rejected (${bad.status})`);
if (bad.status !== 400) failed += 1;

console.log(failed === 0 ? "\nALL PASS" : `\n${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
