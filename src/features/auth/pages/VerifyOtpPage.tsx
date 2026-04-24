import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowRight, Mail, ShieldCheck } from "lucide-react";
import { authApi } from "../../../services/api/authApi";
import { useAuth } from "../../../context/AuthContext";
import { roleHome } from "../../../lib/utils/roleHome";
import AuthLayout from "../../../layouts/AuthLayout/AuthLayout";

const OTP_TTL_SECONDS = 600;

export default function VerifyOtpPage() {
  const [params] = useSearchParams();
  const email = params.get("email") ?? "";
  const nav = useNavigate();
  const { login } = useAuth();
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [ttl, setTtl] = useState(OTP_TTL_SECONDS);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { if (!email) nav("/register"); }, [email, nav]);
  useEffect(() => { refs.current[0]?.focus(); }, []);

  useEffect(() => {
    if (ttl <= 0) return;
    const t = setTimeout(() => setTtl((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [ttl]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const verify = async (code: string) => {
    setLoading(true);
    try {
      const res = await authApi.verifyOtp({ email, code });
      if (res.success && res.data) {
        login(res.data);
        toast.success("Account verified.");
        nav(roleHome(res.data.role));
      } else toast.error(res.message ?? "Verification failed.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  const setDigit = (i: number, v: string) => {
    const c = v.replace(/\D/g, "").slice(0, 1);
    const next = [...digits];
    next[i] = c;
    setDigits(next);
    if (c && i < 5) refs.current[i + 1]?.focus();
    if (c && i === 5 && next.every((d) => d)) verify(next.join(""));
  };

  const onKeyDown = (i: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) refs.current[i + 1]?.focus();
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const arr = text.split("");
    const next = digits.map((_, i) => arr[i] ?? "");
    setDigits(next);
    refs.current[Math.min(arr.length, 5)]?.focus();
    if (arr.length === 6) verify(arr.join(""));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length !== 6) { toast.error("Enter all 6 digits."); return; }
    verify(code);
  };

  const resend = async () => {
    if (cooldown > 0) return;
    setResending(true);
    try {
      const res = await authApi.resendOtp(email);
      if (res.success) {
        toast.success("OTP resent to your email.");
        setCooldown(30);
        setTtl(OTP_TTL_SECONDS);
        setDigits(Array(6).fill(""));
        refs.current[0]?.focus();
      } else toast.error(res.message ?? "Resend failed.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Resend failed.");
    } finally {
      setResending(false);
    }
  };

  const fmtTtl = `${String(Math.floor(ttl / 60)).padStart(2, "0")}:${String(ttl % 60).padStart(2, "0")}`;

  return (
    <AuthLayout
      heroTitle="One last step."
      heroSubtitle="We sent a 6-digit verification code to your email. Enter it here to activate your account."
    >
      <form onSubmit={submit} className="card p-8">
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7" />
          </div>
        </div>

        <h2 className="display-font text-2xl font-bold text-slate-900 text-center">Verify your email</h2>
        <p className="text-slate-500 text-sm text-center mt-1 flex items-center justify-center gap-1">
          <Mail className="w-4 h-4 text-slate-400" />
          <span className="font-medium text-slate-700">{email}</span>
        </p>

        <div className="flex gap-2 justify-center my-6" onPaste={onPaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={onKeyDown(i)}
              inputMode="numeric"
              maxLength={1}
              className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl border border-slate-200 bg-white
                focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none transition"
            />
          ))}
        </div>

        <div className="text-center text-xs text-slate-500 mb-4">
          Code expires in <span className={`font-semibold ${ttl < 60 ? "text-rose-600" : "text-slate-700"}`}>{fmtTtl}</span>
        </div>

        <button disabled={loading} className="btn-primary w-full">
          {loading ? "Verifying…" : (<>Verify & continue <ArrowRight className="w-4 h-4" /></>)}
        </button>

        <div className="text-center mt-5 text-sm text-slate-500">
          Didn't receive the code?{" "}
          <button type="button" disabled={resending || cooldown > 0} onClick={resend}
            className="text-brand-700 font-semibold hover:underline disabled:text-slate-400 disabled:no-underline">
            {cooldown > 0 ? `Resend in ${cooldown}s` : resending ? "Sending…" : "Resend OTP"}
          </button>
        </div>

        <p className="text-xs text-slate-500 text-center mt-4">
          Wrong email?{" "}
          <Link to="/register" className="text-brand-700 hover:underline">Register again</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
