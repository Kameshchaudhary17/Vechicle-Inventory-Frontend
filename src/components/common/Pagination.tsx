import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  page, totalPages, onChange
}: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  const pages = pageWindow(page, totalPages);
  return (
    <div className="flex items-center justify-end gap-1 mt-4">
      <button onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1}
        className="btn-ghost !px-2 !py-1.5 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
      {pages.map((p, i) =>
        p === -1 ? (
          <span key={`e${i}`} className="px-2 text-slate-400">…</span>
        ) : (
          <button key={p} onClick={() => onChange(p)}
            className={`min-w-[36px] h-9 rounded-lg text-sm font-medium ${
              p === page ? "bg-brand-600 text-white" : "hover:bg-slate-100 text-slate-700"
            }`}>{p}</button>
        )
      )}
      <button onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}
        className="btn-ghost !px-2 !py-1.5 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
    </div>
  );
}

function pageWindow(page: number, total: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: number[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) pages.push(-1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push(-1);
  pages.push(total);
  return pages;
}
