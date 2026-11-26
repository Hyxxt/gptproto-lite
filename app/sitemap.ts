import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { models } from "@/lib/models";
import { SITE_URL, pageAlternates } from "@/lib/site";

const STATIC_PATHS = ["", "/models", "/tools/image"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const path of STATIC_PATHS) {
    for (const locale of locales) {
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: now,
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1 : 0.8,
        alternates: { languages: pageAlternates(locale, path).languages },
      });
    }
  }

  for (const model of models) {
    const path = `/models/${model.slug}`;
    for (const locale of locales) {
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: { languages: pageAlternates(locale, path).languages },
      });
    }
  }

  return entries;
}
