/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/dictionaries";

type Props = {
  t: Dictionary["toolPage"];
};

type GenerateResponse = {
  mode: "demo" | "live";
  images: string[];
};

const RATIOS = ["1:1", "16:9", "9:16"] as const;
const COUNTS = [1, 2, 4] as const;

export default function ImageStudio({ t }: Props) {
  const [prompt, setPrompt] = useState("");
  const [ratio, setRatio] = useState<(typeof RATIOS)[number]>("1:1");
  const [count, setCount] = useState<(typeof COUNTS)[number]>(1);
  const [images, setImages] = useState<string[]>([]);
  const [mode, setMode] = useState<"demo" | "live">("demo");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!prompt.trim()) {
      setError(t.errorEmptyPrompt);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), ratio, count }),
      });
      if (!res.ok) throw new Error("request failed");
      const data = (await res.json()) as GenerateResponse;
      setImages(data.images);
      setMode(data.mode);
    } catch {
      setError(t.errorGeneric);
    } finally {
      setLoading(false);
    }
  }

  const aspect = ratio === "1:1" ? "aspect-square" : ratio === "16:9" ? "aspect-video" : "aspect-[9/16]";

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <form
        onSubmit={handleSubmit}
        className="panel h-fit p-5 lg:sticky lg:top-24"
      >
        <label
          htmlFor="prompt"
          className="text-[12px] font-medium uppercase tracking-wider text-dim"
        >
          {t.promptLabel}
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder={t.promptPlaceholder}
          rows={4}
          maxLength={400}
          className="mt-2 w-full resize-none rounded-lg border border-line bg-panel px-3 py-2.5 text-[13px] leading-relaxed text-ink placeholder:text-dim focus:border-accent/60 focus:outline-none"
        />
        <div className="mt-1 text-right font-mono text-[11px] text-dim">
          {prompt.length}/400
        </div>

        <div className="mt-4">
          <div className="text-[12px] font-medium uppercase tracking-wider text-dim">
            {t.ratioLabel}
          </div>
          <div className="mt-2 flex gap-2">
            {RATIOS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setRatio(item)}
                className={`flex-1 rounded-lg border px-2 py-1.5 font-mono text-[12px] transition-colors ${
                  ratio === item
                    ? "border-accent/60 bg-accent/10 text-ink"
                    : "border-line text-muted hover:border-line2"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className="text-[12px] font-medium uppercase tracking-wider text-dim">
            {t.countLabel}
          </div>
          <div className="mt-2 flex gap-2">
            {COUNTS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCount(item)}
                className={`flex-1 rounded-lg border px-2 py-1.5 font-mono text-[12px] transition-colors ${
                  count === item
                    ? "border-accent/60 bg-accent/10 text-ink"
                    : "border-line text-muted hover:border-line2"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-[13.5px] font-medium text-[#080b13] transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-70"
        >
          {loading && (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#080b13]/30 border-t-[#080b13]" />
          )}
          {loading ? t.generating : t.generate}
        </button>

        {error && (
          <p className="mt-3 rounded-lg border border-[#ff7a8a]/30 bg-[#ff7a8a]/10 px-3 py-2 text-[12px] text-[#ff7a8a]">
            {error}
          </p>
        )}

        <div className="mt-5 border-t border-line pt-4">
          <div className="text-[11px] uppercase tracking-wider text-dim">
            {t.examplesLabel}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {t.examples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setPrompt(example)}
                className="rounded-full border border-line px-2.5 py-1 text-[11.5px] text-muted transition-colors hover:border-line2 hover:text-ink"
              >
                {example.length > 18 ? `${example.slice(0, 18)}…` : example}
              </button>
            ))}
          </div>
        </div>
      </form>

      <div>
        {images.length === 0 && !loading && (
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-line text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-panel">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#5d677e" strokeWidth="1.4">
                <rect x="2.5" y="3.5" width="15" height="13" rx="2" />
                <circle cx="7" cy="8" r="1.4" />
                <path d="M2.5 13.5 7 9.5l3 3 2.5-2.5 4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-[13.5px] text-muted">{t.emptyTitle}</div>
            <div className="mt-1 text-[12px] text-dim">{t.emptyDesc}</div>
          </div>
        )}

        {loading && (
          <div className="grid min-h-[420px] place-items-center rounded-2xl border border-line bg-panel/40">
            <div className="flex flex-col items-center gap-3">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-line2 border-t-accent" />
              <span className="text-[12.5px] text-dim">{t.generating}</span>
            </div>
          </div>
        )}

        {images.length > 0 && !loading && (
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-[13px] font-medium text-ink">{t.resultTitle}</h2>
              {mode === "demo" && (
                <span className="rounded-full border border-[#ffb27a]/30 bg-[#ffb27a]/10 px-2.5 py-1 text-[11px] text-[#ffb27a]">
                  {t.demoNote}
                </span>
              )}
            </div>
            <div
              className={`grid gap-4 ${
                count === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
              }`}
            >
              {images.map((src, index) => (
                <figure
                  key={`${src.slice(0, 24)}-${index}`}
                  className="group relative overflow-hidden rounded-xl border border-line bg-panel"
                >
                  <img
                    src={src}
                    alt={`${prompt} — ${index + 1}`}
                    className={`w-full object-cover ${count === 1 ? aspect : "aspect-square"}`}
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/80 to-transparent px-3 py-3 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="truncate text-[11.5px] text-white/70">
                      {ratio}
                    </span>
                    <a
                      href={src}
                      download={`gptproto-${ratio.replace(":", "x")}-${index + 1}.svg`}
                      className="rounded-md bg-white/90 px-2 py-1 text-[11px] font-medium text-black"
                    >
                      {t.download}
                    </a>
                  </figcaption>
                </figure>
              ))}
            </div>
            {mode === "demo" && (
              <p className="mt-3 text-[11.5px] leading-relaxed text-dim">
                {t.demoHint}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
