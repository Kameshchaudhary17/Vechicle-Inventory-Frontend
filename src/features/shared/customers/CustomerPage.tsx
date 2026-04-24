import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Plus, Search, Pencil, Trash2, ShieldCheck, ShieldOff,
  Users, CheckCircle2, XCircle, Car, Phone, Mail, ExternalLink
} from "lucide-react";
import { useDebounce } from "../../../hooks/useDebounce";
import StatCard from "../../../components/common/StatCard";
import Pagination from "../../../components/common/Pagination";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import EmptyState from "../../../components/common/EmptyState";
import Badge from "../../../components/common/Badge";
import PageHeader from "../../../components/common/PageHeader";
import { useCustomerList, useCustomerStats, useCustomerMutations, useCustomer } from "../../../hooks/queries/useCustomers";
import type { CustomerListItem } from "../../../types/customer";
import CustomerFormModal from "./CustomerFormModal";
import CustomerDetailDrawer from "./CustomerDetailDrawer";

export default function CustomerPage({ canDelete = true }: { canDelete?: boolean }) {
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 400);
  const [activeOnly, setActiveOnly] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const params = useMemo(() => ({
    search: debounced || undefined,
    activeOnly: activeOnly || undefined,
    page,
    pageSize
  }), [debounced, activeOnly, page]);

  const listQuery = useCustomerList(params);
  const statsQuery = useCustomerStats({ refetchIntervalMs: 15_000 });

  const { setActive, remove } = useCustomerMutations();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<CustomerListItem | null>(null);

  const editingCustomer = useCustomer(editingId ?? undefined);

  useEffect(() => { setPage(1); }, [debounced, activeOnly]);

  const stats = statsQuery.data?.data;
  const data = listQuery.data?.data;

  const toggleActive = async (c: CustomerListItem) => {
    try {
      const res = await setActive.mutateAsync({ id: c.id, isActive: !c.isActive });
      if (res.success) toast.success(res.message ?? "Updated.");
      else toast.error(res.message ?? "Failed.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed.");
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      const res = await remove.mutateAsync(toDelete.id);
      if (res.success) { toast.success(res.message ?? "Deleted."); setToDelete(null); }
      else toast.error(res.message ?? "Delete failed.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Delete failed.");
    }
  };

  const openCreate = () => { setEditingId(null); setFormOpen(true); };
  const openEdit = (id: string) => { setEditingId(id); setFormOpen(true); };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CRM"
        title="Customers"
        subtitle="Register customers, track vehicles, and search by any field — live."
        actions={
          <button onClick={openCreate} className="btn-primary">
            <Plus className="w-4 h-4" /> New customer
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total" value={stats?.total ?? 0} icon={Users} tint="brand"
          loading={statsQuery.isPending} hint="All registered customers" />
        <StatCard label="Active" value={stats?.active ?? 0} icon={CheckCircle2} tint="emerald"
          loading={statsQuery.isPending} />
        <StatCard label="Inactive" value={stats?.inactive ?? 0} icon={XCircle} tint="rose"
          loading={statsQuery.isPending} />
        <StatCard label="Vehicles" value={stats?.totalVehicles ?? 0} icon={Car} tint="violet"
          loading={statsQuery.isPending} hint="Across all customers" />
      </div>

      <div className="card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              className="input pl-10" placeholder="Search name, phone, email, or vehicle number…" />
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
                <th className="py-3 px-3 font-medium">Customer</th>
                <th className="py-3 px-3 font-medium">Contact</th>
                <th className="py-3 px-3 font-medium">Vehicles</th>
                <th className="py-3 px-3 font-medium">Status</th>
                <th className="py-3 px-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listQuery.isPending && !data ? (
                <tr><td colSpan={5} className="py-10 text-center text-slate-400">Loading customers…</td></tr>
              ) : data?.items.length === 0 ? (
                <tr><td colSpan={5}>
                  <EmptyState icon={Users} title="No customers yet"
                    message="Register your first customer to start tracking vehicles and sales."
                    action={<button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> New customer</button>} />
                </td></tr>
              ) : (
                data?.items.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition">
                    <td className="py-3 px-3">
                      <button onClick={() => setDetailId(c.id)} className="text-left group">
                        <div className="font-semibold text-slate-900 group-hover:text-brand-700 transition">{c.fullName}</div>
                        <div className="text-xs text-slate-500 group-hover:text-brand-500 flex items-center gap-1 mt-0.5">
                          View details <ExternalLink className="w-3 h-3" />
                        </div>
                      </button>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col gap-0.5 text-xs text-slate-600">
                        <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" />{c.phoneNumber}</span>
                        {c.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" />{c.email}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {c.vehicleCount > 0 ? (
                        <div className="flex items-center gap-2">
                          <Badge tone="brand"><Car className="w-3 h-3" /> {c.vehicleCount}</Badge>
                          {c.primaryVehicleNumber && (
                            <span className="text-xs font-mono text-slate-600">{c.primaryVehicleNumber}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">None</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {c.isActive
                        ? <Badge tone="emerald"><CheckCircle2 className="w-3 h-3" /> Active</Badge>
                        : <Badge tone="rose"><XCircle className="w-3 h-3" /> Inactive</Badge>}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => toggleActive(c)} disabled={setActive.isPending}
                          title={c.isActive ? "Deactivate" : "Activate"}
                          className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-40">
                          {c.isActive ? <ShieldOff className="w-4 h-4 text-rose-600" />
                            : <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                        </button>
                        <button onClick={() => openEdit(c.id)} className="p-2 rounded-lg hover:bg-slate-100" title="Edit">
                          <Pencil className="w-4 h-4 text-slate-600" />
                        </button>
                        {canDelete && (
                          <button onClick={() => setToDelete(c)}
                            className="p-2 rounded-lg hover:bg-rose-50" title="Delete">
                            <Trash2 className="w-4 h-4 text-rose-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-3">
          {listQuery.isPending && !data ? (
            <div className="py-10 text-center text-slate-400">Loading…</div>
          ) : data?.items.length === 0 ? (
            <EmptyState icon={Users} title="No customers yet" message="Register your first customer."
              action={<button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> New customer</button>} />
          ) : (
            data?.items.map((c) => (
              <div key={c.id} className="border border-slate-100 rounded-xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <button onClick={() => setDetailId(c.id)} className="text-left min-w-0">
                    <div className="font-semibold text-slate-900 truncate">{c.fullName}</div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> {c.phoneNumber}
                    </div>
                    {c.primaryVehicleNumber && (
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 font-mono">
                        <Car className="w-3.5 h-3.5" /> {c.primaryVehicleNumber} {c.vehicleCount > 1 && `+${c.vehicleCount - 1}`}
                      </div>
                    )}
                  </button>
                  {c.isActive ? <Badge tone="emerald">Active</Badge> : <Badge tone="rose">Inactive</Badge>}
                </div>
                <div className="flex justify-end gap-1 mt-3">
                  <button onClick={() => toggleActive(c)} className="p-2 rounded-lg hover:bg-slate-100">
                    {c.isActive ? <ShieldOff className="w-4 h-4 text-rose-600" /> : <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                  </button>
                  <button onClick={() => openEdit(c.id)} className="p-2 rounded-lg hover:bg-slate-100">
                    <Pencil className="w-4 h-4 text-slate-600" />
                  </button>
                  {canDelete && (
                    <button onClick={() => setToDelete(c)} className="p-2 rounded-lg hover:bg-rose-50">
                      <Trash2 className="w-4 h-4 text-rose-600" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {data && <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />}
      </div>

      <CustomerFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={() => setFormOpen(false)}
        editing={editingId ? editingCustomer.data?.data ?? null : null}
      />

      <CustomerDetailDrawer
        customerId={detailId}
        onClose={() => setDetailId(null)}
      />

      <ConfirmDialog
        open={!!toDelete}
        title="Delete customer?"
        message={toDelete ? `Remove "${toDelete.fullName}" and all their vehicles? This cannot be undone.` : ""}
        confirmLabel="Delete"
        danger
        loading={remove.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
