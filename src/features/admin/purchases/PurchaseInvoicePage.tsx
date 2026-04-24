import { useMemo, useState } from "react";
import { Plus, Receipt, Truck, TrendingUp, FileText, Search } from "lucide-react";
import PageHeader from "../../../components/common/PageHeader";
import StatCard from "../../../components/common/StatCard";
import EmptyState from "../../../components/common/EmptyState";
import Pagination from "../../../components/common/Pagination";
import { useDebounce } from "../../../hooks/useDebounce";
import { usePurchaseInvoiceList, usePurchaseStats } from "../../../hooks/queries/useInvoices";
import PurchaseInvoiceFormModal from "./PurchaseInvoiceFormModal";

export default function PurchaseInvoicePage() {
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 400);
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);

  const params = useMemo(() => ({ search: debounced || undefined, page, pageSize: 10 }), [debounced, page]);
  const listQuery = usePurchaseInvoiceList(params);
  const statsQuery = usePurchaseStats({ refetchIntervalMs: 20_000 });

  const stats = statsQuery.data?.data;
  const data = listQuery.data?.data;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inventory"
        title="Purchase Invoices"
        subtitle="Record vendor purchases — stock updates automatically."
        actions={
          <button onClick={() => setFormOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> New purchase
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Invoices" value={stats?.totalInvoices ?? 0} icon={FileText} tint="brand" loading={statsQuery.isPending} />
        <StatCard label="Total Spend" value={`NPR ${Number(stats?.totalSpend ?? 0).toLocaleString()}`} icon={TrendingUp} tint="violet" loading={statsQuery.isPending} />
        <StatCard label="This Month" value={`NPR ${Number(stats?.thisMonthSpend ?? 0).toLocaleString()}`} icon={Receipt} tint="emerald" loading={statsQuery.isPending}
          hint={`${stats?.invoicesThisMonth ?? 0} invoices`} />
        <StatCard label="Vendors Supplied" value={stats?.invoicesThisMonth ?? 0} icon={Truck} tint="amber" loading={statsQuery.isPending} />
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input pl-10" placeholder="Search invoice # or vendor…" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100">
                <th className="py-3 px-3 font-medium">Invoice</th>
                <th className="py-3 px-3 font-medium">Vendor</th>
                <th className="py-3 px-3 font-medium">Date</th>
                <th className="py-3 px-3 font-medium">Lines</th>
                <th className="py-3 px-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {listQuery.isPending && !data ? (
                <tr><td colSpan={5} className="py-10 text-center text-slate-400">Loading…</td></tr>
              ) : data?.items.length === 0 ? (
                <tr><td colSpan={5}>
                  <EmptyState icon={Receipt} title="No purchase invoices"
                    message="Record your first vendor purchase to track stock in."
                    action={<button onClick={() => setFormOpen(true)} className="btn-primary"><Plus className="w-4 h-4" /> New purchase</button>} />
                </td></tr>
              ) : (
                data?.items.map((inv) => (
                  <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition">
                    <td className="py-3 px-3 font-bold text-slate-900 display-font tracking-wide">{inv.invoiceNumber}</td>
                    <td className="py-3 px-3 text-slate-700">{inv.vendorName}</td>
                    <td className="py-3 px-3 text-slate-600">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                    <td className="py-3 px-3 text-slate-600">{inv.lineCount}</td>
                    <td className="py-3 px-3 text-right font-bold text-brand-700 tabular-nums">NPR {Number(inv.totalAmount).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />}
      </div>

      <PurchaseInvoiceFormModal open={formOpen} onClose={() => setFormOpen(false)} onSaved={() => setFormOpen(false)} />
    </div>
  );
}
