import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Package, ArrowRight, X } from "lucide-react";
import { partApi } from "../../services/api/partApi";
import { useNotifications } from "../../hooks/queries/useNotifications";
import type { Part } from "../../types/part";

function todayKey() {
  return `low_stock_alert_${new Date().toDateString()}`;
}

interface Props {
  partsPath?: string;
}

export default function LowStockAlertModal({ partsPath = "/admin/parts" }: Props) {
  const [open, setOpen] = useState(false);
  const [parts, setParts] = useState<Part[]>([]);
  const [dismissed, setDismissed] = useState(() => !!localStorage.getItem(todayKey()));
  const navigate = useNavigate();
  const { data } = useNotifications();

  const hasLowStock = (data?.data ?? []).some((n) => n.type === "LowStock");

  useEffect(() => {
    if (dismissed || !hasLowStock || open) return;

    partApi.staffList({ activeOnly: true, lowStockOnly: true, pageSize: 50 })
      .then((res) => {
        const items = res.data?.items ?? [];
        if (items.length > 0) {
          setParts(items);
          setOpen(true);
        }
      })
      .catch(() => {});
  }, [hasLowStock, dismissed]); // eslint-disable-line react-hooks/exhaustive-deps

  const dismiss = () => {
    localStorage.setItem(todayKey(), "1");
    setDismissed(true);
    setOpen(false);
  };

  const goToParts = () => {
    dismiss();
    navigate(`${partsPath}?lowStockOnly=true`);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={dismiss} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-amber-50 border-b border-amber-100 px-5 py-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-slate-900">Low Stock Alert</div>
            <div className="text-sm text-amber-700 mt-0.5">
              {parts.length} part{parts.length === 1 ? "" : "s"} with stock below 10 — immediate restocking needed.
            </div>
          </div>
          <button onClick={dismiss} className="p-1 rounded-lg hover:bg-amber-100 text-amber-500 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
          {parts.map((p) => (
            <div key={p.id} className="flex items-center gap-3 px-5 py-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <Package className="w-4 h-4 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-900 truncate">{p.name}</div>
                <div className="text-xs text-slate-500">{p.code}</div>
              </div>
              <div className="text-right shrink-0">
                <div className={`text-sm font-bold ${p.stockQty === 0 ? "text-rose-600" : "text-amber-600"}`}>
                  {p.stockQty} <span className="text-xs font-normal text-slate-400">{p.unit}</span>
                </div>
                {p.reorderLevel > 0 && (
                  <div className="text-[10px] text-slate-400">reorder at {p.reorderLevel}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button onClick={dismiss} className="btn-ghost text-sm">
            Dismiss
          </button>
          <button onClick={goToParts} className="btn-primary text-sm flex items-center gap-1.5">
            View Parts <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
