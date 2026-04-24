import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Building2, Mail, MapPin, Phone, StickyNote, User, CreditCard } from "lucide-react";
import Modal from "../../../components/common/Modal";
import TextField from "../../../components/forms/TextField";
import { vendorApi } from "../../../services/api/vendorApi";
import type { Vendor } from "../../../types/vendor";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editing?: Vendor | null;
}

const empty = { name: "", phoneNumber: "", contactPerson: "", email: "", address: "", panNumber: "", notes: "" };

export default function VendorFormModal({ open, onClose, onSaved, editing }: Props) {
  const isEdit = !!editing;
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(editing ? {
      name: editing.name,
      phoneNumber: editing.phoneNumber,
      contactPerson: editing.contactPerson ?? "",
      email: editing.email ?? "",
      address: editing.address ?? "",
      panNumber: editing.panNumber ?? "",
      notes: editing.notes ?? ""
    } : empty);
  }, [open, editing]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        phoneNumber: form.phoneNumber.trim(),
        contactPerson: form.contactPerson.trim() || undefined,
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        panNumber: form.panNumber.trim() || undefined,
        notes: form.notes.trim() || undefined
      };
      const res = isEdit && editing
        ? await vendorApi.update(editing.id, payload)
        : await vendorApi.create(payload);

      if (res.success) { toast.success(res.message ?? (isEdit ? "Updated." : "Created.")); onSaved(); }
      else toast.error(res.message ?? "Save failed.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Save failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit vendor" : "Add vendor"} size="lg">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="Vendor name *" required placeholder="e.g. Himalayan Auto Parts"
            icon={<Building2 className="w-5 h-5" />} value={form.name} onChange={set("name")} />
          <TextField label="Phone *" required inputMode="tel" placeholder="98XXXXXXXX"
            icon={<Phone className="w-5 h-5" />} value={form.phoneNumber} onChange={set("phoneNumber")} />
          <TextField label="Contact person" placeholder="e.g. Ram Sharma"
            icon={<User className="w-5 h-5" />} value={form.contactPerson} onChange={set("contactPerson")} />
          <TextField label="Email" type="email" placeholder="sales@vendor.com"
            icon={<Mail className="w-5 h-5" />} value={form.email} onChange={set("email")} />
          <TextField label="PAN number" placeholder="e.g. 301234567"
            icon={<CreditCard className="w-5 h-5" />} value={form.panNumber} onChange={set("panNumber")} />
          <TextField label="Address" placeholder="Street, city"
            icon={<MapPin className="w-5 h-5" />} value={form.address} onChange={set("address")} />
        </div>
        <div>
          <label className="label">Notes</label>
          <div className="relative">
            <StickyNote className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
            <textarea rows={3} value={form.notes} onChange={set("notes")}
              className="input pl-11 resize-none" placeholder="Internal notes about this vendor…" />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost" disabled={loading}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Saving…" : isEdit ? "Save changes" : "Create vendor"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
