import { useState } from "react";
import toast from "react-hot-toast";
import { Car, Plus, Pencil, Trash2, Palette, Hash, Calendar } from "lucide-react";
import PageHeader from "../../../components/common/PageHeader";
import Modal from "../../../components/common/Modal";
import TextField from "../../../components/forms/TextField";
import Badge from "../../../components/common/Badge";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import EmptyState from "../../../components/common/EmptyState";
import { useMyVehicles, useMyMutations } from "../../../hooks/queries/useCustomerSelf";
import type { Vehicle, VehicleUpsertPayload } from "../../../types/customer";

const emptyVehicle: VehicleUpsertPayload = { vehicleNumber: "", make: "", model: "" };

export default function CustomerVehiclesPage() {
  const { data, isPending } = useMyVehicles();
  const vehicles = data?.data ?? [];
  const { addVehicle, updateVehicle, removeVehicle } = useMyMutations();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [form, setForm] = useState<VehicleUpsertPayload>(emptyVehicle);
  const [toDelete, setToDelete] = useState<Vehicle | null>(null);

  const openAdd = () => { setEditing(null); setForm(emptyVehicle); setFormOpen(true); };
  const openEdit = (v: Vehicle) => {
    setEditing(v);
    setForm({
      vehicleNumber: v.vehicleNumber, make: v.make, model: v.model,
      year: v.year ?? undefined, color: v.color ?? "", vinNumber: v.vinNumber ?? "", notes: v.notes ?? ""
    });
    setFormOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: VehicleUpsertPayload = {
        vehicleNumber: form.vehicleNumber.trim().toUpperCase(),
        make: form.make.trim(),
        model: form.model.trim(),
        year: form.year ? Number(form.year) : undefined,
        color: form.color?.trim() || undefined,
        vinNumber: form.vinNumber?.trim().toUpperCase() || undefined,
        notes: form.notes?.trim() || undefined
      };
      const res = editing
        ? await updateVehicle.mutateAsync({ id: editing.id, payload })
        : await addVehicle.mutateAsync(payload);
      if (res.success) { toast.success(res.message ?? "Saved."); setFormOpen(false); }
      else toast.error(res.message ?? "Failed.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed.");
    }
  };

  const confirmRemove = async () => {
    if (!toDelete) return;
    try {
      const res = await removeVehicle.mutateAsync(toDelete.id);
      if (res.success) { toast.success(res.message ?? "Removed."); setToDelete(null); }
      else toast.error(res.message ?? "Failed.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Garage"
        title="My Vehicles"
        subtitle="Manage vehicles linked to your profile — used when booking service."
        actions={
          <button onClick={openAdd} className="btn-primary">
            <Plus className="w-4 h-4" /> Add vehicle
          </button>
        }
      />

      {isPending ? (
        <div className="card p-6 text-sm text-slate-500">Loading…</div>
      ) : vehicles.length === 0 ? (
        <div className="card p-6">
          <EmptyState icon={Car} title="No vehicles yet"
            message="Add your vehicle details so staff can register sales and appointments."
            action={<button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add vehicle</button>} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map((v) => (
            <div key={v.id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="display-font font-extrabold text-xl text-slate-900 tracking-wide">{v.vehicleNumber}</div>
                    {v.year && <Badge tone="slate"><Calendar className="w-3 h-3" /> {v.year}</Badge>}
                  </div>
                  <div className="text-sm text-slate-600 mt-1">{v.make} · {v.model}</div>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                    {v.color && <span className="inline-flex items-center gap-1"><Palette className="w-3 h-3" />{v.color}</span>}
                    {v.vinNumber && <span className="inline-flex items-center gap-1"><Hash className="w-3 h-3" />{v.vinNumber}</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(v)} className="p-2 rounded-lg hover:bg-slate-100"><Pencil className="w-4 h-4 text-slate-600" /></button>
                  <button onClick={() => setToDelete(v)} className="p-2 rounded-lg hover:bg-rose-50"><Trash2 className="w-4 h-4 text-rose-600" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)}
        title={editing ? "Edit vehicle" : "Add vehicle"} size="lg">
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Vehicle number *" required placeholder="BA 2 PA 1234"
              icon={<Car className="w-5 h-5" />} value={form.vehicleNumber}
              onChange={(e) => setForm((f) => ({ ...f, vehicleNumber: e.target.value }))} />
            <TextField label="Year" inputMode="numeric" placeholder="2022"
              value={form.year?.toString() ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, year: e.target.value ? Number(e.target.value) : undefined }))} />
            <TextField label="Make *" required placeholder="Bajaj"
              value={form.make} onChange={(e) => setForm((f) => ({ ...f, make: e.target.value }))} />
            <TextField label="Model *" required placeholder="Pulsar 150"
              value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} />
            <TextField label="Color" placeholder="Red"
              icon={<Palette className="w-5 h-5" />} value={form.color ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} />
            <TextField label="VIN" placeholder="Optional"
              icon={<Hash className="w-5 h-5" />} value={form.vinNumber ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, vinNumber: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setFormOpen(false)} className="btn-ghost"
              disabled={addVehicle.isPending || updateVehicle.isPending}>Cancel</button>
            <button type="submit" className="btn-primary"
              disabled={addVehicle.isPending || updateVehicle.isPending}>
              {addVehicle.isPending || updateVehicle.isPending ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        title="Remove vehicle?"
        message={toDelete ? `Remove "${toDelete.vehicleNumber}" from your garage?` : ""}
        confirmLabel="Remove"
        danger
        loading={removeVehicle.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmRemove}
      />
    </div>
  );
}
