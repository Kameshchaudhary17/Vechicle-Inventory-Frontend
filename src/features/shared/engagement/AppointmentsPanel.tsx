import { useState } from "react";
import toast from "react-hot-toast";
import { CalendarDays, Car, Clock, Plus } from "lucide-react";
import Badge from "../../../components/common/Badge";
import Modal from "../../../components/common/Modal";
import TextField from "../../../components/forms/TextField";
import { useAppointments, useAppointmentMutations } from "../../../hooks/queries/useEngagement";
import { useCustomer } from "../../../hooks/queries/useCustomers";
import type { AppointmentStatus } from "../../../types/engagement";

export default function AppointmentsPanel({ customerId, allowCreate = true, staffMode = false }: { customerId?: string; allowCreate?: boolean; staffMode?: boolean }) {
  const [open, setOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [notes, setNotes] = useState("");
  const [vehicleId, setVehicleId] = useState("");

  const list = useAppointments({ customerId, pageSize: 20 });
  const { create, setStatus } = useAppointmentMutations();
  const cust = useCustomer(customerId);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await create.mutateAsync({
        customerId,
        vehicleId: vehicleId || undefined,
        scheduledAt: new Date(scheduledAt).toISOString(),
        serviceType: serviceType.trim(),
        notes: notes.trim() || undefined
      });
      if (res.success) {
        toast.success(res.message ?? "Booked.");
        setOpen(false); setScheduledAt(""); setServiceType(""); setNotes(""); setVehicleId("");
      } else toast.error(res.message ?? "Failed.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed.");
    }
  };

  const changeStatus = async (id: string, s: AppointmentStatus) => {
    try {
      const res = await setStatus.mutateAsync({ id, status: s });
      if (res.success) toast.success(res.message ?? "Updated.");
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
          <CalendarDays className="w-5 h-5 text-brand-600" /> Appointments
        </h3>
        {allowCreate && (
          <button onClick={() => setOpen(true)} className="btn-primary !py-1.5 !px-3 text-sm">
            <Plus className="w-4 h-4" /> Book
          </button>
        )}
      </div>

      {list.isPending ? (
        <div className="py-6 text-center text-sm text-slate-400">Loading…</div>
      ) : items.length === 0 ? (
        <div className="py-10 text-center text-sm text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl">
          No appointments scheduled.
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((a) => (
            <li key={a.id} className="border border-slate-100 rounded-2xl p-4 hover:border-brand-200 transition">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-slate-900">{a.serviceType}</div>
                    <StatusBadge status={a.status} />
                  </div>
                  {staffMode && <div className="text-xs text-slate-600 mt-0.5">{a.customerName}</div>}
                  <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(a.scheduledAt).toLocaleString()}</span>
                    {a.vehicleNumber && <span className="inline-flex items-center gap-1 font-mono"><Car className="w-3 h-3" />{a.vehicleNumber}</span>}
                  </div>
                  {a.notes && <div className="text-xs text-slate-600 mt-2">{a.notes}</div>}
                </div>
                {staffMode && (
                  <select value={a.status} onChange={(e) => changeStatus(a.id, e.target.value as AppointmentStatus)}
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white">
                    <option value="Requested">Requested</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Book appointment" size="md">
        <form onSubmit={submit} className="space-y-4">
          <TextField label="Service type *" required placeholder="e.g. Engine check"
            value={serviceType} onChange={(e) => setServiceType(e.target.value)} />
          <TextField label="Scheduled at *" required type="datetime-local"
            value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
          {cust.data?.data?.vehicles && cust.data.data.vehicles.length > 0 && (
            <div>
              <label className="label">Vehicle</label>
              <select className="input" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
                <option value="">— Select —</option>
                {cust.data.data.vehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.vehicleNumber} ({v.make} {v.model})</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="label">Notes</label>
            <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
              className="input resize-none" placeholder="Optional" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost" disabled={create.isPending}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={create.isPending}>
              {create.isPending ? "Booking…" : "Book"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const tone: Record<AppointmentStatus, "amber" | "brand" | "emerald" | "rose"> = {
    Requested: "amber", Confirmed: "brand", Completed: "emerald", Cancelled: "rose"
  };
  return <Badge tone={tone[status]}>{status}</Badge>;
}
