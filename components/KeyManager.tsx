"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/lib/dictionaries";

type KeyItem = {
  id: string;
  name: string;
  value: string;
  createdAt: string;
};

const STORAGE_KEY = "gptproto-lite:keys";

function randomKey(): string {
  const alphabet =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const byte of bytes) out += alphabet[byte % alphabet.length];
  return `sk-lite-${out}`;
}

function mask(value: string): string {
  return `${value.slice(0, 10)}${"•".repeat(10)}${value.slice(-4)}`;
}

type Props = {
  t: Dictionary["consolePage"];
};

export default function KeyManager({ t }: Props) {
  const [keys, setKeys] = useState<KeyItem[]>([]);
  const [name, setName] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setKeys(JSON.parse(raw) as KeyItem[]);
    } catch {
      // 损坏的本地数据直接忽略，不影响页面
    }
    setReady(true);
  }, []);

  function persist(next: KeyItem[]) {
    setKeys(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // 隐私模式下可能写不进去，内存里仍然可用
    }
  }

  function handleCreate() {
    const label = name.trim() || "default";
    const item: KeyItem = {
      id: crypto.randomUUID(),
      name: label,
      value: randomKey(),
      createdAt: new Date().toISOString(),
    };
    persist([item, ...keys]);
    setName("");
  }

  async function handleCopy(item: KeyItem) {
    try {
      await navigator.clipboard.writeText(item.value);
      setCopiedId(item.id);
      window.setTimeout(() => setCopiedId(null), 1600);
    } catch {
      setCopiedId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleCreate();
          }}
          placeholder={t.keyPlaceholder}
          maxLength={24}
          className="flex-1 rounded-lg border border-line bg-panel px-3 py-2 text-[13px] text-ink placeholder:text-dim focus:border-accent/60 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleCreate}
          className="rounded-lg bg-accent px-4 py-2 text-[13px] font-medium text-[#080b13] transition-opacity hover:opacity-90"
        >
          {t.keyCreate}
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {ready && keys.length === 0 && (
          <p className="rounded-lg border border-dashed border-line px-3 py-6 text-center text-[12.5px] text-dim">
            {t.keyEmpty}
          </p>
        )}

        {keys.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-panel px-3 py-2.5"
          >
            <div className="min-w-0">
              <div className="text-[12.5px] text-ink">{item.name}</div>
              <div className="mt-0.5 truncate font-mono text-[11.5px] text-dim">
                {mask(item.value)}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="mr-1 hidden font-mono text-[11px] text-dim sm:inline">
                {t.keyCreated} {item.createdAt.slice(0, 10)}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(item)}
                className="rounded-md border border-line px-2 py-1 text-[11.5px] text-muted transition-colors hover:border-line2 hover:text-ink"
              >
                {copiedId === item.id ? t.keyCopied : t.keyCopy}
              </button>
              <button
                type="button"
                onClick={() =>
                  persist(keys.filter((entry) => entry.id !== item.id))
                }
                className="rounded-md border border-line px-2 py-1 text-[11.5px] text-muted transition-colors hover:border-[#ff7a8a]/50 hover:text-[#ff7a8a]"
              >
                {t.keyDelete}
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-[11.5px] leading-relaxed text-dim">{t.keyHint}</p>
    </div>
  );
}
