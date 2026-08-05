"use client";

import type { CopilotFlag } from "@/types";

interface Props {
  flags: CopilotFlag[];
  isLoading: boolean;
}

const SEVERITY = {
  error: {
    dot: "bg-red-500",
    badge: "bg-red-900/30 text-red-400 border border-red-800",
    label: "Missing",
    card: "border-red-900/50 bg-red-950/20",
  },
  warning: {
    dot: "bg-yellow-500",
    badge: "bg-yellow-900/30 text-yellow-400 border border-yellow-800",
    label: "Warning",
    card: "border-yellow-900/50 bg-yellow-950/20",
  },
  info: {
    dot: "bg-blue-500",
    badge: "bg-blue-900/30 text-blue-400 border border-blue-800",
    label: "Tip",
    card: "border-blue-900/50 bg-blue-950/20",
  },
};

export default function CopilotSidebar({ flags, isLoading }: Props) {
  const errors = flags.filter((f) => f.severity === "error").length;
  const warnings = flags.filter((f) => f.severity === "warning").length;

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">UX Copilot</span>
          {flags.length > 0 && (
            <span className="rounded-full bg-zinc-700 px-2 py-0.5 text-[10px] text-zinc-300">
              {flags.length}
            </span>
          )}
        </div>
        {flags.length > 0 && (
          <div className="flex gap-2 text-[10px]">
            {errors > 0 && <span className="text-red-400">{errors} missing</span>}
            {warnings > 0 && <span className="text-yellow-400">{warnings} warnings</span>}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoading && (
          <div className="flex items-center justify-center gap-2 pt-8 text-xs text-zinc-500">
            <div className="h-4 w-4 animate-spin rounded-full border border-indigo-500 border-t-transparent" />
            Analysing your UI…
          </div>
        )}

        {!isLoading && flags.length === 0 && (
          <div className="pt-8 text-center text-xs text-zinc-600">
            <p>No issues found.</p>
            <p className="mt-1">Generate a layout to see UX audit results.</p>
          </div>
        )}

        {flags.map((flag) => {
          const s = SEVERITY[flag.severity];
          return (
            <div key={flag.id} className={`rounded-lg border p-3 ${s.card}`}>
              <div className="flex items-start gap-2">
                <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${s.dot}`} />
                <div className="min-w-0">
                  <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold ${s.badge} mb-1`}>
                    {s.label}
                  </span>
                  <p className="text-xs text-zinc-300">{flag.message}</p>
                  <p className="mt-1 text-xs text-zinc-500">{flag.suggestion}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
