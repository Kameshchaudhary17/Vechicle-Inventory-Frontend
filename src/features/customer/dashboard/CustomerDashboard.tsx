import { Link } from "react-router-dom";
import { Car, CalendarDays, History, Sparkles, ArrowRight, PackageSearch, Star, Bell } from "lucide-react";
import StatCard from "../../../components/common/StatCard";
import { useAuth } from "../../../context/AuthContext";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const firstName = user?.fullName?.split(" ")[0] ?? "there";
  const now = new Date();
  const greet = now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening";
  const dateLabel = now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-brand-700 to-brand-900 text-white p-6 lg:p-8 shadow-soft">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -top-16 -right-10 w-64 h-64 bg-violet-300/25 rounded-full blur-3xl animate-blob" />
        <div className="absolute -bottom-16 -left-10 w-64 h-64 bg-brand-300/20 rounded-full blur-3xl animate-blob blob-delay-2" />
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">{dateLabel}</div>
            <h1 className="display-font text-3xl lg:text-4xl font-extrabold mt-2">{greet}, {firstName} 👋</h1>
            <p className="mt-2 text-violet-100/90 max-w-lg">Your vehicles, services and alerts — all in one place, updated live.</p>
          </div>
          <Link to="/customer/appointments"
            className="inline-flex items-center gap-2 bg-white text-brand-700 font-semibold px-5 py-3 rounded-2xl shadow-soft hover:bg-brand-50 transition">
            Book appointment <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="My Vehicles" value={0} icon={Car} tint="brand" hint="Registered in your garage" />
        <StatCard label="Upcoming" value={0} icon={CalendarDays} tint="emerald" hint="Appointments scheduled" />
        <StatCard label="Past Purchases" value={0} icon={History} tint="amber" hint="Lifetime invoices" />
        <StatCard label="AI Alerts" value={0} icon={Sparkles} tint="violet" hint="Predictive insights" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="display-font font-bold text-lg text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-brand-600" /> Latest Alerts
              </h2>
              <p className="text-sm text-slate-500">Service reminders, part requests, reviews</p>
            </div>
            <Link to="/customer/ai-prediction" className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="py-12 text-center text-sm text-slate-500">
            No alerts yet — AI predictions arrive once your vehicle history is built.
          </div>
        </div>

        <div className="card p-6">
          <h2 className="display-font font-bold text-lg text-slate-900 mb-4">Shortcuts</h2>
          <div className="grid grid-cols-2 gap-3">
            <QuickLink to="/customer/vehicles" label="My Vehicles" icon={Car} tint="brand" />
            <QuickLink to="/customer/appointments" label="Book" icon={CalendarDays} tint="emerald" />
            <QuickLink to="/customer/part-requests" label="Request" icon={PackageSearch} tint="amber" />
            <QuickLink to="/customer/reviews" label="Review" icon={Star} tint="violet" />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickLink({ to, label, icon: Icon, tint }: { to: string; label: string; icon: typeof Car; tint: "brand" | "violet" | "emerald" | "amber" }) {
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
