import type { LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";

type Tint = "brand" | "emerald" | "amber" | "rose" | "violet" | "sky";

const tintMap: Record<Tint, { iconBg: string; bar: string; ring: string }> = {
  brand:   { iconBg: "bg-brand-100 text-brand-700",     bar: "from-brand-400 to-brand-600",   ring: "ring-brand-100" },
  emerald: { iconBg: "bg-emerald-100 text-emerald-700", bar: "from-emerald-400 to-emerald-600", ring: "ring-emerald-100" },
  amber:   { iconBg: "bg-amber-100 text-amber-700",     bar: "from-amber-400 to-amber-600",   ring: "ring-amber-100" },
  rose:    { iconBg: "bg-rose-100 text-rose-700",       bar: "from-rose-400 to-rose-600",     ring: "ring-rose-100" },
  violet:  { iconBg: "bg-violet-100 text-violet-700",   bar: "from-violet-400 to-violet-600", ring: "ring-violet-100" },
  sky:     { iconBg: "bg-sky-100 text-sky-700",         bar: "from-sky-400 to-sky-600",       ring: "ring-sky-100" }
};

export default function StatCard({
  label, value, icon: Icon, tint = "brand", hint, loading, trend
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tint?: Tint;
  hint?: string;
  loading?: boolean;
  trend?: { delta: number; label?: string };
}) {
  const t = tintMap[tint];
  const trendUp = trend && trend.delta >= 0;

  return (
    <div className="relative card p-5 overflow-hidden group">
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${t.bar} opacity-80`} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-medium text-slate-500 uppercase tracking-wide">{label}</div>
          <div className="mt-2 flex items-baseline gap-2">
            {loading ? (
              <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
            ) : (
              <span className="text-3xl font-extrabold text-slate-900 display-font tabular-nums">{value}</span>
            )}
            {trend && !loading && (
              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                trendUp ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
              }`}>
                {trendUp ? "+" : ""}{trend.delta}{trend.label ? ` ${trend.label}` : "%"}
              </span>
            )}
          </div>
          {hint && <div className="mt-1 text-xs text-slate-500 truncate">{hint}</div>}
        </div>
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ring-4 ${t.iconBg} ${t.ring} shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
