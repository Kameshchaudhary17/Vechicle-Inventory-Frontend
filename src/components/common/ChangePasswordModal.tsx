import { useState } from "react";
import toast from "react-hot-toast";
import { KeyRound } from "lucide-react";
import Modal from "./Modal";
import PasswordInput from "../forms/PasswordInput";
import PasswordStrengthMeter from "../forms/PasswordStrengthMeter";
import { evaluatePassword } from "../../lib/utils/passwordStrength";
import { authApi } from "../../services/api/authApi";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ open, onClose }: Props) {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const pwStrong = evaluatePassword(form.next).score >= 4;
  const pwMatch = form.confirm.length > 0 && form.next === form.confirm;
  const canSubmit = form.current.length > 0 && pwStrong && pwMatch;

  const close = () => {
    setForm({ current: "", next: "", confirm: "" });
    onClose();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      const res = await authApi.changePassword({ currentPassword: form.current, newPassword: form.next });
      if (res.success) {
        toast.success("Password changed.");
        close();
      } else {
        toast.error(res.message ?? "Failed.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={close} title="Change Password">
      <form onSubmit={submit} className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <KeyRound className="w-4 h-4 shrink-0" />
          Choose a strong password you haven't used before.
        </div>

        <div>
          <label className="label">Current password</label>
          <PasswordInput
            id="current-password"
            name="currentPassword"
            placeholder="Enter current password"
            value={form.current}
            onChange={(e) => setForm((s) => ({ ...s, current: e.target.value }))}
            required
          />
        </div>

        <div>
          <label className="label">New password</label>
          <PasswordInput
            id="new-password"
            name="newPassword"
            placeholder="Create new password"
            value={form.next}
            onChange={(e) => setForm((s) => ({ ...s, next: e.target.value }))}
            required
          />
          <PasswordStrengthMeter password={form.next} />
        </div>

        <div>
          <label className="label">Confirm new password</label>
          <PasswordInput
            id="confirm-password"
            name="confirmPassword"
            placeholder="Re-enter new password"
            value={form.confirm}
            onChange={(e) => setForm((s) => ({ ...s, confirm: e.target.value }))}
            required
          />
          {form.confirm.length > 0 && (
            <p className={`text-xs mt-1 ${pwMatch ? "text-emerald-600" : "text-rose-600"}`}>
              {pwMatch ? "Passwords match" : "Passwords do not match"}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={close} className="btn-ghost" disabled={loading}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={loading || !canSubmit}>
            {loading ? "Saving…" : "Change password"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
