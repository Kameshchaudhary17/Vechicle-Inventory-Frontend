import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowRight, Mail } from "lucide-react";
import { authApi } from "../../../services/api/authApi";
import { useAuth } from "../../../context/AuthContext";
import { roleHome } from "../../../lib/utils/roleHome";
import AuthLayout from "../../../layouts/AuthLayout/AuthLayout";
import TextField from "../../../components/forms/TextField";
import PasswordInput from "../../../components/forms/PasswordInput";

export default function LoginPage() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login(form);
      if (res.success && res.data) {
        login(res.data);
        toast.success(res.message ?? "Welcome back.");
        nav(roleHome(res.data.role));
      } else toast.error(res.message ?? "Login failed.");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Login failed.";
      toast.error(msg);
      if (String(msg).toLowerCase().includes("not verified"))
        nav(`/verify-otp?email=${encodeURIComponent(form.email)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      heroTitle="Welcome back."
      heroSubtitle="Sign in to pick up right where you left off — sales, inventory, customers and reports."
    >
      <form onSubmit={submit} className="card p-8 space-y-5">
        <div>
          <h2 className="display-font text-2xl font-bold text-slate-900">Sign in</h2>
          <p className="text-slate-500 text-sm mt-1">Enter your email and password to continue.</p>
        </div>

        <TextField
          label="Email address" name="email" type="email" autoComplete="email"
          placeholder="you@example.com" icon={<Mail className="w-5 h-5" />}
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
        />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
            <a href="#" onClick={(e) => { e.preventDefault(); toast("Password reset coming soon."); }}
              className="text-xs text-brand-700 font-medium hover:underline">Forgot password?</a>
          </div>
          <PasswordInput
            id="password" name="password" autoComplete="current-password"
            placeholder="••••••••"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-200" />
          Remember me for 30 days
        </label>

        <button disabled={loading} className="btn-primary w-full">
          {loading ? "Signing in…" : (<>Sign in <ArrowRight className="w-4 h-4" /></>)}
        </button>

        <p className="text-sm text-slate-500 text-center pt-1">
          New here?{" "}
          <Link to="/register" className="text-brand-700 font-semibold hover:underline">Create an account</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
