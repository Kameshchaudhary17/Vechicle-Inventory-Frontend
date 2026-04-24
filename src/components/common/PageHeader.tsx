import type { ReactNode } from "react";

export default function PageHeader({
  title, subtitle, actions, eyebrow
}: { title: string; subtitle?: string; actions?: ReactNode; eyebrow?: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
      <div className="min-w-0">
        {eyebrow && <div className="text-xs font-semibold text-brand-600 uppercase tracking-[0.12em] mb-1">{eyebrow}</div>}
        <h1 className="display-font text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
