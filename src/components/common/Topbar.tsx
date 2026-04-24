import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Menu, Search, Settings, UserCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ChangePasswordModal from "./ChangePasswordModal";
import NotificationPanel from "./NotificationPanel";

export default function Topbar({ onMenu }: { onMenu?: () => void }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [changePwOpen, setChangePwOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const initials = user?.fullName?.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase() ?? "?";
  const crumbs = buildCrumbs(pathname);
  const profileRoute = user?.role === "Admin" ? "/admin" : user?.role === "Staff" ? "/staff" : "/customer";

  return (
    <>
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/70 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button className="lg:hidden p-2 rounded-lg hover:bg-slate-100" onClick={onMenu} aria-label="Menu">
          <Menu className="w-5 h-5" />
        </button>
        <nav className="hidden md:flex items-center gap-1.5 text-sm min-w-0">
          {crumbs.map((c, i) => {
            const last = i === crumbs.length - 1;
            return (
              <span key={c.to} className="flex items-center gap-1.5 truncate">
                {i > 0 && <span className="text-slate-300">/</span>}
                {last ? (
                  <span className="font-semibold text-slate-900 truncate">{c.label}</span>
                ) : (
                  <Link to={c.to} className="text-slate-500 hover:text-brand-600 transition truncate">{c.label}</Link>
                )}
              </span>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 bg-slate-100 hover:bg-slate-200/70 transition rounded-xl px-3 py-2 w-56 lg:w-72">
          <Search className="w-4 h-4 text-slate-500" />
          <input placeholder="Search..." className="bg-transparent outline-none text-sm flex-1 placeholder:text-slate-400" />
          <kbd className="hidden lg:inline-block text-[10px] text-slate-500 border border-slate-300 rounded px-1">⌘K</kbd>
        </div>

        <NotificationPanel />

        <div className="relative" ref={ref}>
          <button onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 transition">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white font-semibold flex items-center justify-center text-sm shadow-soft">
              {initials}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <div className="text-sm font-semibold text-slate-900 truncate max-w-[140px]">{user?.fullName}</div>
              <div className="text-[11px] text-slate-500">{user?.role}</div>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-500 transition ${menuOpen ? "rotate-180" : ""}`} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl bg-white border border-slate-100 shadow-soft overflow-hidden fade-up">
              <div className="p-4 bg-gradient-to-br from-brand-50 to-white border-b border-slate-100">
                <div className="text-sm font-semibold text-slate-900 truncate">{user?.fullName}</div>
                <div className="text-xs text-slate-500 truncate">{user?.email}</div>
                <span className="inline-block mt-1.5 text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">
                  {user?.role}
                </span>
              </div>
              <div className="p-1">
                <MenuItem icon={UserCircle2} label="Profile" onClick={() => { setMenuOpen(false); navigate(profileRoute); }} />
                <MenuItem icon={Settings} label="Change Password" onClick={() => { setMenuOpen(false); setChangePwOpen(true); }} />
                <div className="h-px bg-slate-100 my-1" />
                <MenuItem icon={LogOut} label="Sign out" tone="danger" onClick={() => { setMenuOpen(false); logout(); }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>

    <ChangePasswordModal open={changePwOpen} onClose={() => setChangePwOpen(false)} />
    </>
  );
}

function MenuItem({ icon: Icon, label, onClick, tone }: {
  icon: typeof Bell; label: string; onClick?: () => void; tone?: "danger";
}) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition ${
        tone === "danger" ? "text-rose-600 hover:bg-rose-50" : "text-slate-700 hover:bg-slate-50"
      }`}>
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function buildCrumbs(pathname: string): { to: string; label: string }[] {
  const parts = pathname.split("/").filter(Boolean);
  const crumbs: { to: string; label: string }[] = [];
  let acc = "";
  for (const p of parts) {
    acc += "/" + p;
    crumbs.push({ to: acc, label: labelFor(p) });
  }
  if (crumbs.length === 1) crumbs.push({ to: crumbs[0].to, label: "Dashboard" });
  return crumbs;
}

function labelFor(seg: string) {
  const map: Record<string, string> = {
    admin: "Admin", staff: "Staff", customer: "Customer",
    "purchase-invoices": "Purchase Invoices", "sales-invoices": "Sales Invoices",
    "part-requests": "Part Requests", "ai-prediction": "AI Alerts"
  };
  return map[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
}
