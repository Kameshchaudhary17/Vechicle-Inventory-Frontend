import { useState } from "react";
import toast from "react-hot-toast";
import { X, Car, Phone, Mail, MapPin, StickyNote, Plus, Pencil, Trash2, Calendar, Palette, Hash } from "lucide-react";
import Modal from "../../../components/common/Modal";
import TextField from "../../../components/forms/TextField";
import Badge from "../../../components/common/Badge";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { useCustomer, useCustomerMutations } from "../../../hooks/queries/useCustomers";
import type { CustomerVehicle, VehicleUpsertPayload } from "../../../types/customer";

interface Props {
  customerId: string | null;
  onClose: () => void;
}

const emptyVehicle: VehicleUpsertPayload = { vehicleNumber: "", make: "", model: "" };

export default function CustomerDetailDrawer({ customerId, onClose }: Props) {
  const open = !!customerId;
  const { data, isPending } = useCustomer(customerId ?? undefined);
  const customer = data?.data;

  const { addVehicle, updateVehicle, removeVehicle } = useCustomerMutations();
  const [vehicleForm, setVehicleForm] = useState<VehicleUpsertPayload>(emptyVehicle);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [toDeleteVehicle, setToDeleteVehicle] = useState<CustomerVehicle | null>(null);

  const openAdd = () => { setEditingVehicleId(null); setVehicleForm(emptyVehicle); setVehicleOpen(true); };
  const openEdit = (v: CustomerVehicle) => {
    setEditingVehicleId(v.id);
    setVehicleForm({
      vehicleNumber: v.vehicleNumber,
      make: v.make,
      model: v.model,
      year: v.year ?? undefined,
      color: v.color ?? "",
      vinNumber: v.vinNumber ?? ""
    });
    setVehicleOpen(true);
  };

  const submitVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return;
    try {
      const payload: VehicleUpsertPayload = {
        vehicleNumber: vehicleForm.vehicleNumber.trim().toUpperCase(),
        make: vehicleForm.make.trim(),
        model: vehicleForm.model.trim(),
        year: vehicleForm.year ? Number(vehicleForm.year) : undefined,
        color: vehicleForm.color?.trim() || undefined,
        vinNumber: vehicleForm.vinNumber?.trim().toUpperCase() || undefined,
        notes: vehicleForm.notes?.trim() || undefined
      };
      const res = editingVehicleId
        ? await updateVehicle.mutateAsync({ customerId, vehicleId: editingVehicleId, payload })
        : await addVehicle.mutateAsync({ customerId, payload });
      if (res.success) {
        toast.success(res.message ?? "Saved.");
        setVehicleOpen(false);
      } else {
        toast.error(res.message ?? "Save failed.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Save failed.");
    }
  };

  const confirmRemoveVehicle = async () => {
    if (!customerId || !toDeleteVehicle) return;
    try {
      const res = await removeVehicle.mutateAsync({ customerId, vehicleId: toDeleteVehicle.id });
      if (res.success) {
        toast.success(res.message ?? "Removed.");
        setToDeleteVehicle(null);
      } else {
        toast.error(res.message ?? "Failed.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed.");
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-30 flex justify-end">
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={onClose} />
        <aside className="relative w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl fade-up">
          <div className="sticky top-0 bg-gradient-to-br from-brand-600 to-brand-800 text-white px-6 py-5 flex items-start justify-between">
            <div className="min-w-0">
              {isPending ? (
                <div className="text-sm text-brand-100">Loading…</div>
              ) : !customer ? (
                <div className="text-sm text-brand-100">Not found</div>
              ) : (
                <>
                  <div className="text-xs uppercase tracking-wider text-brand-200">Customer</div>
                  <h2 className="display-font text-2xl font-extrabold truncate">{customer.fullName}</h2>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-brand-100">
                    <span className="inline-flex items-center gap-1.5"><Phone className="w-4 h-4" />{customer.phoneNumber}</span>
                    {customer.email && <span className="inline-flex items-center gap-1.5"><Mail className="w-4 h-4" />{customer.email}</span>}
                  </div>
                </>
              )}
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>

          {customer && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <InfoCard label="Vehicles" value={customer.vehicleCount.toString()} icon={Car} />
                <InfoCard label="Status" value={customer.isActive ? "Active" : "Inactive"}
                  tone={customer.isActive ? "emerald" : "rose"} />
              </div>

              {customer.address && (
                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                  <span>{customer.address}</span>
                </div>
              )}

              {customer.notes && (
                <div className="flex items-start gap-2 text-sm text-slate-600 bg-amber-50 border border-amber-100 rounded-xl p-3">
                  <StickyNote className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <span className="whitespace-pre-wrap">{customer.notes}</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="display-font font-bold text-slate-900 flex items-center gap-2">
                    <Car className="w-4 h-4 text-brand-600" /> Vehicles
                  </h3>
                  <button onClick={openAdd} className="btn-primary !py-1.5 !px-3 text-sm">
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>

                {customer.vehicles.length === 0 ? (
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center text-sm text-slate-500">
                    No vehicles registered. Add one to enable sales tracking.
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {customer.vehicles.map((v) => (
                      <li key={v.id} className="border border-slate-100 rounded-2xl p-4 hover:border-brand-200 transition">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="font-bold text-slate-900 display-font tracking-wide">{v.vehicleNumber}</div>
                              {v.year && <Badge tone="slate"><Calendar className="w-3 h-3" /> {v.year}</Badge>}
                            </div>
                            <div className="text-sm text-slate-600 mt-1">{v.make} · {v.model}</div>
                            <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-slate-500">
                              {v.color && <span className="inline-flex items-center gap-1"><Palette className="w-3 h-3" />{v.color}</span>}
                              {v.vinNumber && <span className="inline-flex items-center gap-1"><Hash className="w-3 h-3" />{v.vinNumber}</span>}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => openEdit(v)} className="p-2 rounded-lg hover:bg-slate-100" title="Edit">
                              <Pencil className="w-4 h-4 text-slate-600" />
                            </button>
                            <button onClick={() => setToDeleteVehicle(v)} className="p-2 rounded-lg hover:bg-rose-50" title="Remove">
                              <Trash2 className="w-4 h-4 text-rose-600" />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>

      <Modal open={vehicleOpen} onClose={() => setVehicleOpen(false)}
        title={editingVehicleId ? "Edit vehicle" : "Add vehicle"} size="lg">
        <form onSubmit={submitVehicle} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Vehicle number *" required placeholder="BA 2 PA 1234"
              icon={<Car className="w-5 h-5" />} value={vehicleForm.vehicleNumber}
              onChange={(e) => setVehicleForm((f) => ({ ...f, vehicleNumber: e.target.value }))} />
            <TextField label="Year" inputMode="numeric" placeholder="2022"
              value={vehicleForm.year?.toString() ?? ""}
              onChange={(e) => setVehicleForm((f) => ({ ...f, year: e.target.value ? Number(e.target.value) : undefined }))} />
            <TextField label="Make *" required placeholder="Bajaj"
              value={vehicleForm.make} onChange={(e) => setVehicleForm((f) => ({ ...f, make: e.target.value }))} />
            <TextField label="Model *" required placeholder="Pulsar 150"
              value={vehicleForm.model} onChange={(e) => setVehicleForm((f) => ({ ...f, model: e.target.value }))} />
            <TextField label="Color" placeholder="Red"
              icon={<Palette className="w-5 h-5" />} value={vehicleForm.color ?? ""}
              onChange={(e) => setVehicleForm((f) => ({ ...f, color: e.target.value }))} />
            <TextField label="VIN" placeholder="Optional"
              icon={<Hash className="w-5 h-5" />} value={vehicleForm.vinNumber ?? ""}
              onChange={(e) => setVehicleForm((f) => ({ ...f, vinNumber: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setVehicleOpen(false)} className="btn-ghost"
              disabled={addVehicle.isPending || updateVehicle.isPending}>Cancel</button>
            <button type="submit" className="btn-primary"
              disabled={addVehicle.isPending || updateVehicle.isPending}>
              {addVehicle.isPending || updateVehicle.isPending ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!toDeleteVehicle}
        title="Remove vehicle?"
        message={toDeleteVehicle ? `Remove "${toDeleteVehicle.vehicleNumber}" from this customer?` : ""}
        confirmLabel="Remove"
        danger
        loading={removeVehicle.isPending}
        onCancel={() => setToDeleteVehicle(null)}
        onConfirm={confirmRemoveVehicle}
      />
    </>
  );
}

function InfoCard({ label, value, icon: Icon, tone }: { label: string; value: string; icon?: typeof Car; tone?: "emerald" | "rose" }) {
  const toneClass = tone === "emerald" ? "text-emerald-700 bg-emerald-50" : tone === "rose" ? "text-rose-700 bg-rose-50" : "text-slate-700 bg-slate-50";
  return (
    <div className={`rounded-xl p-3 ${toneClass}`}>
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider opacity-80">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </div>
      <div className="display-font text-xl font-extrabold mt-0.5">{value}</div>
    </div>
  );
}
