import { useState } from "react";
import toast from "react-hot-toast";
import { PackageSearch, Plus, MessageSquare, User, CheckCircle2, XCircle } from "lucide-react";
import Badge from "../../../components/common/Badge";
import Modal from "../../../components/common/Modal";
import TextField from "../../../components/forms/TextField";
import { usePartRequests, usePartRequestMutations } from "../../../hooks/queries/useEngagement";
import type { PartRequest, PartRequestStatus } from "../../../types/engagement";

const toneMap: Record<PartRequestStatus, "amber" | "brand" | "emerald" | "slate"> = {
  Open: "amber", Quoted: "brand", Fulfilled: "emerald", Closed: "slate"
};

interface Props {
  customerId?: string;
  allowCreate?: boolean;
  staffMode?: boolean;
}

export default function PartRequestsPanel({ customerId, allowCreate = true, staffMode = false }: Props) {
  const [createOpen, setCreateOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState<PartRequest | null>(null);
  const [customerReplyOpen, setCustomerReplyOpen] = useState<PartRequest | null>(null);

  const [partName, setPartName] = useState("");
  const [description, setDescription] = useState("");
  const [vehicleInfo, setVehicleInfo] = useState("");

  const [reply, setReply] = useState("");
  const [replyStatus, setReplyStatus] = useState<PartRequestStatus>("Quoted");
  const [customerReplyText, setCustomerReplyText] = useState("");

  const list = usePartRequests({ customerId, pageSize: 20 });
  const { create, reply: replyMut, customerReply: custReplyMut, setStatus } = usePartRequestMutations();

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await create.mutateAsync({ customerId, partName: partName.trim(), description: description.trim() || undefined, vehicleInfo: vehicleInfo.trim() || undefined });
      if (res.success) { toast.success(res.message ?? "Submitted."); setCreateOpen(false); setPartName(""); setDescription(""); setVehicleInfo(""); }
      else toast.error(res.message ?? "Failed.");
    } catch (err: any) { toast.error(err?.response?.data?.message ?? "Failed."); }
  };

  const submitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyOpen) return;
    try {
      const res = await replyMut.mutateAsync({ id: replyOpen.id, payload: { reply: reply.trim(), status: replyStatus } });
      if (res.success) { toast.success(res.message ?? "Sent."); setReplyOpen(null); setReply(""); setReplyStatus("Quoted"); }
      else toast.error(res.message ?? "Failed.");
    } catch (err: any) { toast.error(err?.response?.data?.message ?? "Failed."); }
  };

  const submitCustomerReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerReplyOpen) return;
    try {
      const res = await custReplyMut.mutateAsync({ id: customerReplyOpen.id, reply: customerReplyText.trim() });
      if (res.success) { toast.success("Reply sent."); setCustomerReplyOpen(null); setCustomerReplyText(""); }
      else toast.error(res.message ?? "Failed.");
    } catch (err: any) { toast.error(err?.response?.data?.message ?? "Failed."); }
  };

  const handleSetStatus = async (pr: PartRequest, status: PartRequestStatus) => {
    try {
      const res = await setStatus.mutateAsync({ id: pr.id, status });
      if (res.success) toast.success(res.message ?? "Updated.");
      else toast.error(res.message ?? "Failed.");
    } catch (err: any) { toast.error(err?.response?.data?.message ?? "Failed."); }
  };

  const items = list.data?.data?.items ?? [];

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="display-font font-bold text-lg text-slate-900 flex items-center gap-2">
          <PackageSearch className="w-5 h-5 text-brand-600" /> Part Requests
        </h3>
        {allowCreate && (
          <button onClick={() => setCreateOpen(true)} className="btn-primary !py-1.5 !px-3 text-sm">
            <Plus className="w-4 h-4" /> Request
          </button>
        )}
      </div>

      {list.isPending ? (
        <div className="py-6 text-center text-sm text-slate-400">Loading…</div>
      ) : items.length === 0 ? (
        <div className="py-10 text-center text-sm text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl">
          No part requests yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((pr) => (
            <li key={pr.id} className="border border-slate-100 rounded-2xl p-4 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-semibold text-slate-900">{pr.partName}</div>
                    <Badge tone={toneMap[pr.status]}>{pr.status}</Badge>
                  </div>
                  {staffMode && <div className="text-xs text-slate-500 mt-0.5">{pr.customerName}</div>}
                  {pr.description && <div className="text-xs text-slate-600 mt-1">{pr.description}</div>}
                  {pr.vehicleInfo && <div className="text-xs text-slate-500 mt-0.5">Vehicle: {pr.vehicleInfo}</div>}
                  <div className="text-[11px] text-slate-400 mt-1">{new Date(pr.createdAt).toLocaleDateString()}</div>
                </div>

                {/* Staff action buttons */}
                {staffMode && (
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() => { setReplyOpen(pr); setReply(pr.staffReply ?? ""); setReplyStatus(pr.status); }}
                      className="btn-outline !py-1 !px-2.5 text-xs">
                      <MessageSquare className="w-3 h-3" /> Reply
                    </button>
                    {pr.status !== "Fulfilled" && (
                      <button
                        onClick={() => handleSetStatus(pr, "Fulfilled")}
                        disabled={setStatus.isPending}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-40 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Confirm
                      </button>
                    )}
                    {pr.status !== "Closed" && (
                      <button
                        onClick={() => handleSetStatus(pr, "Closed")}
                        disabled={setStatus.isPending}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:opacity-40 border border-rose-200">
                        <XCircle className="w-3 h-3" /> Close
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Conversation thread */}
              {pr.staffReply && (
                <div className="border-l-2 border-brand-200 pl-3 bg-brand-50/60 rounded-r-lg py-2 pr-2">
                  <div className="text-[10px] font-semibold text-brand-600 uppercase tracking-wider flex items-center gap-1 mb-1">
                    <MessageSquare className="w-3 h-3" /> Staff reply
                    {pr.repliedAt && <span className="font-normal text-slate-400 normal-case tracking-normal ml-1">· {new Date(pr.repliedAt).toLocaleDateString()}</span>}
                  </div>
                  <div className="text-xs text-slate-700">{pr.staffReply}</div>
                </div>
              )}

              {pr.customerReply && (
                <div className="border-l-2 border-slate-300 pl-3 bg-slate-50 rounded-r-lg py-2 pr-2">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
                    <User className="w-3 h-3" /> Customer reply
                    {pr.customerRepliedAt && <span className="font-normal text-slate-400 normal-case tracking-normal ml-1">· {new Date(pr.customerRepliedAt).toLocaleDateString()}</span>}
                  </div>
                  <div className="text-xs text-slate-700">{pr.customerReply}</div>
                </div>
              )}

              {/* Customer reply button — only when staff has replied and customer hasn't replied yet */}
              {!staffMode && pr.staffReply && !pr.customerReply && pr.status !== "Closed" && (
                <button
                  onClick={() => { setCustomerReplyOpen(pr); setCustomerReplyText(""); }}
                  className="text-xs text-brand-600 font-semibold hover:underline flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" /> Reply to staff
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Create request modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Request a part" size="md">
        <form onSubmit={submitCreate} className="space-y-4">
          <TextField label="Part name *" required placeholder="e.g. Brake pads"
            value={partName} onChange={(e) => setPartName(e.target.value)} />
          <TextField label="Vehicle info" placeholder="e.g. Bajaj Pulsar 150, 2021"
            value={vehicleInfo} onChange={(e) => setVehicleInfo(e.target.value)} />
          <div>
            <label className="label">Description</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
              className="input resize-none" placeholder="Any extra details?" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setCreateOpen(false)} className="btn-ghost" disabled={create.isPending}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={create.isPending}>
              {create.isPending ? "Sending…" : "Submit"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Staff reply modal */}
      <Modal open={!!replyOpen} onClose={() => setReplyOpen(null)} title={`Reply to "${replyOpen?.partName ?? ""}"`} size="md">
        <form onSubmit={submitReply} className="space-y-4">
          <div>
            <label className="label">Reply *</label>
            <textarea required rows={4} value={reply} onChange={(e) => setReply(e.target.value)}
              className="input resize-none" placeholder="Quote, availability, ETA…" />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={replyStatus} onChange={(e) => setReplyStatus(e.target.value as PartRequestStatus)}>
              <option value="Quoted">Quoted</option>
              <option value="Fulfilled">Fulfilled</option>
              <option value="Closed">Closed</option>
              <option value="Open">Open</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setReplyOpen(null)} className="btn-ghost" disabled={replyMut.isPending}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={replyMut.isPending}>
              {replyMut.isPending ? "Sending…" : "Send reply"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Customer reply modal */}
      <Modal open={!!customerReplyOpen} onClose={() => setCustomerReplyOpen(null)} title="Reply to staff" size="md">
        {customerReplyOpen?.staffReply && (
          <div className="mb-4 border-l-2 border-brand-200 pl-3 bg-brand-50/60 rounded-r-lg py-2 pr-2">
            <div className="text-[10px] font-semibold text-brand-600 uppercase tracking-wider mb-1">Staff said</div>
            <div className="text-sm text-slate-700">{customerReplyOpen.staffReply}</div>
          </div>
        )}
        <form onSubmit={submitCustomerReply} className="space-y-4">
          <div>
            <label className="label">Your reply *</label>
            <textarea required rows={3} value={customerReplyText} onChange={(e) => setCustomerReplyText(e.target.value)}
              className="input resize-none" placeholder="Confirm, ask questions, provide more info…" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setCustomerReplyOpen(null)} className="btn-ghost" disabled={custReplyMut.isPending}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={custReplyMut.isPending}>
              {custReplyMut.isPending ? "Sending…" : "Send reply"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
