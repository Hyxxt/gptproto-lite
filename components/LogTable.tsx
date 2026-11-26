"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/dictionaries";
import type { LogRow, LogStatus } from "@/lib/usage";

export type LogRowView = LogRow & { timeLabel: string };

type Props = {
  rows: LogRowView[];
  t: Dictionary["consolePage"];
};

const PAGE_SIZE = 8;

const statusTone: Record<LogStatus, string> = {
  ok: "border-mint/30 bg-mint/10 text-mint",
  slow: "border-[#ffb27a]/30 bg-[#ffb27a]/10 text-[#ffb27a]",
  limited: "border-[#ff7a8a]/30 bg-[#ff7a8a]/10 text-[#ff7a8a]",
};

function thousands(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function LogTable({ rows, t }: Props) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const start = page * PAGE_SIZE;
  const visible = rows.slice(start, start + PAGE_SIZE);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line">
              {[
                t.table.time,
                t.table.model,
                t.table.endpoint,
                t.table.tokens,
                t.table.latency,
                t.table.status,
              ].map((head) => (
                <th
                  key={head}
                  className="pb-2.5 text-[11px] font-medium uppercase tracking-wider text-dim"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr
                key={row.id}
                className="border-b border-line/60 last:border-0 hover:bg-panel2/40"
              >
                <td className="py-2.5 font-mono text-[11.5px] text-muted">
                  {row.timeLabel}
                </td>
                <td className="py-2.5 font-mono text-[11.5px] text-ink">
                  {row.model}
                </td>
                <td className="py-2.5 font-mono text-[11.5px] text-dim">
                  {row.endpoint}
                </td>
                <td className="py-2.5 font-mono text-[11.5px] text-muted">
                  {thousands(row.tokens)}
                </td>
                <td className="py-2.5 font-mono text-[11.5px] text-muted">
                  {(row.latencyMs / 1000).toFixed(2)}s
                </td>
                <td className="py-2.5">
                  <span
                    className={`inline-block rounded border px-1.5 py-0.5 text-[10.5px] ${statusTone[row.status]}`}
                  >
                    {t.status[row.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <p className="py-8 text-center text-[13px] text-dim">{t.logsEmpty}</p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <span className="font-mono text-[11.5px] text-dim">
          {t.page} {page + 1} {t.pageOf} {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-md border border-line px-2.5 py-1 text-[11.5px] text-muted transition-colors hover:border-line2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t.prev}
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="rounded-md border border-line px-2.5 py-1 text-[11.5px] text-muted transition-colors hover:border-line2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t.next}
          </button>
        </div>
      </div>
    </div>
  );
}
