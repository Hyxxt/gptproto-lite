"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { switchLocalePath, type Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
  siteName: string;
  nav: {
    models: string;
    tool: string;
    console: string;
    github: string;
    menu: string;
    close: string;
  };
  switchLabel: string;
  githubUrl: string;
};

function Logo() {
  return (
    <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6f8cff" />
          <stop offset="1" stopColor="#43e2c4" />
        </linearGradient>
      </defs>
      <path
        d="M16 4.5 27 16l-11 11.5L5 16z"
        fill="none"
        stroke="url(#logo-g)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16" r="2.4" fill="url(#logo-g)" />
    </svg>
  );
}

export default function SiteHeader({
  locale,
  siteName,
  nav,
  switchLabel,
  githubUrl,
}: Props) {
  const pathname = usePathname() || `/${locale}`;
  const [open, setOpen] = useState(false);
  const next: Locale = locale === "zh" ? "en" : "zh";

  const items = [
    { href: `/${locale}/models`, label: nav.models },
    { href: `/${locale}/tools/image`, label: nav.tool },
    { href: `/${locale}/console`, label: nav.console },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-canvas/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <div className="flex items-center gap-8">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight"
          >
            <Logo />
            <span>{siteName}</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-1.5 text-[13.5px] transition-colors ${
                  isActive(item.href)
                    ? "bg-panel2 text-ink"
                    : "text-muted hover:bg-panel2/60 hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-lg border border-line px-3 py-1.5 text-[13px] text-muted transition-colors hover:border-line2 hover:text-ink sm:block"
          >
            {nav.github}
          </a>
          <Link
            href={switchLocalePath(pathname, next)}
            hrefLang={next}
            className="rounded-lg border border-line px-3 py-1.5 text-[13px] text-muted transition-colors hover:border-line2 hover:text-ink"
          >
            {switchLabel}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? nav.close : nav.menu}
            className="rounded-lg border border-line p-2 text-muted md:hidden"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
              {open ? (
                <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
              ) : (
                <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-line px-5 py-3 md:hidden">
          <div className="flex flex-col">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-panel2 hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-panel2 hover:text-ink"
            >
              {nav.github}
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
