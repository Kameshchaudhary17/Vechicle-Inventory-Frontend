import { useMemo, useState } from "react";
import { Plus, Receipt, Wallet, TrendingUp, FileText, Search, Mail } from "lucide-react";
import PageHeader from "../../../components/common/PageHeader";
import StatCard from "../../../components/common/StatCard";
import EmptyState from "../../../components/common/EmptyState";
import Pagination from "../../../components/common/Pagination";
import Badge from "../../../components/common/Badge";
import { useDebounce } from "../../../hooks/useDebounce";
import { useSalesInvoiceList, useSalesStats } from "../../../hooks/queries/useInvoices";
import SalesInvoiceFormModal from "./SalesInvoiceFormModal";
import SalesInvoiceDetailDrawer from "./SalesInvoiceDetailDrawer";
import type { PaymentStatus } from "../../../types/invoices";

export default function SalesInvoicePage() {
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 400);
  const [status, setStatus] = useState<PaymentStatus | "">("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const params = useMemo(() => ({
    search: debounced || undefined,
    status: (status || undefined) as PaymentStatus | undefined,
    page, pageSize: 10
  }), [debounced, status, page]);
  const listQuery = useSalesInvoiceList(params);
  const statsQuery = useSalesStats({ refetchIntervalMs: 10_000 });

  const stats = statsQuery.data?.data;
  const data = listQuery.data?.data;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Point of sale"
        title="Sales Invoices"
        subtitle="Record customer sales, apply loyalty discount, email invoices — all live."
        actions={
          <button onClick={() => setFormOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> New sale
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Today's Sales" value={`NPR ${Number(stats?.todaySales ?? 0).toLocaleString()}`} icon={TrendingUp} tint="brand" loading={statsQuery.isPending}
          hint={`${stats?.todayInvoices ?? 0} invoices`} />
        <StatCard label="This Month" value={`NPR ${Number(stats?.monthSales ?? 0).toLocaleString()}`} icon={Receipt} tint="emerald" loading={statsQuery.isPending}
          hint={`${stats?.monthInvoices ?? 0} invoices`} />
        <StatCard label="Pending Credits" value={`NPR ${Number(stats?.pendingCredits ?? 0).toLocaleString()}`} icon={Wallet} tint="rose" loading={statsQuery.isPending}
          hint={`${stats?.pendingCreditInvoices ?? 0} open invoices`} />
        <StatCard label="Total Invoices" value={(stats?.monthInvoices ?? 0) + (stats?.pendingCreditInvoices ?? 0)} icon={FileText} tint="violet" loading={statsQuery.isPending} />
      </div>

      <div className="card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input pl-10" placeholder="Search invoice #, customer name, phone, vehicle…" />
          </div>
          <select value={status} onChange={(e) => { setStatus(e.target.value as PaymentStatus | ""); setPage(1); }}
            className="input sm:w-40">
            <option value="">All status</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Credit">Credit</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100">
                <th className="py-3 px-3 font-medium">Invoice</th>
                <th className="py-3 px-3 font-medium">Customer</th>
                <th className="py-3 px-3 font-medium">Vehicle</th>
                <th className="py-3 px-3 font-medium">Date</th>
                <th className="py-3 px-3 font-medium">Status</th>
                <th className="py-3 px-3 font-medium text-right">Total</th>
                <th className="py-3 px-3 font-medium text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {listQuery.isPending && !data ? (
                <tr><td colSpan={7} className="py-10 text-center text-slate-400">Loading…</td></tr>
              ) : data?.items.length === 0 ? (
                <tr><td colSpan={7}>
                  <EmptyState icon={Receipt} title="No sales yet"
                    message="Create your first sales invoice — stock will deduct automatically."
                    action={<button onClick={() => setFormOpen(true)} className="btn-primary"><Plus className="w-4 h-4" /> New sale</button>} />
                </td></tr>
              ) : (
                data?.items.map((inv) => (
                  <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition cursor-pointer"
                    onClick={() => setDetailId(inv.id)}>
                    <td className="py-3 px-3 font-bold text-slate-900 display-font">{inv.invoiceNumber}</td>
                    <td className="py-3 px-3 text-slate-700">{inv.customerName}</td>
                    <td className="py-3 px-3 text-slate-600 font-mono text-xs">{inv.vehicleNumber ?? "—"}</td>
                    <td className="py-3 px-3 text-slate-600">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                    <td className="py-3 px-3">
                      <Badge tone={inv.paymentStatus === "Paid" ? "emerald" : inv.paymentStatus === "Partial" ? "amber" : "rose"}>
                        {inv.paymentStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 tabular-nums">NPR {Number(inv.totalAmount).toLocaleString()}</td>
                    <td className="py-3 px-3 text-right tabular-nums">
                      {inv.balanceDue > 0 ? <span className="text-rose-600 font-semibold">NPR {Number(inv.balanceDue).toLocaleString()}</span> : <span className="text-slate-400">—</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />}
      </div>

      <div className="text-xs text-slate-400 flex items-center gap-1.5">
        <Mail className="w-3 h-3" /> Click any invoice row to open details and email it to the customer.
      </div>

      <SalesInvoiceFormModal open={formOpen} onClose={() => setFormOpen(false)} onSaved={() => setFormOpen(false)} />
      <SalesInvoiceDetailDrawer invoiceId={detailId} onClose={() => setDetailId(null)} />
    </div>
  );
}
