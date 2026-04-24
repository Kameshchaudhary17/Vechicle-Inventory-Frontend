import { Crown, Users, Wallet, Phone, Mail } from "lucide-react";
import PageHeader from "../../../components/common/PageHeader";
import { useCustomerInsights } from "../../../hooks/queries/useReports";

export default function CustomerInsightsPage() {
  const { data, isPending } = useCustomerInsights(10, { refetchIntervalMs: 30_000 });
  const d = data?.data;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reports"
        title="Customer Insights"
        subtitle="Regulars, top spenders, and outstanding credits — auto-refreshed."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="Top Spenders" icon={Crown} tint="text-amber-600">
          {isPending ? <Loading /> : d?.topSpenders.length === 0 ? <Empty text="No sales yet." /> : (
            <ol className="space-y-2">
              {d!.topSpenders.map((c, i) => (
                <li key={c.customerId} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50">
                  <Rank n={i + 1} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 truncate">{c.fullName}</div>
                    <div className="text-xs text-slate-500">{c.phoneNumber} · {c.purchaseCount} purchases</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900 tabular-nums">NPR {Number(c.totalSpent).toLocaleString()}</div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Panel>

        <Panel title="Regulars" icon={Users} tint="text-brand-600">
          {isPending ? <Loading /> : d?.regulars.length === 0 ? <Empty text="No repeat customers yet." /> : (
            <ol className="space-y-2">
              {d!.regulars.map((c, i) => (
                <li key={c.customerId} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50">
                  <Rank n={i + 1} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 truncate">{c.fullName}</div>
                    <div className="text-xs text-slate-500">{c.phoneNumber}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-brand-700 tabular-nums">{c.purchaseCount}</div>
                    <div className="text-[10px] text-slate-500">purchases</div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      </div>

      <Panel title="Pending Credits" icon={Wallet} tint="text-rose-600">
        {isPending ? <Loading /> : d?.pendingCredits.length === 0 ? <Empty text="All accounts are clean. 🎉" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="py-2 px-3 font-medium">Customer</th>
                  <th className="py-2 px-3 font-medium">Contact</th>
                  <th className="py-2 px-3 font-medium text-right">Open</th>
                  <th className="py-2 px-3 font-medium">Oldest</th>
                  <th className="py-2 px-3 font-medium text-right">Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {d!.pendingCredits.map((c) => (
                  <tr key={c.customerId} className="border-b border-slate-50">
                    <td className="py-2 px-3 font-semibold text-slate-900">{c.fullName}</td>
                    <td className="py-2 px-3 text-xs text-slate-600">
                      <div className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phoneNumber}</div>
                      {c.email && <div className="flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3" />{c.email}</div>}
                    </td>
                    <td className="py-2 px-3 text-right">{c.openInvoices}</td>
                    <td className="py-2 px-3">
                      <span className={c.daysOldest > 30 ? "text-rose-600 font-semibold" : "text-slate-600"}>
                        {c.daysOldest}d ago
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-rose-600 tabular-nums">NPR {Number(c.outstandingBalance).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

function Panel({ title, icon: Icon, tint, children }: { title: string; icon: typeof Crown; tint: string; children: React.ReactNode }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`w-5 h-5 ${tint}`} />
        <h3 className="display-font font-bold text-lg text-slate-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Rank({ n }: { n: number }) {
  const tone = n === 1 ? "bg-amber-100 text-amber-700" : n === 2 ? "bg-slate-100 text-slate-700" : n === 3 ? "bg-orange-100 text-orange-700" : "bg-slate-50 text-slate-500";
  return <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${tone}`}>{n}</div>;
}

function Loading() { return <div className="py-6 text-center text-slate-400 text-sm">Loading…</div>; }
function Empty({ text }: { text: string }) { return <div className="py-6 text-center text-slate-500 text-sm">{text}</div>; }
