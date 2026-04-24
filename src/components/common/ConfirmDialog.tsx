import Modal from "./Modal";
import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({
  open, onCancel, onConfirm, title, message, confirmLabel = "Confirm", danger = false, loading = false
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
}) {
  return (
    <Modal open={open} onClose={onCancel} size="sm">
      <div className="flex gap-4">
        <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${danger ? "bg-rose-100 text-rose-700" : "bg-brand-100 text-brand-700"}`}>
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
          <p className="text-sm text-slate-600">{message}</p>
          <div className="flex justify-end gap-2 mt-5">
            <button onClick={onCancel} className="btn-ghost" disabled={loading}>Cancel</button>
            <button onClick={onConfirm} disabled={loading}
              className={`btn text-white ${danger ? "bg-rose-600 hover:bg-rose-700" : "bg-brand-600 hover:bg-brand-700"}`}>
              {loading ? "Working…" : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
