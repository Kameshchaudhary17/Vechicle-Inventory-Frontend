import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Search, Pencil, Trash2, ShieldCheck, ShieldOff, Tag } from "lucide-react";
import { categoryApi } from "../../../services/api/categoryApi";
import type { Category } from "../../../types/category";
import type { PagedResult } from "../../../types/common";
import { useDebounce } from "../../../hooks/useDebounce";
import Pagination from "../../../components/common/Pagination";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import EmptyState from "../../../components/common/EmptyState";
import Badge from "../../../components/common/Badge";
import CategoryFormModal from "./CategoryFormModal";

export default function CategoryPage() {
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 400);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PagedResult<Category> | null>(null);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await categoryApi.list({ search: debounced || undefined, page, pageSize: 20 });
      if (res.success && res.data) setData(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }, [debounced, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [debounced]);

  const toggleActive = async (c: Category) => {
    setBusyId(c.id);
    try {
      const res = await categoryApi.setActive(c.id, !c.isActive);
      if (res.success) { toast.success(res.message ?? "Updated."); load(); }
      else toast.error(res.message ?? "Failed.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed.");
    } finally { setBusyId(null); }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setBusyId(toDelete.id);
    try {
      const res = await categoryApi.remove(toDelete.id);
      if (res.success) { toast.success(res.message ?? "Deleted."); setToDelete(null); load(); }
      else toast.error(res.message ?? "Delete failed.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Delete failed.");
    } finally { setBusyId(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="display-font text-2xl font-bold text-slate-900">Categories</h1>
          <p className="text-slate-500 text-sm">Group parts by category for easier browsing and reports.</p>
        </div>
        <button onClick={() => { setEditing(null); setFormOpen(true); }} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="card p-5">
        <div className="relative max-w-md mb-5">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            className="input pl-10" placeholder="Search categories" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100">
                <th className="py-3 px-3 font-medium">Name</th>
                <th className="py-3 px-3 font-medium">Parts</th>
                <th className="py-3 px-3 font-medium">Status</th>
                <th className="py-3 px-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && !data ? (
                <tr><td colSpan={4} className="py-10 text-center text-slate-400">Loading…</td></tr>
              ) : data?.items.length === 0 ? (
                <tr><td colSpan={4}>
                  <EmptyState icon={Tag} title="No categories yet"
                    message="Create your first category to group parts."
                    action={<button onClick={() => setFormOpen(true)} className="btn-primary"><Plus className="w-4 h-4" /> Add Category</button>} />
                </td></tr>
              ) : (
                data?.items.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{c.name}</div>
                      {c.description && <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{c.description}</div>}
                    </td>
                    <td className="py-3 px-3">
                      <Badge tone={c.partsCount > 0 ? "brand" : "slate"}>{c.partsCount}</Badge>
                    </td>
                    <td className="py-3 px-3">
                      {c.isActive
                        ? <Badge tone="emerald">Active</Badge>
                        : <Badge tone="rose">Inactive</Badge>}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => toggleActive(c)} disabled={busyId === c.id}
                          className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-40"
                          title={c.isActive ? "Deactivate" : "Activate"}>
                          {c.isActive ? <ShieldOff className="w-4 h-4 text-rose-600" />
                            : <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                        </button>
                        <button onClick={() => { setEditing(c); setFormOpen(true); }}
                          className="p-2 rounded-lg hover:bg-slate-100"><Pencil className="w-4 h-4 text-slate-600" /></button>
                        <button onClick={() => setToDelete(c)} disabled={c.partsCount > 0}
                          className="p-2 rounded-lg hover:bg-rose-50 disabled:opacity-30"
                          title={c.partsCount > 0 ? "Remove parts first" : "Delete"}>
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

      <CategoryFormModal open={formOpen} onClose={() => setFormOpen(false)}
        onSaved={() => { setFormOpen(false); load(); }} editing={editing} />

      <ConfirmDialog
        open={!!toDelete}
        title="Delete category?"
        message={toDelete ? `Remove "${toDelete.name}"? This cannot be undone.` : ""}
        confirmLabel="Delete"
        danger
        loading={!!busyId && busyId === toDelete?.id}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
