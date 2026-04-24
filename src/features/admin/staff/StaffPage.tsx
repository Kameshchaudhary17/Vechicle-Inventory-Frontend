import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Search, Pencil, Trash2, ShieldCheck, ShieldOff } from "lucide-react";
import { staffApi } from "../../../services/api/staffApi";
import type { Staff } from "../../../types/staff";
import type { PagedResult } from "../../../types/common";
import { useDebounce } from "../../../hooks/useDebounce";
import { useAuth } from "../../../context/AuthContext";
import Pagination from "../../../components/common/Pagination";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import StaffFormModal from "./StaffFormModal";

export default function StaffPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 400);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [data, setData] = useState<PagedResult<Staff> | null>(null);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [toDelete, setToDelete] = useState<Staff | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await staffApi.list({ search: debounced || undefined, page, pageSize });
      if (res.success && res.data) setData(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to load staff.");
    } finally {
      setLoading(false);
    }
  }, [debounced, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [debounced]);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (s: Staff) => { setEditing(s); setFormOpen(true); };

  const toggleActive = async (s: Staff) => {
    setBusyId(s.id);
    try {
      const res = await staffApi.setActive(s.id, !s.isActive);
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
      const res = await staffApi.remove(toDelete.id);
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
          <h1 className="text-2xl font-bold text-slate-900">Staff Management</h1>
          <p className="text-slate-500">Create, edit, disable or remove staff and admin accounts.</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      <div className="card p-5">
        <div className="relative max-w-md mb-4">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            className="input pl-9" placeholder="Search by name, email, or phone" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100">
                <th className="py-3 px-3 font-medium">Name</th>
                <th className="py-3 px-3 font-medium">Email</th>
                <th className="py-3 px-3 font-medium">Phone</th>
                <th className="py-3 px-3 font-medium">Role</th>
                <th className="py-3 px-3 font-medium">Status</th>
                <th className="py-3 px-3 font-medium">Last Login</th>
                <th className="py-3 px-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && !data ? (
                <tr><td colSpan={7} className="py-10 text-center text-slate-400">Loading…</td></tr>
              ) : data?.items.length === 0 ? (
                <tr><td colSpan={7} className="py-10 text-center text-slate-400">No staff found.</td></tr>
              ) : (
                data?.items.map((s) => {
                  const isSelf = s.id === user?.userId;
                  return (
                    <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                      <td className="py-3 px-3 font-medium text-slate-900">
                        {s.fullName}{isSelf && <span className="ml-2 text-xs text-brand-600">(you)</span>}
                      </td>
                      <td className="py-3 px-3 text-slate-600">{s.email}</td>
                      <td className="py-3 px-3 text-slate-600">{s.phoneNumber}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex text-xs font-medium px-2 py-1 rounded-full ${
                          s.role === "Admin" ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-700"
                        }`}>{s.role}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex text-xs font-medium px-2 py-1 rounded-full ${
                          s.isActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        }`}>{s.isActive ? "Active" : "Disabled"}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {s.lastLoginAt ? new Date(s.lastLoginAt).toLocaleString() : "—"}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => toggleActive(s)} disabled={busyId === s.id || isSelf}
                            title={s.isActive ? "Disable" : "Activate"}
                            className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-40">
                            {s.isActive ? <ShieldOff className="w-4 h-4 text-rose-600" /> : <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                          </button>
                          <button onClick={() => openEdit(s)} className="p-2 rounded-lg hover:bg-slate-100">
                            <Pencil className="w-4 h-4 text-slate-600" />
                          </button>
                          <button onClick={() => setToDelete(s)} disabled={isSelf}
                            className="p-2 rounded-lg hover:bg-rose-50 disabled:opacity-40">
                            <Trash2 className="w-4 h-4 text-rose-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {data && (
          <Pagination page={data.page} totalPages={data.totalPages}
            onChange={(p) => setPage(p)} />
        )}
      </div>

      <StaffFormModal open={formOpen} onClose={() => setFormOpen(false)}
        onSaved={() => { setFormOpen(false); load(); }} editing={editing} />

      <ConfirmDialog
        open={!!toDelete}
        title="Delete staff?"
        message={toDelete ? `Remove "${toDelete.fullName}" permanently? This cannot be undone.` : ""}
        confirmLabel="Delete"
        danger
        loading={!!busyId && busyId === toDelete?.id}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
