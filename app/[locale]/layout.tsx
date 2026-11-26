import type { Metadata } from "next";
import "../globals.css";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getDictionary } from "@/lib/dictionaries";
import { locales, resolveLocale } from "@/lib/i18n";
import { GITHUB_URL, SITE_NAME, SITE_URL, htmlLang } from "@/lib/site";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const dynamicParams = false;

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = resolveLocale(raw);
  const d = getDictionary(locale);
  const canonical = `${SITE_URL}/${locale}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${SITE_NAME} · ${d.meta.tagline}`,
      template: `%s · ${SITE_NAME}`,
    },
    description: d.meta.description,
    applicationName: SITE_NAME,
    keywords:
      locale === "zh"
        ? ["模型 API", "AI 平台", "图片生成", "Next.js", "TypeScript", "中英双语"]
        : ["model API", "AI platform", "image generation", "Next.js", "TypeScript", "i18n"],
    authors: [{ name: "黄佑雄", url: GITHUB_URL }],
    alternates: {
      canonical,
      languages: {
        "zh-CN": `${SITE_URL}/zh`,
        en: `${SITE_URL}/en`,
        "x-default": `${SITE_URL}/zh`,
      },
    },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: SITE_NAME,
      title: `${SITE_NAME} · ${d.meta.tagline}`,
      description: d.meta.description,
      locale: locale === "zh" ? "zh_CN" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE_NAME} · ${d.meta.tagline}`,
      description: d.meta.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale: raw } = await params;
  const locale = resolveLocale(raw);
  const d = getDictionary(locale);

  return (
    <html lang={htmlLang[locale]}>
      <body className="min-h-screen">
        <SiteHeader
          locale={locale}
          siteName={SITE_NAME}
          nav={d.nav}
          switchLabel={d.locale.switchTo}
          githubUrl={GITHUB_URL}
        />
        <main>{children}</main>
        <SiteFooter
          locale={locale}
          footer={d.footer}
          siteName={SITE_NAME}
          githubUrl={GITHUB_URL}
          nav={{ models: d.nav.models, tool: d.nav.tool, console: d.nav.console }}
        />
      </body>
    </html>
  );
}
