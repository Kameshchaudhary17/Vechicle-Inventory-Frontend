import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Package, Hash, Factory, Ruler, Banknote, AlertTriangle, ImagePlus, X } from "lucide-react";
import Modal from "../../../components/common/Modal";
import TextField from "../../../components/forms/TextField";
import { partApi } from "../../../services/api/partApi";
import { categoryApi } from "../../../services/api/categoryApi";
import { partImageUrl } from "../../../lib/utils/imageUrl";
import type { Part } from "../../../types/part";
import type { CategoryLookup } from "../../../types/category";

const UNITS = ["pcs", "set", "L", "ml", "kg", "g", "m", "box", "pair"];

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editing?: Part | null;
}

const empty = {
  code: "", name: "", categoryId: "", brand: "", unit: "pcs",
  sellPrice: "", reorderLevel: "10", description: ""
};

export default function PartFormModal({ open, onClose, onSaved, editing }: Props) {
  const isEdit = !!editing;
  const [form, setForm] = useState(empty);
  const [cats, setCats] = useState<CategoryLookup[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removingImage, setRemovingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    categoryApi.lookup().then((r) => setCats(r.data ?? [])).catch(() => setCats([]));
    setImageFile(null);
    setRemovingImage(false);
    setImagePreview(editing?.imagePath ? partImageUrl(editing.imagePath) : null);
    setForm(editing ? {
      code: editing.code,
      name: editing.name,
      categoryId: editing.categoryId,
      brand: editing.brand ?? "",
      unit: editing.unit,
      sellPrice: String(editing.sellPrice),
      reorderLevel: String(editing.reorderLevel),
      description: editing.description ?? ""
    } : empty);
  }, [open, editing]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Only JPG, PNG, or WEBP allowed."); return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2 MB."); return;
    }
    setImageFile(file);
    setRemovingImage(false);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemovingImage(!!editing?.imagePath);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const set = <K extends keyof typeof form>(k: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.categoryId) { toast.error("Pick a category."); return; }
    setLoading(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        categoryId: form.categoryId,
        brand: form.brand.trim() || undefined,
        unit: form.unit.trim(),
        sellPrice: parseFloat(form.sellPrice) || 0,
        reorderLevel: parseInt(form.reorderLevel) || 0,
        description: form.description.trim() || undefined
      };
      const res = isEdit && editing
        ? await partApi.update(editing.id, payload)
        : await partApi.create(payload);

      if (!res.success) { toast.error(res.message ?? "Save failed."); return; }

      const savedId = res.data?.id ?? (isEdit ? editing!.id : null);
      if (savedId && imageFile) {
        try { await partApi.uploadImage(savedId, imageFile); }
        catch { toast.error("Image upload failed. Part saved without image."); }
      } else if (savedId && removingImage) {
        try { await partApi.deleteImage(savedId); } catch { /* ignore */ }
      }

      toast.success(res.message ?? (isEdit ? "Updated." : "Created."));
      onSaved();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Save failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit part" : "Add part"} size="lg">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="Part code *" required placeholder="e.g. BRK-001"
            icon={<Hash className="w-5 h-5" />} value={form.code}
            onChange={set("code")} style={{ textTransform: "uppercase" }} />
          <TextField label="Part name *" required placeholder="e.g. Front brake pad"
            icon={<Package className="w-5 h-5" />} value={form.name} onChange={set("name")} />

          <div>
            <label className="label">Category *</label>
            <select required className="input" value={form.categoryId} onChange={set("categoryId")}>
              <option value="">Select category…</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {cats.length === 0 && (
              <p className="text-xs text-amber-700 mt-1">No active categories — create one first.</p>
            )}
          </div>
          <TextField label="Brand" placeholder="e.g. Bosch"
            icon={<Factory className="w-5 h-5" />} value={form.brand} onChange={set("brand")} />

          <div>
            <label className="label">Unit *</label>
            <div className="relative">
              <Ruler className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
              <select required className="input pl-11" value={form.unit} onChange={set("unit")}>
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <TextField label="Sell price (NPR) *" required type="number" step="0.01" min="0"
            placeholder="0.00" icon={<Banknote className="w-5 h-5" />}
            value={form.sellPrice} onChange={set("sellPrice")} />

          <TextField label="Reorder level" type="number" min="0" step="1"
            placeholder="10" icon={<AlertTriangle className="w-5 h-5" />}
            value={form.reorderLevel} onChange={set("reorderLevel")}
            hint="Alert triggers when stock falls below this." />

          {!isEdit && (
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-xs text-slate-600">
              Stock quantity starts at <b>0</b>. Add stock via purchase invoice.
            </div>
          )}
        </div>

        <div>
          <label className="label">Description</label>
          <textarea rows={3} value={form.description} onChange={set("description")}
            className="input resize-none" placeholder="Optional specs or notes" />
        </div>

        <div>
          <label className="label">Part image</label>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
            className="hidden" onChange={onFileChange} />
          {imagePreview ? (
            <div className="relative inline-block">
              <img src={imagePreview} alt="Part" className="w-32 h-32 object-cover rounded-xl border border-slate-200" />
              <button type="button" onClick={clearImage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-rose-600 text-white rounded-full flex items-center justify-center hover:bg-rose-700">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-500 hover:border-brand-400 hover:text-brand-600 transition w-full justify-center">
              <ImagePlus className="w-5 h-5" />
              Click to upload image (JPG / PNG / WEBP, max 2 MB)
            </button>
          )}
          {imagePreview && !imageFile && (
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-xs text-brand-600 hover:underline">
              Replace image
            </button>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost" disabled={loading}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Saving…" : isEdit ? "Save changes" : "Create part"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
