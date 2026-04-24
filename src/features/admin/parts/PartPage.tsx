import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Plus, Search, Pencil, Trash2, ShieldCheck, ShieldOff,
  Package, AlertTriangle, TrendingUp, CheckCircle2
} from "lucide-react";
import { partApi } from "../../../services/api/partApi";
import { partImageUrl } from "../../../lib/utils/imageUrl";
import { categoryApi } from "../../../services/api/categoryApi";
import type { Part, PartStats } from "../../../types/part";
import type { CategoryLookup } from "../../../types/category";
import type { PagedResult } from "../../../types/common";
import { useDebounce } from "../../../hooks/useDebounce";
import { formatNPR, formatInt } from "../../../lib/utils/format";
import StatCard from "../../../components/common/StatCard";
import Pagination from "../../../components/common/Pagination";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import EmptyState from "../../../components/common/EmptyState";
import Badge from "../../../components/common/Badge";
import PartFormModal from "./PartFormModal";

export default function PartPage() {
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 400);
  const [categoryId, setCategoryId] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [activeOnly, setActiveOnly] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [data, setData] = useState<PagedResult<Part> | null>(null);
  const [stats, setStats] = useState<PartStats | null>(null);
  const [cats, setCats] = useState<CategoryLookup[]>([]);
  const [loading, setLoading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Part | null>(null);
  const [toDelete, setToDelete] = useState<Part | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [listKey, setListKey] = useState(0);

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await partApi.list({
        search: debounced || undefined,
        categoryId: categoryId || undefined,
        lowStockOnly: lowStockOnly || undefined,
        activeOnly: activeOnly || undefined,
        page, pageSize
      });
      if (res.success && res.data) setData(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to load parts.");
    } finally {
      setLoading(false);
    }
  }, [debounced, categoryId, lowStockOnly, activeOnly, page, listKey]);

  const loadStats = useCallback(async () => {
    try {
      const res = await partApi.stats();
      if (res.success && res.data) setStats(res.data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadList(); }, [loadList]);
  useEffect(() => { loadStats(); categoryApi.lookup().then((r) => setCats(r.data ?? [])).catch(() => {}); }, [loadStats]);
  useEffect(() => { setPage(1); }, [debounced, categoryId, lowStockOnly, activeOnly]);

  const refresh = () => { setListKey((k) => k + 1); loadStats(); };

  const toggleActive = async (p: Part) => {
    setBusyId(p.id);
    try {
      const res = await partApi.setActive(p.id, !p.isActive);
      if (res.success) { toast.success(res.message ?? "Updated."); refresh(); }
      else toast.error(res.message ?? "Failed.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed.");
    } finally { setBusyId(null); }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setBusyId(toDelete.id);
    try {
      const res = await partApi.remove(toDelete.id);
      if (res.success) { toast.success(res.message ?? "Deleted."); setToDelete(null); refresh(); }
      else toast.error(res.message ?? "Delete failed.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Delete failed.");
    } finally { setBusyId(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="display-font text-2xl font-bold text-slate-900">Parts</h1>
          <p className="text-slate-500 text-sm">All vehicle parts in your inventory. Stock updates via purchase invoices.</p>
        </div>
        <button onClick={() => { setEditing(null); setFormOpen(true); }} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Part
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Parts" value={formatInt(stats?.total)} icon={Package} tint="brand" />
        <StatCard label="Active" value={formatInt(stats?.active)} icon={CheckCircle2} tint="emerald" />
        <StatCard label="Low Stock" value={formatInt(stats?.lowStock)} icon={AlertTriangle} tint="amber" />
        <StatCard label="Inventory Value"
          value={stats ? formatNPR(stats.inventoryValue) : "—"} icon={TrendingUp} tint="rose" />
      </div>

      <div className="card p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              className="input pl-10" placeholder="Search by code, name or brand" />
          </div>
          <select className="input max-w-xs" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">All categories</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-200" />
              Low stock
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-200" />
              Active only
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100">
                <th className="py-3 px-3 font-medium w-14"></th>
                <th className="py-3 px-3 font-medium">Code</th>
                <th className="py-3 px-3 font-medium">Part</th>
                <th className="py-3 px-3 font-medium">Category</th>
                <th className="py-3 px-3 font-medium text-right">Price</th>
                <th className="py-3 px-3 font-medium text-right">Stock</th>
                <th className="py-3 px-3 font-medium">Status</th>
                <th className="py-3 px-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && !data ? (
                <tr><td colSpan={8} className="py-10 text-center text-slate-400">Loading parts…</td></tr>
              ) : data?.items.length === 0 ? (
                <tr><td colSpan={8}>
                  <EmptyState icon={Package} title="No parts found"
                    message="Create categories first, then add parts to them."
                    action={<button onClick={() => setFormOpen(true)} className="btn-primary"><Plus className="w-4 h-4" /> Add Part</button>} />
                </td></tr>
              ) : (
                data?.items.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                    <td className="py-3 px-3">
                      {partImageUrl(p.imagePath) ? (
                        <img src={partImageUrl(p.imagePath)!} alt={p.name}
                          className="w-10 h-10 object-cover rounded-lg border border-slate-100" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Package className="w-5 h-5 text-slate-300" />
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-slate-700">{p.code}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{p.name}</div>
                      {p.brand && <div className="text-xs text-slate-500">{p.brand}</div>}
                    </td>
                    <td className="py-3 px-3 text-slate-600">{p.categoryName}</td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-900">{formatNPR(p.sellPrice)}</td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex flex-col items-end">
                        <span className={`font-semibold ${p.isLowStock ? "text-rose-600" : "text-slate-900"}`}>
                          {p.stockQty} <span className="text-xs font-normal text-slate-500">{p.unit}</span>
                        </span>
                        {p.isLowStock && <span className="text-[10px] text-rose-600 font-medium">Low (&lt; {p.reorderLevel})</span>}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {p.isActive
                        ? <Badge tone="emerald">Active</Badge>
                        : <Badge tone="rose">Inactive</Badge>}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => toggleActive(p)} disabled={busyId === p.id}
                          className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-40"
                          title={p.isActive ? "Deactivate" : "Activate"}>
                          {p.isActive ? <ShieldOff className="w-4 h-4 text-rose-600" />
                            : <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                        </button>
                        <button onClick={() => { setEditing(p); setFormOpen(true); }}
                          className="p-2 rounded-lg hover:bg-slate-100"><Pencil className="w-4 h-4 text-slate-600" /></button>
                        <button onClick={() => setToDelete(p)} disabled={p.stockQty > 0}
                          className="p-2 rounded-lg hover:bg-rose-50 disabled:opacity-30"
                          title={p.stockQty > 0 ? "Has stock — deactivate instead" : "Delete"}>
                          <Trash2 className="w-4 h-4 text-rose-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />}
      </div>

      <PartFormModal open={formOpen} onClose={() => setFormOpen(false)}
        onSaved={() => { setFormOpen(false); refresh(); }} editing={editing} />

      <ConfirmDialog
        open={!!toDelete}
        title="Delete part?"
        message={toDelete ? `Remove "${toDelete.name}" (${toDelete.code}) permanently?` : ""}
        confirmLabel="Delete"
        danger
        loading={!!busyId && busyId === toDelete?.id}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
