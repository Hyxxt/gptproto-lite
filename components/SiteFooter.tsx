import Link from "next/link";
import type { Dictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
  footer: Dictionary["footer"];
  siteName: string;
  githubUrl: string;
  nav: { models: string; tool: string; console: string };
};

export default function SiteFooter({
  locale,
  footer,
  siteName,
  githubUrl,
  nav,
}: Props) {
  const productLinks = [
    { href: `/${locale}/models`, label: nav.models },
    { href: `/${locale}/tools/image`, label: nav.tool },
    { href: `/${locale}/console`, label: nav.console },
  ];

  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <div className="text-[15px] font-semibold">{siteName}</div>
          <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-dim">
            {footer.note}
          </p>
          <p className="mt-4 font-mono text-[11.5px] text-dim">
            {footer.builtWith}
          </p>
        </div>

        <div>
          <div className="text-[12px] font-medium uppercase tracking-wider text-dim">
            {footer.product}
          </div>
          <ul className="mt-3 space-y-2">
            {productLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[13px] text-muted transition-colors hover:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="text-[12px] font-medium uppercase tracking-wider text-dim">
            {footer.resources}
          </div>
          <ul className="mt-3 space-y-2">
            <li>
              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[13px] text-muted transition-colors hover:text-ink"
              >
                {footer.github}
              </a>
            </li>
            <li>
              <a
                href="https://huangyouxiong-10m3k3ol.maozi.io"
                target="_blank"
                rel="noreferrer"
                className="text-[13px] text-muted transition-colors hover:text-ink"
              >
                {footer.portfolio}
              </a>
            </li>
            <li>
              <a
                href="/sitemap.xml"
                className="text-[13px] text-muted transition-colors hover:text-ink"
              >
                {footer.sitemap}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-5 text-[12px] text-dim">
          {footer.rights}
        </div>
      </div>
    </footer>
  );
}
