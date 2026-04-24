import { Link, Outlet, useLocation } from "react-router-dom";
import { BarChart3, Crown } from "lucide-react";
import PageHeader from "../../../components/common/PageHeader";

export default function AdminReportsPage() {
  const { pathname } = useLocation();
  const isFin = pathname.endsWith("/reports") || pathname.includes("/reports/financial");
  const isCust = pathname.includes("/reports/customers");

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Reports" title="Analytics" subtitle="Switch between financial and customer insights." />
      <div className="flex gap-2 border-b border-slate-100">
        <TabLink to="/admin/reports" active={isFin}><BarChart3 className="w-4 h-4" /> Financial</TabLink>
        <TabLink to="/admin/reports/customers" active={isCust}><Crown className="w-4 h-4" /> Customer Insights</TabLink>
      </div>
      <Outlet />
    </div>
  );
}

function TabLink({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link to={to} className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border-b-2 transition ${
      active ? "border-brand-600 text-brand-700" : "border-transparent text-slate-500 hover:text-slate-700"
    }`}>{children}</Link>
  );
}
