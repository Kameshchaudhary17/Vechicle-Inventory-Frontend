import { useMemo, useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, FileText, BarChart3 } from "lucide-react";
import PageHeader from "../../../components/common/PageHeader";
import StatCard from "../../../components/common/StatCard";
import { useFinancialReport } from "../../../hooks/queries/useReports";
import type { ReportBucket } from "../../../types/reports";

export default function FinancialReportPage() {
  const [bucket, setBucket] = useState<ReportBucket>("Day");
  const { data, isPending } = useFinancialReport(bucket);
  const r = data?.data;

  const maxVal = useMemo(() => {
    if (!r) return 1;
    return Math.max(1, ...r.series.flatMap((p) => [p.revenue, p.cost]));
  }, [r]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance"
        title="Financial Reports"
        subtitle="Revenue, cost, and profit over time. Live — updates as sales and purchases land."
        actions={
          <div className="inline-flex rounded-xl overflow-hidden border border-slate-200 bg-white">
            {(["Day", "Month", "Year"] as ReportBucket[]).map((b) => (
              <button key={b} onClick={() => setBucket(b)}
                className={`px-4 py-2 text-sm font-semibold transition ${bucket === b ? "bg-brand-600 text-white" : "text-slate-700 hover:bg-slate-50"}`}>
                {b}ly
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Revenue" value={`NPR ${Number(r?.totalRevenue ?? 0).toLocaleString()}`} icon={TrendingUp} tint="emerald" loading={isPending} />
        <StatCard label="Cost" value={`NPR ${Number(r?.totalCost ?? 0).toLocaleString()}`} icon={TrendingDown} tint="rose" loading={isPending} />
        <StatCard label="Gross Profit" value={`NPR ${Number(r?.grossProfit ?? 0).toLocaleString()}`} icon={DollarSign} tint="brand" loading={isPending} />
        <StatCard label="Invoices" value={r?.invoiceCount ?? 0} icon={FileText} tint="violet" loading={isPending} />
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-brand-600" />
          <h3 className="display-font font-bold text-lg text-slate-900">Revenue vs Cost</h3>
        </div>
        {isPending ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading chart…</div>
        ) : r?.series.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">No data in this range yet.</div>
        ) : (
          <div className="space-y-3">
            {r?.series.map((p) => (
              <div key={p.label} className="grid grid-cols-12 gap-3 items-center text-sm">
                <div className="col-span-2 text-xs font-mono text-slate-500">{p.label}</div>
                <div className="col-span-7 space-y-1">
                  <Bar value={p.revenue} max={maxVal} color="bg-emerald-500" />
                  <Bar value={p.cost} max={maxVal} color="bg-rose-400" />
                </div>
                <div className="col-span-3 text-right tabular-nums">
                  <div className="text-emerald-700 font-semibold">NPR {p.revenue.toLocaleString()}</div>
                  <div className="text-rose-600 text-xs">NPR {p.cost.toLocaleString()}</div>
                  <div className={`text-xs font-semibold ${p.profit >= 0 ? "text-brand-700" : "text-rose-600"}`}>
                    {p.profit >= 0 ? "+" : ""}NPR {p.profit.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}
