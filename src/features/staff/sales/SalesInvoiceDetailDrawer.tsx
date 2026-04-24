import { useState } from "react";
import toast from "react-hot-toast";
import { X, Mail, Car, Phone, Sparkles, Receipt } from "lucide-react";
import Badge from "../../../components/common/Badge";
import { useSalesInvoice, useSalesMutations } from "../../../hooks/queries/useInvoices";

interface Props { invoiceId: string | null; onClose: () => void; }

export default function SalesInvoiceDetailDrawer({ invoiceId, onClose }: Props) {
  const open = !!invoiceId;
  const { data, isPending } = useSalesInvoice(invoiceId ?? undefined);
  const inv = data?.data;
  const { email } = useSalesMutations();
  const [override, setOverride] = useState("");

  const sendEmail = async () => {
    if (!invoiceId) return;
    try {
      const res = await email.mutateAsync({ id: invoiceId, email: override.trim() || undefined });
      if (res.success) { toast.success(res.message ?? "Emailed."); setOverride(""); }
      else toast.error(res.message ?? "Failed.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed.");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="relative w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl fade-up">
        <div className="sticky top-0 bg-gradient-to-br from-brand-600 to-brand-800 text-white px-6 py-5 flex items-start justify-between">
          <div className="min-w-0">
            {isPending || !inv ? (
              <div className="text-sm text-brand-100">Loading…</div>
            ) : (
              <>
                <div className="text-xs uppercase tracking-wider text-brand-200">Sales Invoice</div>
                <h2 className="display-font text-2xl font-extrabold">{inv.invoiceNumber}</h2>
                <div className="text-sm text-brand-100 mt-1">{new Date(inv.invoiceDate).toLocaleString()}</div>
              </>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10"><X className="w-5 h-5" /></button>
        </div>

        {inv && (
          <div className="p-6 space-y-5">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Customer</div>
              <div className="font-semibold text-slate-900">{inv.customerName}</div>
              <div className="text-sm text-slate-600 flex items-center gap-1.5"><Phone className="w-4 h-4" />{inv.customerPhone}</div>
              {inv.vehicleNumber && (
                <div className="text-sm text-slate-600 flex items-center gap-1.5 mt-0.5 font-mono"><Car className="w-4 h-4" />{inv.vehicleNumber}</div>
              )}
              {inv.customerEmail && (
                <div className="text-sm text-slate-600 flex items-center gap-1.5 mt-0.5"><Mail className="w-4 h-4" />{inv.customerEmail}</div>
              )}
            </div>

            <div className="border border-slate-100 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-slate-500">
                    <th className="py-2 px-3">Part</th>
                    <th className="py-2 px-3">Qty</th>
                    <th className="py-2 px-3">Price</th>
                    <th className="py-2 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {inv.items.map((it) => (
                    <tr key={it.id} className="border-t border-slate-100">
                      <td className="py-2 px-3">
                        <div className="font-semibold text-slate-900">{it.partName}</div>
                        <div className="text-xs text-slate-500">{it.partCode}</div>
                      </td>
                      <td className="py-2 px-3">{it.quantity}</td>
                      <td className="py-2 px-3">NPR {Number(it.unitPrice).toFixed(2)}</td>
                      <td className="py-2 px-3 text-right font-semibold">NPR {Number(it.lineTotal).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-gradient-to-br from-brand-50 to-white rounded-2xl p-4 border border-brand-100">
              <Totals label="Subtotal" amount={inv.subTotal} />
              {inv.loyaltyApplied && (
                <div className="flex items-center justify-between py-1 text-emerald-700">
                  <span className="text-sm flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> Loyalty 10%</span>
                  <span className="font-semibold">-NPR {Number(inv.loyaltyDiscount).toFixed(2)}</span>
                </div>
              )}
              {Number(inv.discountAmount) > 0 && <Totals label="Discount" amount={-inv.discountAmount} />}
              {Number(inv.taxAmount) > 0 && <Totals label="Tax" amount={inv.taxAmount} />}
              <div className="h-px bg-brand-100 my-2" />
              <Totals label="Total" amount={inv.totalAmount} bold />
              <Totals label="Paid" amount={inv.paidAmount} />
              {inv.balanceDue > 0 && <Totals label="Balance" amount={inv.balanceDue} danger bold />}
              <div className="mt-3 flex items-center justify-between">
                <Badge tone={inv.paymentStatus === "Paid" ? "emerald" : inv.paymentStatus === "Partial" ? "amber" : "rose"}>
                  {inv.paymentStatus}
                </Badge>
                {inv.loyaltyApplied && <Badge tone="emerald"><Sparkles className="w-3 h-3" /> Loyalty</Badge>}
              </div>
            </div>

            <div className="border border-slate-100 rounded-2xl p-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Mail className="w-4 h-4" /> Email invoice
              </div>
              {inv.emailedAt && <div className="text-xs text-emerald-700 mb-2">Last sent: {new Date(inv.emailedAt).toLocaleString()}</div>}
              <div className="flex gap-2">
                <input className="input text-sm !py-2 flex-1" placeholder={inv.customerEmail ?? "override@email.com"}
                  value={override} onChange={(e) => setOverride(e.target.value)} />
                <button onClick={sendEmail} disabled={email.isPending || (!inv.customerEmail && !override)}
                  className="btn-primary !py-2">
                  {email.isPending ? "Sending…" : <><Receipt className="w-4 h-4" /> Send</>}
                </button>
              </div>
            </div>

            {inv.notes && (
              <div className="text-sm text-slate-600 bg-amber-50 border border-amber-100 rounded-xl p-3">
                {inv.notes}
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}

function Totals({ label, amount, bold, danger }: { label: string; amount: number; bold?: boolean; danger?: boolean }) {
  const color = danger ? "text-rose-600" : "text-slate-900";
  const weight = bold ? "font-bold text-lg" : "";
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`${color} ${weight} tabular-nums`}>NPR {Number(amount).toFixed(2)}</span>
    </div>
  );
}
