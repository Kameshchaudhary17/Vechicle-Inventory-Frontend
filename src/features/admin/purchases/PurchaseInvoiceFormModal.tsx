import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Receipt, Calendar, Truck, Plus, Trash2, Package, StickyNote, Hash } from "lucide-react";
import Modal from "../../../components/common/Modal";
import TextField from "../../../components/forms/TextField";
import { usePurchaseMutations } from "../../../hooks/queries/useInvoices";
import { useVendorList } from "../../../hooks/queries/useVendors";
import { usePartList } from "../../../hooks/queries/useParts";
import type { Part } from "../../../types/part";

interface LineInput { partId: string; quantity: number; unitCost: number; }

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const emptyLine: LineInput = { partId: "", quantity: 1, unitCost: 0 };

export default function PurchaseInvoiceFormModal({ open, onClose, onSaved }: Props) {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [vendorId, setVendorId] = useState("");
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineInput[]>([{ ...emptyLine }]);

  const vendors = useVendorList({ activeOnly: true, pageSize: 100 });
  const parts = usePartList({ activeOnly: true, pageSize: 200 });
  const { create } = usePurchaseMutations();

  useEffect(() => {
    if (!open) return;
    setInvoiceNumber("");
    setInvoiceDate(new Date().toISOString().slice(0, 10));
    setVendorId("");
    setDiscount(0);
    setTax(0);
    setNotes("");
    setLines([{ ...emptyLine }]);
  }, [open]);

  const partMap = useMemo(() => {
    const map: Record<string, Part> = {};
    parts.data?.data?.items.forEach((p) => { map[p.id] = p; });
    return map;
  }, [parts.data]);

  const subtotal = lines.reduce((s, l) => s + l.quantity * l.unitCost, 0);
  const total = Math.max(0, subtotal - discount + tax);

  const setLine = <K extends keyof LineInput>(i: number, k: K, val: LineInput[K]) =>
    setLines((a) => a.map((l, idx) => idx === i ? { ...l, [k]: val } : l));
  const addLine = () => setLines((a) => [...a, { ...emptyLine }]);
  const removeLine = (i: number) => setLines((a) => a.filter((_, idx) => idx !== i));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = lines.filter((l) => l.partId && l.quantity > 0);
    if (valid.length === 0) { toast.error("Add at least one line item."); return; }
    if (!vendorId) { toast.error("Select a vendor."); return; }

    try {
      const res = await create.mutateAsync({
        invoiceNumber: invoiceNumber.trim(),
        invoiceDate: new Date(invoiceDate).toISOString(),
        vendorId,
        discountAmount: Number(discount) || 0,
        taxAmount: Number(tax) || 0,
        notes: notes.trim() || undefined,
        items: valid.map((l) => ({ partId: l.partId, quantity: Number(l.quantity), unitCost: Number(l.unitCost) }))
      });
      if (res.success) { toast.success(res.message ?? "Created."); onSaved(); }
      else toast.error(res.message ?? "Failed.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed.");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New purchase invoice" size="xl">
      <form onSubmit={submit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TextField label="Invoice # *" required placeholder="PO-2026-001"
            icon={<Hash className="w-5 h-5" />} value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
          <TextField label="Invoice date *" required type="date"
            icon={<Calendar className="w-5 h-5" />} value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
          <div>
            <label className="label">Vendor *</label>
            <div className="relative">
              <Truck className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
              <select required value={vendorId} onChange={(e) => setVendorId(e.target.value)}
                className="input pl-11 appearance-none">
                <option value="">Select vendor</option>
                {vendors.data?.data?.items.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-brand-600 uppercase tracking-wider">Line items</div>
            <button type="button" onClick={addLine}
              className="text-sm text-brand-600 hover:text-brand-700 font-semibold inline-flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add line
            </button>
          </div>
          <div className="space-y-2">
            {lines.map((l, i) => {
              const part = partMap[l.partId];
              const lineTotal = l.quantity * l.unitCost;
              return (
                <div key={i} className="grid grid-cols-12 gap-2 items-start border border-slate-100 rounded-xl p-3">
                  <div className="col-span-12 sm:col-span-5">
                    <label className="label">Part</label>
                    <div className="relative">
                      <Package className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                      <select value={l.partId} onChange={(e) => {
                        setLine(i, "partId", e.target.value);
                        const p = partMap[e.target.value];
                        if (p && !l.unitCost) setLine(i, "unitCost", p.sellPrice);
                      }} className="input pl-11 appearance-none">
                        <option value="">Select part</option>
                        {parts.data?.data?.items.map((p) => (
                          <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
                        ))}
                      </select>
                    </div>
                    {part && <div className="text-xs text-slate-500 mt-1">Current stock: {part.stockQty} {part.unit}</div>}
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <TextField label="Qty" type="number" min={1} value={l.quantity.toString()}
                      onChange={(e) => setLine(i, "quantity", Number(e.target.value) || 0)} />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <TextField label="Unit cost" type="number" step="0.01" min={0} value={l.unitCost.toString()}
                      onChange={(e) => setLine(i, "unitCost", Number(e.target.value) || 0)} />
                  </div>
                  <div className="col-span-3 sm:col-span-2 text-right">
                    <label className="label">Total</label>
                    <div className="h-12 flex items-end justify-end text-sm font-bold text-slate-900 tabular-nums">
                      NPR {lineTotal.toFixed(2)}
                    </div>
                  </div>
                  <div className="col-span-1 flex justify-end items-end pt-6">
                    {lines.length > 1 && (
                      <button type="button" onClick={() => removeLine(i)}
                        className="p-2 rounded-lg hover:bg-rose-50 text-rose-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <TextField label="Discount" type="number" step="0.01" min={0} value={discount.toString()}
            onChange={(e) => setDiscount(Number(e.target.value) || 0)} />
          <TextField label="Tax" type="number" step="0.01" min={0} value={tax.toString()}
            onChange={(e) => setTax(Number(e.target.value) || 0)} />
          <div className="bg-brand-50 rounded-xl p-4 text-right">
            <div className="text-xs text-brand-700 font-semibold uppercase tracking-wider">Total</div>
            <div className="display-font text-2xl font-extrabold text-brand-900 tabular-nums">NPR {total.toFixed(2)}</div>
          </div>
        </div>

        <div>
          <label className="label">Notes</label>
          <div className="relative">
            <StickyNote className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
            <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
              className="input pl-11 resize-none" placeholder="Optional notes" />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button type="button" onClick={onClose} className="btn-ghost" disabled={create.isPending}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={create.isPending}>
            {create.isPending ? "Creating…" : <><Receipt className="w-4 h-4" /> Create invoice</>}
          </button>
        </div>
      </form>
    </Modal>
  );
}
