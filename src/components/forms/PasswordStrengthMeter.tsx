import { Check, X } from "lucide-react";
import { evaluatePassword } from "../../lib/utils/passwordStrength";

const barColor: Record<string, string> = {
  rose: "bg-rose-500",
  amber: "bg-amber-500",
  brand: "bg-brand-500",
  emerald: "bg-emerald-500",
  slate: "bg-slate-200"
};
const textColor: Record<string, string> = {
  rose: "text-rose-600",
  amber: "text-amber-600",
  brand: "text-brand-700",
  emerald: "text-emerald-600",
  slate: "text-slate-400"
};

export default function PasswordStrengthMeter({ password, showChecks = true }: { password: string; showChecks?: boolean }) {
  const r = evaluatePassword(password);
  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${
              i < r.score ? barColor[r.color] : "bg-slate-200"
            }`} />
          ))}
        </div>
        <span className={`text-xs font-semibold ${textColor[r.color]}`}>{r.label}</span>
      </div>

      {showChecks && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {r.checks.map((c) => (
            <li key={c.key} className={`flex items-center gap-1.5 text-xs ${c.passed ? "text-emerald-600" : "text-slate-500"}`}>
              {c.passed ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
              {c.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
