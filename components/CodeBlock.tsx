"use client";

import { useState } from "react";

type Props = {
  code: string;
  copyLabel: string;
  copiedLabel: string;
};

export default function CodeBlock({ code, copyLabel, copiedLabel }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // 非安全上下文（http）下 clipboard 不可用，退回 textarea 方案
      const area = document.createElement("textarea");
      area.value = code;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      document.body.removeChild(area);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-[#06080d]">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#2a3348]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#2a3348]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#2a3348]" />
          <span className="ml-2 font-mono text-[11px] text-dim">typescript</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md border border-line px-2.5 py-1 text-[11.5px] text-muted transition-colors hover:border-line2 hover:text-ink"
        >
          {copied ? copiedLabel : copyLabel}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-[1.75] text-[#c8d3ea]">
        <code>{code}</code>
      </pre>
    </div>
  );
}
