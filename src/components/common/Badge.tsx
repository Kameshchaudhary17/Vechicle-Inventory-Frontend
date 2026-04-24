import type { ReactNode } from "react";

const tones: Record<string, string> = {
  emerald: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  rose: "bg-rose-100 text-rose-700 ring-rose-200",
  amber: "bg-amber-100 text-amber-800 ring-amber-200",
  brand: "bg-brand-100 text-brand-700 ring-brand-200",
  slate: "bg-slate-100 text-slate-700 ring-slate-200"
};

export default function Badge({ tone = "slate", children }: { tone?: keyof typeof tones; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ring-1 ring-inset ${tones[tone]}`}>
      {children}
    </span>
  );
}
