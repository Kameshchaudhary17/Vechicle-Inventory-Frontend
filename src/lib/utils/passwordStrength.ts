export interface StrengthResult {
  score: 0 | 1 | 2 | 3 | 4 | 5;
  label: string;
  color: "rose" | "amber" | "brand" | "emerald" | "slate";
  checks: { key: string; label: string; passed: boolean }[];
}

export function evaluatePassword(pw: string): StrengthResult {
  const checks = [
    { key: "len", label: "At least 8 characters", passed: pw.length >= 8 },
    { key: "upper", label: "One uppercase letter", passed: /[A-Z]/.test(pw) },
    { key: "lower", label: "One lowercase letter", passed: /[a-z]/.test(pw) },
    { key: "digit", label: "One number", passed: /[0-9]/.test(pw) },
    { key: "symbol", label: "One symbol (optional)", passed: /[^A-Za-z0-9]/.test(pw) }
  ];
  const score = checks.reduce<number>((s, c) => s + (c.passed ? 1 : 0), 0) as StrengthResult["score"];

  let label = "Too weak";
  let color: StrengthResult["color"] = "slate";
  if (!pw) { label = ""; color = "slate"; }
  else if (score <= 2) { label = "Weak"; color = "rose"; }
  else if (score === 3) { label = "Fair"; color = "amber"; }
  else if (score === 4) { label = "Good"; color = "brand"; }
  else if (score === 5) { label = "Strong"; color = "emerald"; }

  return { score, label, color, checks };
}
