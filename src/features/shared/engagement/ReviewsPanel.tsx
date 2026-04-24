import { useState } from "react";
import toast from "react-hot-toast";
import { Star, Plus } from "lucide-react";
import Modal from "../../../components/common/Modal";
import { useReviews, useReviewMutations } from "../../../hooks/queries/useEngagement";

export default function ReviewsPanel({ customerId, allowCreate = true, staffMode = false }: { customerId?: string; allowCreate?: boolean; staffMode?: boolean }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const list = useReviews({ customerId, pageSize: 20 });
  const { create } = useReviewMutations();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await create.mutateAsync({ customerId, rating, comment: comment.trim() || undefined });
      if (res.success) { toast.success(res.message ?? "Thanks!"); setOpen(false); setComment(""); setRating(5); }
      else toast.error(res.message ?? "Failed.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed.");
    }
  };

  const items = list.data?.data?.items ?? [];

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="display-font font-bold text-lg text-slate-900 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" /> Reviews
        </h3>
        {allowCreate && (
          <button onClick={() => setOpen(true)} className="btn-primary !py-1.5 !px-3 text-sm">
            <Plus className="w-4 h-4" /> Review
          </button>
        )}
      </div>

      {list.isPending ? (
        <div className="py-6 text-center text-sm text-slate-400">Loading…</div>
      ) : items.length === 0 ? (
        <div className="py-10 text-center text-sm text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl">
          No reviews yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((r) => (
            <li key={r.id} className="border border-slate-100 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className={`w-4 h-4 ${n <= r.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                  ))}
                </div>
                <span className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              {staffMode && <div className="text-xs font-semibold text-slate-600 mt-1">{r.customerName}</div>}
              {r.comment && <p className="text-sm text-slate-700 mt-2">{r.comment}</p>}
              {r.invoiceNumber && <div className="text-[11px] text-slate-500 mt-1">For invoice {r.invoiceNumber}</div>}
            </li>
          ))}
        </ul>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Leave a review" size="sm">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setRating(n)}
                  className="p-1 rounded">
                  <Star className={`w-7 h-7 ${n <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Comment</label>
            <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)}
              className="input resize-none" placeholder="How was the service?" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost" disabled={create.isPending}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={create.isPending}>
              {create.isPending ? "Submitting…" : "Submit"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
