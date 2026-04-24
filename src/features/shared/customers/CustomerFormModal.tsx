import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { User, Phone, Mail, MapPin, StickyNote, Car, Plus, Trash2, Palette, Hash } from "lucide-react";
import Modal from "../../../components/common/Modal";
import TextField from "../../../components/forms/TextField";
import { useCustomerMutations } from "../../../hooks/queries/useCustomers";
import type { Customer, CreateVehicleForCustomerPayload } from "../../../types/customer";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editing?: Customer | null;
}

const emptyCustomer = { fullName: "", phoneNumber: "", email: "", address: "", notes: "" };
const emptyVehicle: CreateVehicleForCustomerPayload = { vehicleNumber: "", make: "", model: "", year: undefined, color: "", vinNumber: "" };

export default function CustomerFormModal({ open, onClose, onSaved, editing }: Props) {
  const isEdit = !!editing;
  const [form, setForm] = useState(emptyCustomer);
  const [vehicles, setVehicles] = useState<CreateVehicleForCustomerPayload[]>([]);
  const { create, update } = useCustomerMutations();
  const loading = create.isPending || update.isPending;

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        fullName: editing.fullName,
        phoneNumber: editing.phoneNumber,
        email: editing.email ?? "",
        address: editing.address ?? "",
        notes: editing.notes ?? ""
      });
      setVehicles([]);
    } else {
      setForm(emptyCustomer);
      setVehicles([{ ...emptyVehicle }]);
    }
  }, [open, editing]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((s) => ({ ...s, [k]: e.target.value }));

  const setVehicle = <K extends keyof CreateVehicleForCustomerPayload>(i: number, k: K, val: CreateVehicleForCustomerPayload[K]) =>
    setVehicles((arr) => arr.map((v, idx) => idx === i ? { ...v, [k]: val } : v));

  const addVehicle = () => setVehicles((arr) => [...arr, { ...emptyVehicle }]);
  const removeVehicle = (i: number) => setVehicles((arr) => arr.filter((_, idx) => idx !== i));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit && editing) {
        const res = await update.mutateAsync({
          id: editing.id,
          payload: {
            fullName: form.fullName.trim(),
            phoneNumber: form.phoneNumber.trim(),
            email: form.email.trim() || undefined,
            address: form.address.trim() || undefined,
            notes: form.notes.trim() || undefined
          }
        });
        if (res.success) { toast.success(res.message ?? "Updated."); onSaved(); }
        else toast.error(res.message ?? "Save failed.");
      } else {
        const cleanVehicles = vehicles
          .filter((v) => v.vehicleNumber.trim() && v.make.trim() && v.model.trim())
          .map((v) => ({
            vehicleNumber: v.vehicleNumber.trim().toUpperCase(),
            make: v.make.trim(),
            model: v.model.trim(),
            year: v.year ? Number(v.year) : undefined,
            color: v.color?.trim() || undefined,
            vinNumber: v.vinNumber?.trim().toUpperCase() || undefined
          }));
        const res = await create.mutateAsync({
          fullName: form.fullName.trim(),
          phoneNumber: form.phoneNumber.trim(),
          email: form.email.trim() || undefined,
          address: form.address.trim() || undefined,
          notes: form.notes.trim() || undefined,
          vehicles: cleanVehicles.length ? cleanVehicles : undefined
        });
        if (res.success) { toast.success(res.message ?? "Created."); onSaved(); }
        else toast.error(res.message ?? "Save failed.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Save failed.");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit customer" : "Register new customer"} size="xl">
      <form onSubmit={submit} className="space-y-5">
        <div>
          <div className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-2">Customer details</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Full name *" required placeholder="e.g. Anisha Rai"
              icon={<User className="w-5 h-5" />} value={form.fullName} onChange={set("fullName")} />
            <TextField label="Phone *" required inputMode="tel" placeholder="98XXXXXXXX"
              icon={<Phone className="w-5 h-5" />} value={form.phoneNumber} onChange={set("phoneNumber")} />
            <TextField label="Email" type="email" placeholder="customer@example.com"
              icon={<Mail className="w-5 h-5" />} value={form.email} onChange={set("email")} />
            <TextField label="Address" placeholder="City, ward"
              icon={<MapPin className="w-5 h-5" />} value={form.address} onChange={set("address")} />
          </div>
          <div className="mt-4">
            <label className="label">Notes</label>
            <div className="relative">
              <StickyNote className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
              <textarea rows={2} value={form.notes} onChange={set("notes")}
                className="input pl-11 resize-none" placeholder="Credit terms, preferences, etc." />
            </div>
          </div>
        </div>

        {!isEdit && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-brand-600 uppercase tracking-wider">Vehicles</div>
              <button type="button" onClick={addVehicle}
                className="text-sm text-brand-600 hover:text-brand-700 font-semibold inline-flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add vehicle
              </button>
            </div>
            <div className="space-y-3">
              {vehicles.map((v, i) => (
                <div key={i} className="relative border border-slate-100 rounded-2xl p-4 bg-slate-50/40">
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                    <div className="col-span-2 sm:col-span-2">
                      <TextField label="Vehicle No." placeholder="BA 2 PA 1234" required={vehicles.length === 1}
                        icon={<Car className="w-5 h-5" />} value={v.vehicleNumber}
                        onChange={(e) => setVehicle(i, "vehicleNumber", e.target.value)} />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <TextField label="Make" placeholder="Bajaj"
                        value={v.make} onChange={(e) => setVehicle(i, "make", e.target.value)} />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <TextField label="Model" placeholder="Pulsar 150"
                        value={v.model} onChange={(e) => setVehicle(i, "model", e.target.value)} />
                    </div>
                    <TextField label="Year" inputMode="numeric" placeholder="2022"
                      value={v.year?.toString() ?? ""} onChange={(e) => setVehicle(i, "year", e.target.value ? Number(e.target.value) : undefined)} />
                    <div className="col-span-1 sm:col-span-2">
                      <TextField label="Color" placeholder="Red"
                        icon={<Palette className="w-5 h-5" />} value={v.color ?? ""} onChange={(e) => setVehicle(i, "color", e.target.value)} />
                    </div>
                    <div className="col-span-2 sm:col-span-3">
                      <TextField label="VIN" placeholder="Optional"
                        icon={<Hash className="w-5 h-5" />} value={v.vinNumber ?? ""} onChange={(e) => setVehicle(i, "vinNumber", e.target.value)} />
                    </div>
                  </div>
                  {vehicles.length > 1 && (
                    <button type="button" onClick={() => removeVehicle(i)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg hover:bg-rose-50 text-rose-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="text-xs text-slate-500 mt-2">Vehicles with blank number/make/model will be skipped. You can add more later from the customer detail.</div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button type="button" onClick={onClose} className="btn-ghost" disabled={loading}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Saving…" : isEdit ? "Save changes" : "Register customer"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
