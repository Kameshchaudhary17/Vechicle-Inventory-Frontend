import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Plus, Search, Pencil, Trash2, ShieldCheck, ShieldOff,
  Truck, CheckCircle2, XCircle, Mail, Phone, User
} from "lucide-react";
import { vendorApi } from "../../../services/api/vendorApi";
import type { Vendor, VendorStats } from "../../../types/vendor";
import type { PagedResult } from "../../../types/common";
import { useDebounce } from "../../../hooks/useDebounce";
import StatCard from "../../../components/common/StatCard";
import Pagination from "../../../components/common/Pagination";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import EmptyState from "../../../components/common/EmptyState";
import Badge from "../../../components/common/Badge";
import VendorFormModal from "./VendorFormModal";

export default function VendorPage() {
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 400);
  const [activeOnly, setActiveOnly] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [data, setData] = useState<PagedResult<Vendor> | null>(null);
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [loading, setLoading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [toDelete, setToDelete] = useState<Vendor | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await vendorApi.list({
        search: debounced || undefined,
        activeOnly: activeOnly || undefined,
        page, pageSize
      });
      if (res.success && res.data) setData(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to load vendors.");
    } finally {
      setLoading(false);
    }
  }, [debounced, activeOnly, page]);

  const loadStats = useCallback(async () => {
    try {
      const res = await vendorApi.stats();
      if (res.success && res.data) setStats(res.data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { loadList(); }, [loadList]);
  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { setPage(1); }, [debounced, activeOnly]);

  const refresh = () => { loadList(); loadStats(); };

  const toggleActive = async (v: Vendor) => {
    setBusyId(v.id);
    try {
      const res = await vendorApi.setActive(v.id, !v.isActive);
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
      const res = await vendorApi.remove(toDelete.id);
      if (res.success) { toast.success(res.message ?? "Deleted."); setToDelete(null); refresh(); }
      else toast.error(res.message ?? "Delete failed.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Delete failed.");
    } finally { setBusyId(null); }
  };

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (v: Vendor) => { setEditing(v); setFormOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="display-font text-2xl font-bold text-slate-900">Vendors</h1>
          <p className="text-slate-500 text-sm">Manage your parts suppliers and their contact details.</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Vendor
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Vendors" value={stats?.total ?? "—"} icon={Truck} tint="brand" />
        <StatCard label="Active" value={stats?.active ?? "—"} icon={CheckCircle2} tint="emerald" />
        <StatCard label="Inactive" value={stats?.inactive ?? "—"} icon={XCircle} tint="rose" />
      </div>

      <div className="card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              className="input pl-10" placeholder="Search by name, phone, email, contact…" />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
            <input type="checkbox" checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-200" />
            Active only
          </label>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100">
                <th className="py-3 px-3 font-medium">Vendor</th>
                <th className="py-3 px-3 font-medium">Contact</th>
                <th className="py-3 px-3 font-medium">PAN</th>
                <th className="py-3 px-3 font-medium">Status</th>
                <th className="py-3 px-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && !data ? (
                <tr><td colSpan={5} className="py-10 text-center text-slate-400">Loading vendors…</td></tr>
              ) : data?.items.length === 0 ? (
                <tr><td colSpan={5}>
                  <EmptyState icon={Truck} title="No vendors yet"
                    message="Add your first vendor to start creating purchase invoices."
                    action={<button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Add Vendor</button>} />
                </td></tr>
              ) : (
                data?.items.map((v) => (
                  <tr key={v.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{v.name}</div>
                      {v.address && <div className="text-xs text-slate-500 mt-0.5">{v.address}</div>}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col gap-0.5 text-xs text-slate-600">
                        <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" />{v.phoneNumber}</span>
                        {v.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" />{v.email}</span>}
                        {v.contactPerson && <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-slate-400" />{v.contactPerson}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{v.panNumber ?? "—"}</td>
                    <td className="py-3 px-3">
                      {v.isActive
                        ? <Badge tone="emerald"><CheckCircle2 className="w-3 h-3" /> Active</Badge>
                        : <Badge tone="rose"><XCircle className="w-3 h-3" /> Inactive</Badge>}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => toggleActive(v)} disabled={busyId === v.id}
                          title={v.isActive ? "Deactivate" : "Activate"}
                          className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-40">
                          {v.isActive ? <ShieldOff className="w-4 h-4 text-rose-600" />
                            : <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                        </button>
                        <button onClick={() => openEdit(v)} className="p-2 rounded-lg hover:bg-slate-100" title="Edit">
                          <Pencil className="w-4 h-4 text-slate-600" />
                        </button>
                        <button onClick={() => setToDelete(v)}
                          className="p-2 rounded-lg hover:bg-rose-50" title="Delete">
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

        <div className="md:hidden space-y-3">
          {loading && !data ? (
            <div className="py-10 text-center text-slate-400">Loading vendors…</div>
          ) : data?.items.length === 0 ? (
            <EmptyState icon={Truck} title="No vendors yet" message="Add your first vendor."
              action={<button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Add Vendor</button>} />
          ) : (
            data?.items.map((v) => (
              <div key={v.id} className="border border-slate-100 rounded-xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 truncate">{v.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> {v.phoneNumber}
                    </div>
                    {v.email && <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> {v.email}
                    </div>}
                  </div>
                  {v.isActive
                    ? <Badge tone="emerald">Active</Badge>
                    : <Badge tone="rose">Inactive</Badge>}
                </div>
                <div className="flex justify-end gap-1 mt-3">
                  <button onClick={() => toggleActive(v)} disabled={busyId === v.id}
                    className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-40">
                    {v.isActive ? <ShieldOff className="w-4 h-4 text-rose-600" />
                      : <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                  </button>
                  <button onClick={() => openEdit(v)} className="p-2 rounded-lg hover:bg-slate-100">
                    <Pencil className="w-4 h-4 text-slate-600" />
                  </button>
                  <button onClick={() => setToDelete(v)} className="p-2 rounded-lg hover:bg-rose-50">
                    <Trash2 className="w-4 h-4 text-rose-600" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {data && <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />}
      </div>

      <VendorFormModal open={formOpen} onClose={() => setFormOpen(false)}
        onSaved={() => { setFormOpen(false); refresh(); }} editing={editing} />

      <ConfirmDialog
        open={!!toDelete}
        title="Delete vendor?"
        message={toDelete ? `Remove "${toDelete.name}" permanently? This cannot be undone.` : ""}
        confirmLabel="Delete"
        danger
        loading={!!busyId && busyId === toDelete?.id}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
