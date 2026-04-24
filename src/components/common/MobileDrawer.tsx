import { NavLink } from "react-router-dom";
import { Car, X } from "lucide-react";
import type { NavGroup } from "./Sidebar";

export default function MobileDrawer({
  open, onClose, groups, title
}: { open: boolean; onClose: () => void; groups: NavGroup[]; title: string }) {
  return (
    <div className={`lg:hidden fixed inset-0 z-30 transition ${open ? "" : "pointer-events-none"}`}>
      <div onClick={onClose}
        className={`absolute inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0"}`} />
      <aside className={`absolute left-0 top-0 bottom-0 w-72 bg-gradient-to-b from-slate-900 via-brand-950 to-brand-900 text-white transform transition-transform ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/10">
          <span className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <span className="display-font font-bold">{title}</span>
          </span>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10"><X className="w-5 h-5" /></button>
        </div>
        <nav className="p-3 space-y-5 overflow-y-auto h-[calc(100%-4rem)]">
          {groups.map((group, gi) => (
            <div key={gi}>
              {group.label && (
                <div className="px-3 mb-2 text-[10px] font-semibold tracking-[0.12em] text-brand-200/60 uppercase">
                  {group.label}
                </div>
              )}
              <div className="space-y-1">
                {group.items.map(({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                        isActive ? "bg-white/[0.12] text-white" : "text-brand-100/80 hover:bg-white/[0.06]"
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </div>
  );
}
