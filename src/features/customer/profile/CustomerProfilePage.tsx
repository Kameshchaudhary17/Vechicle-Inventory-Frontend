import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { User, Phone, Mail, MapPin, StickyNote, Save } from "lucide-react";
import PageHeader from "../../../components/common/PageHeader";
import TextField from "../../../components/forms/TextField";
import { useMyProfile, useMyMutations } from "../../../hooks/queries/useCustomerSelf";

export default function CustomerProfilePage() {
  const { data, isPending } = useMyProfile();
  const customer = data?.data;
  const { updateProfile } = useMyMutations();

  const [form, setForm] = useState({ fullName: "", phoneNumber: "", email: "", address: "", notes: "" });

  useEffect(() => {
    if (!customer) return;
    setForm({
      fullName: customer.fullName,
      phoneNumber: customer.phoneNumber,
      email: customer.email ?? "",
      address: customer.address ?? "",
      notes: customer.notes ?? ""
    });
  }, [customer]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await updateProfile.mutateAsync({
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        notes: form.notes.trim() || undefined
      });
      if (res.success) toast.success(res.message ?? "Profile updated.");
      else toast.error(res.message ?? "Failed.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Account" title="My Profile" subtitle="Keep your contact details up to date." />

      {isPending ? (
        <div className="card p-6 text-sm text-slate-500">Loading…</div>
      ) : !customer ? (
        <div className="card p-6 text-sm text-slate-500">Profile unavailable. Refresh the page.</div>
      ) : (
        <form onSubmit={submit} className="card p-6 space-y-5 max-w-3xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Full name *" required icon={<User className="w-5 h-5" />}
              value={form.fullName} onChange={set("fullName")} />
            <TextField label="Phone *" required inputMode="tel" icon={<Phone className="w-5 h-5" />}
              value={form.phoneNumber} onChange={set("phoneNumber")} />
            <TextField label="Email" type="email" icon={<Mail className="w-5 h-5" />}
              value={form.email} onChange={set("email")} />
            <TextField label="Address" icon={<MapPin className="w-5 h-5" />}
              value={form.address} onChange={set("address")} />
          </div>
          <div>
            <label className="label">Notes</label>
            <div className="relative">
              <StickyNote className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
              <textarea rows={3} value={form.notes} onChange={set("notes")}
                className="input pl-11 resize-none" placeholder="Preferences, alternate contact…" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn-primary" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? "Saving…" : <><Save className="w-4 h-4" /> Save changes</>}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
