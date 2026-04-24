import { Link } from "react-router-dom";
import { Users, Package, Truck, Tag, AlertTriangle, TrendingUp, ArrowRight, Plus, Clock, Activity } from "lucide-react";
import StatCard from "../../../components/common/StatCard";
import { useAuth } from "../../../context/AuthContext";
import { useVendorStats } from "../../../hooks/queries/useVendors";
import { usePartStats, usePartList } from "../../../hooks/queries/useParts";
import { useCategoryList } from "../../../hooks/queries/useCategories";
import { useStaffList } from "../../../hooks/queries/useStaff";

export default function AdminDashboard() {
  const { user } = useAuth();
  const vendorStats = useVendorStats({ refetchIntervalMs: 10_000 });
  const partStats = usePartStats({ refetchIntervalMs: 10_000 });
  const staffList = useStaffList({ page: 1, pageSize: 1 });
  const categoryList = useCategoryList({ page: 1, pageSize: 1 });
  const lowStock = usePartList({ lowStockOnly: true, page: 1, pageSize: 5 });
  const recentParts = usePartList({ page: 1, pageSize: 5 });

  const now = new Date();
  const greet = now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening";
  const dateLabel = now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const firstName = user?.fullName?.split(" ")[0] ?? "Admin";
  const invValue = partStats.data?.data?.inventoryValue ?? 0;

  return (
    <div className="space-y-6">
      <HeroBanner greet={greet} name={firstName} date={dateLabel} inventoryValue={invValue} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Staff"
          value={staffList.data?.data?.totalCount ?? 0}
          icon={Users}
          tint="brand"
          loading={staffList.isPending}
          hint={`${staffList.data?.data?.totalCount ?? 0} active members`}
        />
        <StatCard
          label="Vendors"
          value={vendorStats.data?.data?.total ?? 0}
          icon={Truck}
          tint="violet"
          loading={vendorStats.isPending}
          hint={`${vendorStats.data?.data?.active ?? 0} active / ${vendorStats.data?.data?.inactive ?? 0} inactive`}
        />
        <StatCard
          label="Parts in Stock"
          value={partStats.data?.data?.total ?? 0}
          icon={Package}
          tint="emerald"
          loading={partStats.isPending}
          hint={`${partStats.data?.data?.active ?? 0} active parts`}
        />
        <StatCard
          label="Low Stock"
          value={partStats.data?.data?.lowStock ?? 0}
          icon={AlertTriangle}
          tint="rose"
          loading={partStats.isPending}
          hint="Parts below reorder level"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="display-font font-bold text-lg text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                Low Stock Alerts
              </h2>
              <p className="text-sm text-slate-500">Parts that need reordering — live refresh</p>
            </div>
            <Link to="/admin/parts?lowStock=1" className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {lowStock.isPending ? (
            <SkeletonRows />
          ) : (lowStock.data?.data?.items?.length ?? 0) === 0 ? (
            <EmptyCard label="All stock levels are healthy" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {lowStock.data!.data!.items.map((p) => (
                <li key={p.id} className="py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">{p.name}</div>
                    <div className="text-xs text-slate-500 truncate">{p.code} · {p.categoryName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-rose-600">{p.stockQty} {p.unit}</div>
                    <div className="text-[11px] text-slate-400">reorder at {p.reorderLevel}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="display-font font-bold text-lg text-slate-900 flex items-center gap-2 mb-4">
              <Plus className="w-5 h-5 text-brand-600" /> Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <QuickLink to="/admin/staff" label="Add Staff" icon={Users} tint="brand" />
              <QuickLink to="/admin/vendors" label="Add Vendor" icon={Truck} tint="violet" />
              <QuickLink to="/admin/parts" label="Add Part" icon={Package} tint="emerald" />
              <QuickLink to="/admin/categories" label="Category" icon={Tag} tint="amber" />
            </div>
          </div>

          <div className="card p-6">
            <h2 className="display-font font-bold text-lg text-slate-900 flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-brand-600" /> Recently Added
            </h2>
            {recentParts.isPending ? (
              <SkeletonRows rows={3} />
            ) : (recentParts.data?.data?.items?.length ?? 0) === 0 ? (
              <EmptyCard label="No parts yet" />
            ) : (
              <ul className="space-y-3">
                {recentParts.data!.data!.items.slice(0, 4).map((p) => (
                  <li key={p.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">{p.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(p.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card p-6 bg-gradient-to-br from-brand-50 to-white">
            <div className="flex items-center gap-2 text-brand-700 text-sm font-semibold mb-2">
              <Tag className="w-4 h-4" /> Catalog
            </div>
            <div className="text-3xl font-extrabold text-slate-900 display-font tabular-nums">
              {categoryList.data?.data?.totalCount ?? 0}
            </div>
            <div className="text-sm text-slate-500">Categories configured</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroBanner({ greet, name, date, inventoryValue }: { greet: string; name: string; date: string; inventoryValue: number }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 text-white p-6 lg:p-8 shadow-soft">
      <div className="absolute inset-0 bg-grid opacity-10" />
      <div className="absolute -top-24 -right-16 w-72 h-72 bg-brand-400/30 rounded-full blur-3xl animate-blob" />
      <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-sky-400/20 rounded-full blur-3xl animate-blob blob-delay-2" />
      <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-200">{date}</div>
          <h1 className="display-font text-3xl lg:text-4xl font-extrabold mt-2">{greet}, {name} 👋</h1>
          <p className="mt-2 text-brand-100/90 max-w-lg">
            Here's a live overview of your operations. Stats refresh automatically.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-2xl px-5 py-4 border border-white/15">
          <div className="w-10 h-10 rounded-xl bg-emerald-400/90 text-emerald-950 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-brand-100 uppercase tracking-wider">Inventory Value</div>
            <div className="display-font text-2xl font-extrabold tabular-nums">
              NPR {Number(inventoryValue).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickLink({ to, label, icon: Icon, tint }: { to: string; label: string; icon: typeof Users; tint: "brand" | "violet" | "emerald" | "amber" }) {
  const tints: Record<string, string> = {
    brand: "from-brand-50 to-white hover:from-brand-100 text-brand-700",
    violet: "from-violet-50 to-white hover:from-violet-100 text-violet-700",
    emerald: "from-emerald-50 to-white hover:from-emerald-100 text-emerald-700",
    amber: "from-amber-50 to-white hover:from-amber-100 text-amber-700"
  };
  return (
    <Link to={to} className={`flex flex-col gap-2 p-4 rounded-2xl bg-gradient-to-br ${tints[tint]} border border-slate-100 transition group`}>
      <Icon className="w-5 h-5" />
      <div className="text-sm font-semibold text-slate-900">{label}</div>
    </Link>
  );
}

function SkeletonRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 animate-pulse">
          <div className="w-10 h-10 rounded-xl bg-slate-100" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-slate-100 rounded w-2/3" />
            <div className="h-2 bg-slate-100 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyCard({ label }: { label: string }) {
  return (
    <div className="py-8 text-center text-sm text-slate-500">{label}</div>
  );
}
