import { pageAlternates } from "@/lib/site";
import type { Metadata } from "next";
import ImageStudio from "@/components/ImageStudio";
import { getDictionary } from "@/lib/dictionaries";
import { resolveLocale } from "@/lib/i18n";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const d = getDictionary(resolveLocale(raw));
  return {
    alternates: pageAlternates(resolveLocale(raw), "/tools/image"),
    title: d.toolPage.title,
    description: d.toolPage.desc,
  };
}

export default async function ImageToolPage({ params }: PageProps) {
  const { locale: raw } = await params;
  const locale = resolveLocale(raw);
  const d = getDictionary(locale);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="text-[28px] font-semibold tracking-tight">
        {d.toolPage.title}
      </h1>
      <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-muted">
        {d.toolPage.desc}
      </p>

      <div className="mt-10">
        <ImageStudio t={d.toolPage} />
      </div>
    </div>
  );
}
