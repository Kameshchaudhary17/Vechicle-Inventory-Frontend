import { NavLink } from "react-router-dom";
import { Car, LogOut } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  badge?: string | number;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

interface Props {
  groups: NavGroup[];
  title: string;
  subtitle?: string;
}

export default function Sidebar({ groups, title, subtitle }: Props) {
  const { user, logout } = useAuth();
  const initials = user?.fullName?.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase() ?? "?";

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 bg-gradient-to-b from-slate-900 via-brand-950 to-brand-900 text-white relative">
      <div className="absolute inset-0 bg-grid opacity-[0.07] pointer-events-none" />
      <div className="relative h-16 flex items-center gap-3 px-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-soft">
          <Car className="w-5 h-5 text-white" />
        </div>
        <div className="leading-tight">
          <div className="display-font font-bold text-[15px]">{title}</div>
          <div className="text-[11px] text-brand-200/80 uppercase tracking-wider">{subtitle ?? "Vehicle Inventory"}</div>
        </div>
      </div>

      <nav className="relative flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {groups.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <div className="px-3 mb-2 text-[10px] font-semibold tracking-[0.12em] text-brand-200/60 uppercase">
                {group.label}
              </div>
            )}
            <div className="space-y-1">
              {group.items.map((item) => <NavLinkItem key={item.to} {...item} />)}
            </div>
          </div>
        ))}
      </nav>

      <div className="relative border-t border-white/10 p-3">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-300 to-brand-500 text-brand-950 font-bold flex items-center justify-center text-sm shadow-soft">
            {initials}
          </div>
          <div className="flex-1 min-w-0 leading-tight">
            <div className="text-sm font-semibold truncate">{user?.fullName}</div>
            <div className="text-[11px] text-brand-200/70 truncate">{user?.email}</div>
          </div>
          <button onClick={logout} title="Sign out"
            className="p-2 rounded-lg hover:bg-white/10 text-brand-100 transition">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

function NavLinkItem({ to, label, icon: Icon, end, badge }: NavItem) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition group ${
          isActive
            ? "bg-white/[0.12] text-white shadow-soft"
            : "text-brand-100/80 hover:bg-white/[0.06] hover:text-white"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full transition ${
            isActive ? "bg-gradient-to-b from-brand-300 to-brand-500" : "bg-transparent"
          }`} />
          <Icon className={`w-4 h-4 shrink-0 transition ${isActive ? "text-brand-200" : "text-brand-200/70 group-hover:text-brand-100"}`} />
          <span className="flex-1 truncate">{label}</span>
          {badge !== undefined && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-brand-400/20 text-brand-100">
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}
