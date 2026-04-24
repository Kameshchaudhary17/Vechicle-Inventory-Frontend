import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Tag } from "lucide-react";
import Modal from "../../../components/common/Modal";
import TextField from "../../../components/forms/TextField";
import { categoryApi } from "../../../services/api/categoryApi";
import type { Category } from "../../../types/category";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editing?: Category | null;
}

export default function CategoryFormModal({ open, onClose, onSaved, editing }: Props) {
  const isEdit = !!editing;
  const [form, setForm] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(editing
      ? { name: editing.name, description: editing.description ?? "" }
      : { name: "", description: "" });
  }, [open, editing]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined
      };
      const res = isEdit && editing
        ? await categoryApi.update(editing.id, payload)
        : await categoryApi.create(payload);

      if (res.success) { toast.success(res.message ?? (isEdit ? "Updated." : "Created.")); onSaved(); }
      else toast.error(res.message ?? "Save failed.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Save failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit category" : "Add category"}>
      <form onSubmit={submit} className="space-y-4">
        <TextField label="Category name *" required placeholder="e.g. Brakes"
          icon={<Tag className="w-5 h-5" />} value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} />

        <div>
          <label className="label">Description</label>
          <textarea rows={3} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input resize-none" placeholder="Optional description for this category" />
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-ghost" disabled={loading}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Saving…" : isEdit ? "Save changes" : "Create category"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
