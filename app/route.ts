import { defaultLocale, isLocale, locales, type Locale } from "@/lib/i18n";

function preferredLocale(header: string): Locale {
  const weights = new Map<string, { quality: number; order: number }>();
  for (const [order, item] of header.split(",").entries()) {
    const match = item.trim().toLowerCase().match(/^([a-z]+|\*)(?:-[a-z0-9-]+)?(?:\s*;\s*q=(0(?:\.\d{0,3})?|1(?:\.0{0,3})?))?$/);
    if (!match) continue;
    const [, language, q] = match;
    const quality = Number(q ?? 1);
    if ((isLocale(language) || language === "*") && quality > (weights.get(language)?.quality ?? -1)) {
      weights.set(language, { quality, order });
    }
  }
  const candidates = locales.map(locale => ({
    locale, ...(weights.get(locale) ?? weights.get("*") ?? { quality: 0, order: Infinity }),
  }));
  candidates.sort((a, b) => b.quality - a.quality || a.order - b.order);
  return candidates[0].quality > 0 ? candidates[0].locale : defaultLocale;
}

export function GET(request: Request) {
  const locale = preferredLocale(request.headers.get("accept-language") ?? "");
  return new Response(null, {
    status: 307,
    headers: { Location: `/${locale}${new URL(request.url).search}`, Vary: "Accept-Language" },
  });
}
