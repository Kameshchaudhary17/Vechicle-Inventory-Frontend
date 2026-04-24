import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, Phone, User, CheckCircle2, ArrowRight } from "lucide-react";
import { authApi } from "../../../services/api/authApi";
import AuthLayout from "../../../layouts/AuthLayout/AuthLayout";
import TextField from "../../../components/forms/TextField";
import PasswordInput from "../../../components/forms/PasswordInput";
import PasswordStrengthMeter from "../../../components/forms/PasswordStrengthMeter";
import { evaluatePassword } from "../../../lib/utils/passwordStrength";

export default function RegisterPage() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: ""
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const onChange = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((s) => ({ ...s, [k]: e.target.value }));
  const markTouched = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }));

  const errors = useMemo(() => {
    const e: Partial<Record<keyof typeof form, string>> = {};
    if (touched.fullName && form.fullName.trim().length < 2) e.fullName = "Please enter your full name.";
    if (touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address.";
    if (touched.phoneNumber && !/^\+?[0-9]{7,15}$/.test(form.phoneNumber)) e.phoneNumber = "Enter a valid phone number.";
    if (touched.password && evaluatePassword(form.password).score < 4)
      e.password = "Needs 8+ chars, upper, lower and a digit.";
    if (touched.confirmPassword && form.confirmPassword !== form.password)
      e.confirmPassword = "Passwords do not match.";
    return e;
  }, [form, touched]);

  const canSubmit =
    form.fullName.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    /^\+?[0-9]{7,15}$/.test(form.phoneNumber) &&
    evaluatePassword(form.password).score >= 4 &&
    form.password === form.confirmPassword &&
    accepted;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ fullName: true, email: true, phoneNumber: true, password: true, confirmPassword: true });
    if (!canSubmit) return;
    setLoading(true);
    try {
      const res = await authApi.register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
        password: form.password,
        role: 3
      });
      if (res.success) {
        toast.success(res.message ?? "OTP sent to your email.");
        nav(`/verify-otp?email=${encodeURIComponent(form.email.trim())}`);
      } else toast.error(res.message ?? "Registration failed.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const pwMatch = form.confirmPassword && form.confirmPassword === form.password;

  return (
    <AuthLayout
      heroTitle="Create your account."
      heroSubtitle="Track parts, service your vehicles, and manage credits — all in one place."
    >
      <form onSubmit={submit} className="card p-8 space-y-5">
        <div>
          <h2 className="display-font text-2xl font-bold text-slate-900">Sign up</h2>
          <p className="text-slate-500 text-sm mt-1">It takes less than a minute. Verify via email OTP.</p>
        </div>

        <TextField
          label="Full name" name="fullName" autoComplete="name"
          placeholder="John Doe" icon={<User className="w-5 h-5" />}
          value={form.fullName} onChange={onChange("fullName")} onBlur={markTouched("fullName")}
          error={errors.fullName} required
        />

        <TextField
          label="Email address" name="email" type="email" autoComplete="email"
          placeholder="you@example.com" icon={<Mail className="w-5 h-5" />}
          value={form.email} onChange={onChange("email")} onBlur={markTouched("email")}
          error={errors.email} required
        />

        <TextField
          label="Phone number" name="phoneNumber" autoComplete="tel" inputMode="tel"
          placeholder="98XXXXXXXX" icon={<Phone className="w-5 h-5" />}
          value={form.phoneNumber} onChange={onChange("phoneNumber")} onBlur={markTouched("phoneNumber")}
          error={errors.phoneNumber} required
        />

        <div>
          <label htmlFor="password" className="label">Password</label>
          <PasswordInput
            id="password" name="password" autoComplete="new-password"
            placeholder="Create a strong password"
            value={form.password} onChange={onChange("password")} onBlur={markTouched("password")}
            error={!!errors.password} required
          />
          <PasswordStrengthMeter password={form.password} />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="label">Confirm password</label>
          <PasswordInput
            id="confirmPassword" name="confirmPassword" autoComplete="new-password"
            placeholder="Re-enter password"
            value={form.confirmPassword} onChange={onChange("confirmPassword")} onBlur={markTouched("confirmPassword")}
            error={!!errors.confirmPassword} required
          />
          {errors.confirmPassword ? (
            <p className="text-xs text-rose-600 mt-1">{errors.confirmPassword}</p>
          ) : pwMatch ? (
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
            </p>
          ) : null}
        </div>

        <label className="flex items-start gap-3 text-sm text-slate-600 select-none cursor-pointer">
          <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-200" />
          <span>
            I agree to the <a className="text-brand-700 font-medium hover:underline" href="#">Terms of Service</a>
            {" "}and <a className="text-brand-700 font-medium hover:underline" href="#">Privacy Policy</a>.
          </span>
        </label>

        <button disabled={loading || !canSubmit} className="btn-primary w-full">
          {loading ? "Sending OTP…" : (<>Create account <ArrowRight className="w-4 h-4" /></>)}
        </button>

        <p className="text-sm text-slate-500 text-center pt-1">
          Already have an account?{" "}
          <Link to="/login" className="text-brand-700 font-semibold hover:underline">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
