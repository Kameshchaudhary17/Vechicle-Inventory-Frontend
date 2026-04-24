import { useState } from "react";
import { Outlet } from "react-router-dom";
import { LayoutDashboard, User, Car, CalendarDays, PackageSearch, Star, History, Sparkles } from "lucide-react";
import Sidebar, { type NavGroup } from "../../components/common/Sidebar";
import Topbar from "../../components/common/Topbar";
import MobileDrawer from "../../components/common/MobileDrawer";

const groups: NavGroup[] = [
  {
    items: [
      { to: "/customer", label: "Dashboard", icon: LayoutDashboard, end: true }
    ]
  },
  {
    label: "My Account",
    items: [
      { to: "/customer/profile", label: "Profile", icon: User },
      { to: "/customer/vehicles", label: "My Vehicles", icon: Car }
    ]
  },
  {
    label: "Activity",
    items: [
      { to: "/customer/appointments", label: "Appointments", icon: CalendarDays },
      { to: "/customer/part-requests", label: "Part Requests", icon: PackageSearch },
      { to: "/customer/reviews", label: "Reviews", icon: Star },
      { to: "/customer/history", label: "History", icon: History }
    ]
  },
  {
    label: "Smart",
    items: [
      { to: "/customer/ai-prediction", label: "AI Alerts", icon: Sparkles }
    ]
  }
];

export default function CustomerLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-slate-50 to-brand-50/40">
      <Sidebar groups={groups} title="My Garage" subtitle="Vehicle Inventory" />
      <MobileDrawer open={open} onClose={() => setOpen(false)} groups={groups} title="Customer" />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenu={() => setOpen(true)} />
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
