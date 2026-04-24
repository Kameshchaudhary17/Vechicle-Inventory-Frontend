import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Receipt, User, Car, Plus, Trash2, Package, StickyNote, Wallet, Sparkles } from "lucide-react";
import Modal from "../../../components/common/Modal";
import TextField from "../../../components/forms/TextField";
import { useDebounce } from "../../../hooks/useDebounce";
import { useSalesMutations } from "../../../hooks/queries/useInvoices";
import { useCustomerList, useCustomer } from "../../../hooks/queries/useCustomers";
import { useStaffPartList } from "../../../hooks/queries/useParts";
import type { Part } from "../../../types/part";

interface LineInput { partId: string; quantity: number; unitPrice: number; }
const emptyLine: LineInput = { partId: "", quantity: 1, unitPrice: 0 };

interface Props { open: boolean; onClose: () => void; onSaved: () => void; }

export default function SalesInvoiceFormModal({ open, onClose, onSaved }: Props) {
  const [custSearch, setCustSearch] = useState("");
  const custDebounced = useDebounce(custSearch, 300);
  const [customerId, setCustomerId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [paid, setPaid] = useState(0);
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineInput[]>([{ ...emptyLine }]);

  const customers = useCustomerList({ search: custDebounced || undefined, activeOnly: true, pageSize: 20 });
  const customerDetail = useCustomer(customerId || undefined);
  const parts = useStaffPartList({ activeOnly: true, pageSize: 200 });
  const { create } = useSalesMutations();

  useEffect(() => {
    if (!open) return;
    setCustSearch("");
    setCustomerId(""); setVehicleId("");
    setInvoiceDate(new Date().toISOString().slice(0, 10));
    setDiscount(0); setTax(0); setPaid(0); setNotes("");
    setLines([{ ...emptyLine }]);
  }, [open]);

  useEffect(() => { setVehicleId(""); }, [customerId]);

  const partMap = useMemo(() => {
    const map: Record<string, Part> = {};
    parts.data?.data?.items.forEach((p) => { map[p.id] = p; });
    return map;
  }, [parts.data]);

  const subtotal = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  const loyaltyEligible = subtotal > 5000;
  const loyaltyDiscount = loyaltyEligible ? Math.round(subtotal * 0.10 * 100) / 100 : 0;
  const total = Math.max(0, subtotal - loyaltyDiscount - discount + tax);

  const setLine = <K extends keyof LineInput>(i: number, k: K, val: LineInput[K]) =>
    setLines((a) => a.map((l, idx) => idx === i ? { ...l, [k]: val } : l));
  const addLine = () => setLines((a) => [...a, { ...emptyLine }]);
  const removeLine = (i: number) => setLines((a) => a.filter((_, idx) => idx !== i));

  const selectedCustomer = customerDetail.data?.data;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) { toast.error("Select a customer."); return; }
    const valid = lines.filter((l) => l.partId && l.quantity > 0);
    if (valid.length === 0) { toast.error("Add at least one line."); return; }
    for (const l of valid) {
      const p = partMap[l.partId];
      if (p && p.stockQty < l.quantity) { toast.error(`Insufficient stock for ${p.name}.`); return; }
    }

    try {
      const res = await create.mutateAsync({
        customerId,
        vehicleId: vehicleId || undefined,
        invoiceDate: new Date(invoiceDate).toISOString(),
        discountAmount: Number(discount) || 0,
        taxAmount: Number(tax) || 0,
        paidAmount: Number(paid) || 0,
        notes: notes.trim() || undefined,
        items: valid.map((l) => ({ partId: l.partId, quantity: Number(l.quantity), unitPrice: Number(l.unitPrice) }))
      });
      if (res.success) { toast.success(res.message ?? "Sale recorded."); onSaved(); }
      else toast.error(res.message ?? "Failed.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed.");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New sales invoice" size="xl">
      <form onSubmit={submit} className="space-y-5">
        <div>
          <div className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-2">Customer</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="label">Search customer *</label>
              <input className="input" placeholder="Name, phone, or vehicle number"
                value={custSearch} onChange={(e) => setCustSearch(e.target.value)} />
              {!customerId && !custDebounced && (
                <p className="text-xs text-amber-700 mt-1">Type a name or phone to search, then click a result to select.</p>
              )}
              {custDebounced && (
                <div className="mt-2 border border-slate-100 rounded-xl max-h-44 overflow-y-auto">
                  {customers.isLoading ? (
                    <div className="p-3 text-sm text-slate-400">Searching…</div>
                  ) : customers.data?.data?.items?.length === 0 ? (
                    <div className="p-3 text-sm text-slate-500">No matches.</div>
                  ) : customers.data?.data?.items?.map((c) => (
                    <button key={c.id} type="button" onClick={() => { setCustomerId(c.id); setCustSearch(""); }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-brand-50 border-b border-slate-50 last:border-0 ${c.id === customerId ? "bg-brand-50" : ""}`}>
                      <div className="font-semibold text-slate-900">{c.fullName}</div>
                      <div className="text-xs text-slate-500">{c.phoneNumber} {c.primaryVehicleNumber ? `· ${c.primaryVehicleNumber}` : ""}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <TextField label="Invoice date" type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
          </div>

          {selectedCustomer && (
            <div className="mt-3 border border-brand-100 bg-brand-50 rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-600 text-white flex items-center justify-center"><User className="w-5 h-5" /></div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900 truncate">{selectedCustomer.fullName}</div>
                <div className="text-xs text-slate-600">{selectedCustomer.phoneNumber} {selectedCustomer.email ? `· ${selectedCustomer.email}` : ""}</div>
              </div>
              {selectedCustomer.vehicles.length > 0 && (
                <div className="min-w-[200px]">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1"><Car className="w-3 h-3" /> Vehicle</label>
                  <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}
                    className="input !py-2 text-sm mt-1">
                    <option value="">— None —</option>
                    {selectedCustomer.vehicles.map((v) => (
                      <option key={v.id} value={v.id}>{v.vehicleNumber} ({v.make} {v.model})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-brand-600 uppercase tracking-wider">Parts</div>
            <button type="button" onClick={addLine}
              className="text-sm text-brand-600 font-semibold inline-flex items-center gap-1"><Plus className="w-4 h-4" /> Add line</button>
          </div>
          <div className="space-y-2">
            {lines.map((l, i) => {
              const part = partMap[l.partId];
              const lineTotal = l.quantity * l.unitPrice;
              const short = part && part.stockQty < l.quantity;
              return (
                <div key={i} className="grid grid-cols-12 gap-2 items-start border border-slate-100 rounded-xl p-3">
                  <div className="col-span-12 sm:col-span-5">
                    <label className="label">Part</label>
                    <div className="relative">
                      <Package className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                      <select value={l.partId} onChange={(e) => {
                        setLine(i, "partId", e.target.value);
                        const p = partMap[e.target.value];
                        if (p) setLine(i, "unitPrice", p.sellPrice);
                      }} className="input pl-11 appearance-none">
                        <option value="">Select part</option>
                        {parts.data?.data?.items.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.code} — {p.name} (stock: {p.stockQty})
                          </option>
                        ))}
                      </select>
                    </div>
                    {part && <div className={`text-xs mt-1 ${short ? "text-rose-600 font-semibold" : "text-slate-500"}`}>
                      Stock: {part.stockQty} {part.unit}{short && " · insufficient"}
                    </div>}
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <TextField label="Qty" type="number" min={1} value={l.quantity.toString()}
                      onChange={(e) => setLine(i, "quantity", Number(e.target.value) || 0)} />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <TextField label="Unit price" type="number" step="0.01" min={0} value={l.unitPrice.toString()}
                      onChange={(e) => setLine(i, "unitPrice", Number(e.target.value) || 0)} />
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Discount" type="number" step="0.01" min={0} value={discount.toString()}
              onChange={(e) => setDiscount(Number(e.target.value) || 0)} />
            <TextField label="Tax" type="number" step="0.01" min={0} value={tax.toString()}
              onChange={(e) => setTax(Number(e.target.value) || 0)} />
            <TextField label="Paid now" type="number" step="0.01" min={0} value={paid.toString()}
              onChange={(e) => setPaid(Number(e.target.value) || 0)}
              icon={<Wallet className="w-5 h-5" />} hint={paid >= total ? "Paid in full" : paid > 0 ? `Balance: NPR ${(total - paid).toFixed(2)}` : "Credit sale"} />
          </div>
          <div className="bg-gradient-to-br from-brand-50 to-white rounded-2xl p-4 border border-brand-100">
            <div className="text-xs text-brand-600 font-semibold uppercase tracking-wider">Subtotal</div>
            <div className="text-lg font-bold text-slate-900 tabular-nums">NPR {subtotal.toFixed(2)}</div>
            {loyaltyEligible && (
              <div className="mt-2 flex items-center gap-2 text-emerald-700">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-semibold">Loyalty 10% off: -NPR {loyaltyDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="h-px bg-brand-100 my-3" />
            <div className="text-xs text-brand-600 font-semibold uppercase tracking-wider">Total due</div>
            <div className="display-font text-3xl font-extrabold text-brand-900 tabular-nums">NPR {total.toFixed(2)}</div>
          </div>
        </div>

        <div>
          <label className="label">Notes</label>
          <div className="relative">
            <StickyNote className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
            <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
              className="input pl-11 resize-none" placeholder="Optional" />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button type="button" onClick={onClose} className="btn-ghost" disabled={create.isPending}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={create.isPending || !customerId}
            title={!customerId ? "Select a customer first" : undefined}>
            {create.isPending ? "Creating…" : <><Receipt className="w-4 h-4" /> Create sale</>}
          </button>
        </div>
      </form>
    </Modal>
  );
}
