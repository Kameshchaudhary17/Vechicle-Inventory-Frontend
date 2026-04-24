import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Modal from "../../../components/common/Modal";
import { staffApi } from "../../../services/api/staffApi";
import type { Staff } from "../../../types/staff";
import type { Role } from "../../../constants";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editing?: Staff | null;
}

export default function StaffFormModal({ open, onClose, onSaved, editing }: Props) {
  const isEdit = !!editing;
  const [form, setForm] = useState({ fullName: "", email: "", phoneNumber: "", role: "Staff" as Role });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(editing
        ? { fullName: editing.fullName, email: editing.email, phoneNumber: editing.phoneNumber, role: editing.role }
        : { fullName: "", email: "", phoneNumber: "", role: "Staff" });
    }
  }, [open, editing]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit && editing) {
        const res = await staffApi.update(editing.id, {
          fullName: form.fullName, phoneNumber: form.phoneNumber, role: form.role
        });
        if (res.success) { toast.success(res.message ?? "Updated."); onSaved(); }
        else toast.error(res.message ?? "Update failed.");
      } else {
        const res = await staffApi.create({
          fullName: form.fullName, email: form.email, phoneNumber: form.phoneNumber, role: form.role
        });
        if (res.success) { toast.success(res.message ?? "Created. Credentials emailed."); onSaved(); }
        else toast.error(res.message ?? "Create failed.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? (isEdit ? "Update failed." : "Create failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Staff" : "Add Staff"}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Full name</label>
          <input required className="input" value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        </div>
        <div>
          <label className="label">Email</label>
          <input required type="email" className="input" value={form.email} disabled={isEdit}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
          {isEdit && <p className="text-xs text-slate-500 mt-1">Email cannot be changed.</p>}
        </div>
        <div>
          <label className="label">Phone</label>
          <input required className="input" value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} placeholder="9800000000" />
        </div>
        <div>
          <label className="label">Role</label>
          <select className="input" value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
            <option value="Staff">Staff</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        {!isEdit && (
          <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
            A temporary password will be emailed to this address. Advise the user to change it after first login.
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost" disabled={loading}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Saving…" : isEdit ? "Save changes" : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
