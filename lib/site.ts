export const SITE_NAME = "GPTProto Lite";

/** 部署后把 NEXT_PUBLIC_SITE_URL 设成真实域名，sitemap 和 canonical 才会正确。 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? process.env.RENDER_EXTERNAL_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

export const GITHUB_URL =
  process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com/Hyxxt/gptproto-lite";

export const htmlLang: Record<"zh" | "en", string> = {
  zh: "zh-CN",
  en: "en",
};

export function pageAlternates(locale: "zh" | "en", path: string) {
  return {
    canonical: `${SITE_URL}/${locale}${path}`,
    languages: {
      "zh-CN": `${SITE_URL}/zh${path}`,
      en: `${SITE_URL}/en${path}`,
      "x-default": `${SITE_URL}/zh${path}`,
    },
  };
}
