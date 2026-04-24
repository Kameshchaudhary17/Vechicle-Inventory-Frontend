import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Bell, AlertTriangle, CreditCard, CheckCircle2, X, Trash2 } from "lucide-react";
import { useNotifications } from "../../hooks/queries/useNotifications";
import type { NotificationItem } from "../../services/api/notificationApi";

const LS_VIEWED = "notif_viewed_v2";
const LS_DISMISSED = "notif_dismissed_v2";
const SS_TOASTED = "notif_toasted_v2";

// Clear old keys from previous versions
["notif_viewed", "notif_dismissed", "notif_alerted", "notif_toasted"].forEach((k) => localStorage.removeItem(k));
sessionStorage.removeItem("notif_alerted");

function load(key: string): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(key) ?? "{}"); } catch { return {}; }
}

function SeverityIcon({ s }: { s: NotificationItem["severity"] }) {
  if (s === "error") return <AlertTriangle className="w-4 h-4 text-rose-500" />;
  if (s === "warning") return <AlertTriangle className="w-4 h-4 text-amber-500" />;
  return <CreditCard className="w-4 h-4 text-brand-500" />;
}

function itemBg(s: NotificationItem["severity"]) {
  if (s === "error") return "bg-rose-50 border-rose-200";
  if (s === "warning") return "bg-amber-50 border-amber-200";
  return "bg-brand-50 border-brand-100";
}

export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data } = useNotifications();
  const allItems = data?.data ?? [];

  const [dismissed, setDismissed] = useState<Record<string, number>>(load(LS_DISMISSED));
  const [viewed, setViewed] = useState<Record<string, number>>(load(LS_VIEWED));

  // Notifications whose count has grown beyond what was dismissed
  const visibleItems = allItems.filter((n) => n.count > (dismissed[n.type] ?? 0));

  // Red dot: any visible notification has a count the user hasn't seen yet
  const hasUnread = visibleItems.some((n) => n.count > (viewed[n.type] ?? 0));

  // Close panel on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Fire toast once per session for unread notifications
  useEffect(() => {
    if (!visibleItems.length) return;
    const unread = visibleItems.filter((n) => n.count > (viewed[n.type] ?? 0));
    if (!unread.length) return;
    if (sessionStorage.getItem(SS_TOASTED)) return;
    sessionStorage.setItem(SS_TOASTED, "1");

    unread.forEach((n) => {
      toast.custom(
        (t) => (
          <div className={`flex items-start gap-3 px-4 py-3 rounded-2xl shadow-lg border max-w-sm w-full ${
            n.severity === "error" ? "bg-rose-50 border-rose-200" : "bg-amber-50 border-amber-200"
          } ${t.visible ? "animate-enter" : "animate-leave"}`}>
            <AlertTriangle className={`w-5 h-5 mt-0.5 shrink-0 ${n.severity === "error" ? "text-rose-500" : "text-amber-500"}`} />
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-semibold ${n.severity === "error" ? "text-rose-900" : "text-amber-900"}`}>{n.title}</div>
              <div className={`text-xs mt-0.5 ${n.severity === "error" ? "text-rose-700" : "text-amber-700"}`}>{n.message}</div>
            </div>
            <button onClick={() => toast.dismiss(t.id)} className="shrink-0 p-0.5 rounded hover:opacity-70">
              <X className={`w-4 h-4 ${n.severity === "error" ? "text-rose-500" : "text-amber-500"}`} />
            </button>
          </div>
        ),
        { duration: 8000, position: "top-right" }
      );
    });
  }, [visibleItems]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next && hasUnread) {
      // Mark all visible items as viewed → red dot disappears
      const updated: Record<string, number> = { ...viewed };
      visibleItems.forEach((n) => { updated[n.type] = n.count; });
      setViewed(updated);
      localStorage.setItem(LS_VIEWED, JSON.stringify(updated));
    }
  };

  const dismissItem = (n: NotificationItem) => {
    const updated = { ...dismissed, [n.type]: n.count };
    setDismissed(updated);
    localStorage.setItem(LS_DISMISSED, JSON.stringify(updated));
    // Also mark as viewed so red dot doesn't flicker
    const updatedViewed = { ...viewed, [n.type]: n.count };
    setViewed(updatedViewed);
    localStorage.setItem(LS_VIEWED, JSON.stringify(updatedViewed));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative p-2.5 rounded-xl hover:bg-slate-100 text-slate-700 transition"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {hasUnread && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-white border border-slate-100 shadow-soft overflow-hidden fade-up z-50">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="font-semibold text-slate-900 text-sm">Notifications</span>
            {visibleItems.length > 0 && (
              <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                {visibleItems.reduce((s, n) => s + n.count, 0)} alert{visibleItems.reduce((s, n) => s + n.count, 0) === 1 ? "" : "s"}
              </span>
            )}
          </div>
          <div className="p-2 space-y-1.5 max-h-80 overflow-y-auto">
            {visibleItems.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-slate-400">
                <CheckCircle2 className="w-8 h-8" />
                <span className="text-sm">All good — no alerts</span>
              </div>
            ) : (
              visibleItems.map((n) => (
                <div key={n.type} className={`flex items-start gap-3 p-3 rounded-xl border ${itemBg(n.severity)}`}>
                  <div className="mt-0.5 shrink-0"><SeverityIcon s={n.severity} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900">{n.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{n.message}</div>
                  </div>
                  <button
                    onClick={() => dismissItem(n)}
                    className="shrink-0 p-1 rounded-lg hover:bg-black/5 text-slate-400 hover:text-slate-600"
                    title="Dismiss"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
