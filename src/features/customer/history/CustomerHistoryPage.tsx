import { useEffect, useState } from "react";
import { History, Receipt, Wallet, Calendar, Mail } from "lucide-react";
import PageHeader from "../../../components/common/PageHeader";
import StatCard from "../../../components/common/StatCard";
import Badge from "../../../components/common/Badge";
import { useAuth } from "../../../context/AuthContext";
import { customerApi } from "../../../services/api/customerApi";
import { useCustomerHistory } from "../../../hooks/queries/useReports";

export default function CustomerHistoryPage() {
  const { user } = useAuth();
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Customer role — find linked customer profile by searching their phone/email.
    // (Simplified: backend resolves via linked UserId for engagement endpoints.
    //  For history we need explicit id, so ask backend via a customer list search.)
    (async () => {
      if (!user) return;
      try {
        const email = user.email;
        const res = await customerApi.list({ search: email, pageSize: 1 });
        const match = res.data?.items[0];
        setCustomerId(match?.id ?? null);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, [user]);

  const historyQuery = useCustomerHistory(customerId ?? undefined);
  const h = historyQuery.data?.data;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="History" title="Your Purchase History" subtitle="All your past invoices, balances and activity." />

      {loading ? (
        <div className="card p-6 text-sm text-slate-500">Loading…</div>
      ) : !customerId ? (
        <div className="card p-6 text-sm text-slate-500">
          No customer profile linked yet. Staff will register you — or check back after your first purchase.
        </div>
      ) : !h ? (
        <div className="card p-6 text-sm text-slate-500">Loading your history…</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard label="Total Purchases" value={h.totalPurchases} icon={Receipt} tint="brand" />
            <StatCard label="Total Spent" value={`NPR ${Number(h.totalSpent).toLocaleString()}`} icon={Receipt} tint="emerald" />
            <StatCard label="Outstanding" value={`NPR ${Number(h.outstandingBalance).toLocaleString()}`} icon={Wallet} tint={h.outstandingBalance > 0 ? "rose" : "emerald"} />
            <StatCard label="Last Purchase" value={h.lastPurchaseAt ? new Date(h.lastPurchaseAt).toLocaleDateString() : "—"} icon={Calendar} tint="violet" />
          </div>

          <div className="card p-6">
            <h3 className="display-font font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-brand-600" /> Invoices
            </h3>
            {h.invoices.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-500">No purchases yet.</div>
            ) : (
              <ul className="space-y-2">
                {h.invoices.map((inv) => (
                  <li key={inv.id} className="border border-slate-100 rounded-2xl p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-slate-900 display-font">{inv.invoiceNumber}</div>
                        <Badge tone={inv.paymentStatus === "Paid" ? "emerald" : inv.paymentStatus === "Partial" ? "amber" : "rose"}>
                          {inv.paymentStatus}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {new Date(inv.invoiceDate).toLocaleDateString()} · {inv.lineCount} line(s)
                        {inv.vehicleNumber && ` · ${inv.vehicleNumber}`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900 tabular-nums">NPR {Number(inv.totalAmount).toLocaleString()}</div>
                      {inv.balanceDue > 0 && <div className="text-xs text-rose-600 font-semibold">Due NPR {Number(inv.balanceDue).toLocaleString()}</div>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Mail className="w-3 h-3" /> Need an invoice copy? Ask staff to resend via email.
          </div>
        </>
      )}
    </div>
  );
}
