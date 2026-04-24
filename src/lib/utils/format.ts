export const formatNPR = (amount: number | string | null | undefined): string => {
  const n = typeof amount === "string" ? parseFloat(amount) : amount ?? 0;
  if (isNaN(n)) return "Rs. 0.00";
  return `Rs. ${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatInt = (n: number | null | undefined): string =>
  (n ?? 0).toLocaleString("en-IN");

export const formatDate = (iso?: string | null): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export const formatDateTime = (iso?: string | null): string => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
};
