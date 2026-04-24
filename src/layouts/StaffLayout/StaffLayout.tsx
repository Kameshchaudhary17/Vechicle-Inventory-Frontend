import { useState } from "react";
import { Outlet } from "react-router-dom";
import { LayoutDashboard, UserPlus, Receipt, BarChart3, MessageSquare, Package } from "lucide-react";
import Sidebar, { type NavGroup } from "../../components/common/Sidebar";
import Topbar from "../../components/common/Topbar";
import MobileDrawer from "../../components/common/MobileDrawer";
import LowStockAlertModal from "../../components/common/LowStockAlertModal";

const groups: NavGroup[] = [
  {
    items: [
      { to: "/staff", label: "Dashboard", icon: LayoutDashboard, end: true }
    ]
  },
  {
    label: "Operations",
    items: [
      { to: "/staff/customers", label: "Customers", icon: UserPlus },
      { to: "/staff/sales-invoices", label: "Sales Invoices", icon: Receipt },
      { to: "/staff/parts", label: "Parts", icon: Package },
      { to: "/staff/engagement", label: "Engagement", icon: MessageSquare }
    ]
  },
  {
    label: "Insights",
    items: [
      { to: "/staff/reports", label: "Reports", icon: BarChart3 }
    ]
  }
];

export default function StaffLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-slate-50 to-brand-50/40">
      <Sidebar groups={groups} title="Staff Desk" subtitle="Vehicle Inventory" />
      <MobileDrawer open={open} onClose={() => setOpen(false)} groups={groups} title="Staff" />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenu={() => setOpen(true)} />
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
      <LowStockAlertModal partsPath="/staff/parts" />
    </div>
  );
}
