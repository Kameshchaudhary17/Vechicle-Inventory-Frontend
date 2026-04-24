import { Link } from "react-router-dom";
import { UserPlus, Receipt, Search, TrendingUp, ArrowRight, Wallet, Users, Activity } from "lucide-react";
import StatCard from "../../../components/common/StatCard";
import { useAuth } from "../../../context/AuthContext";

export default function StaffDashboard() {
  const { user } = useAuth();
  const firstName = user?.fullName?.split(" ")[0] ?? "there";
  const now = new Date();
  const greet = now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening";
  const dateLabel = now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 text-white p-6 lg:p-8 shadow-soft">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -top-16 -right-10 w-64 h-64 bg-emerald-300/25 rounded-full blur-3xl animate-blob" />
        <div className="absolute -bottom-16 -left-10 w-64 h-64 bg-sky-300/20 rounded-full blur-3xl animate-blob blob-delay-4" />
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">{dateLabel}</div>
            <h1 className="display-font text-3xl lg:text-4xl font-extrabold mt-2">{greet}, {firstName} 👋</h1>
            <p className="mt-2 text-emerald-50/90 max-w-lg">Serve customers, create sales invoices, track pending credits — live data updates automatically.</p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-2xl px-5 py-4 border border-white/15">
            <div className="w-10 h-10 rounded-xl bg-amber-300/90 text-amber-950 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-emerald-100 uppercase tracking-wider">Today's Sales</div>
              <div className="display-font text-2xl font-extrabold tabular-nums">NPR 0</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Today's Sales" value={0} icon={Receipt} tint="brand" hint="Invoices created today" />
        <StatCard label="New Customers" value={0} icon={UserPlus} tint="emerald" hint="Registered today" />
        <StatCard label="Pending Credits" value={0} icon={Wallet} tint="amber" hint="Outstanding balances" />
        <StatCard label="Total Customers" value={0} icon={Users} tint="violet" hint="Lifetime count" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="display-font font-bold text-lg text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-brand-600" /> Recent Activity
              </h2>
              <p className="text-sm text-slate-500">Sales and customer events appear here</p>
            </div>
            <Link to="/staff/sales-invoices" className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
              All invoices <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="py-12 text-center text-sm text-slate-500">
            No activity yet — arrives with Sales module.
          </div>
        </div>

        <div className="card p-6">
          <h2 className="display-font font-bold text-lg text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <QuickLink to="/staff/customers" label="New Customer" icon={UserPlus} tint="emerald" />
            <QuickLink to="/staff/sales-invoices" label="New Sale" icon={Receipt} tint="brand" />
            <QuickLink to="/staff/customers" label="Search" icon={Search} tint="violet" />
            <QuickLink to="/staff/reports" label="Reports" icon={TrendingUp} tint="amber" />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickLink({ to, label, icon: Icon, tint }: { to: string; label: string; icon: typeof UserPlus; tint: "brand" | "violet" | "emerald" | "amber" }) {
  const tints: Record<string, string> = {
    brand: "from-brand-50 to-white hover:from-brand-100 text-brand-700",
    violet: "from-violet-50 to-white hover:from-violet-100 text-violet-700",
    emerald: "from-emerald-50 to-white hover:from-emerald-100 text-emerald-700",
    amber: "from-amber-50 to-white hover:from-amber-100 text-amber-700"
  };
  return (
    <Link to={to} className={`flex flex-col gap-2 p-4 rounded-2xl bg-gradient-to-br ${tints[tint]} border border-slate-100 transition`}>
      <Icon className="w-5 h-5" />
      <div className="text-sm font-semibold text-slate-900">{label}</div>
    </Link>
  );
}
