import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-6xl flex-col items-center justify-center px-5 py-24 text-center">
      <div className="font-mono text-[12px] tracking-widest text-accent">404</div>
      <h1 className="mt-4 text-[26px] font-semibold tracking-tight">
        这个页面不存在 / Page not found
      </h1>
      <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-muted">
        地址没有对应页面，可能是模型 slug 写错了。
        <br />
        This URL doesn&apos;t match any page — the model slug may be wrong.
      </p>
      <div className="mt-7 flex gap-3">
        <Link
          href="/zh/models"
          className="rounded-lg bg-accent px-4 py-2 text-[13px] font-medium text-[#080b13] transition-opacity hover:opacity-90"
        >
          返回模型目录
        </Link>
        <Link
          href="/en/models"
          className="rounded-lg border border-line px-4 py-2 text-[13px] text-ink transition-colors hover:border-line2"
        >
          Back to catalog
        </Link>
      </div>
    </div>
  );
}
