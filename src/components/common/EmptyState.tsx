import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export default function EmptyState({
  icon: Icon, title, message, action
}: { icon: LucideIcon; title: string; message?: string; action?: ReactNode }) {
  return (
    <div className="text-center py-16 px-6">
      <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-slate-400" />
      </div>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      {message && <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
