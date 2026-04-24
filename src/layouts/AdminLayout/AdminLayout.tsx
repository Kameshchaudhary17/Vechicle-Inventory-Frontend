import { useState } from "react";
import { Outlet } from "react-router-dom";
import { LayoutDashboard, Users, Package, Truck, FileText, BarChart3, Tag, UserPlus } from "lucide-react";
import Sidebar, { type NavGroup } from "../../components/common/Sidebar";
import Topbar from "../../components/common/Topbar";
import MobileDrawer from "../../components/common/MobileDrawer";

const groups: NavGroup[] = [
  {
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true }
    ]
  },
  {
    label: "Manage",
    items: [
      { to: "/admin/staff", label: "Staff", icon: Users },
      { to: "/admin/customers", label: "Customers", icon: UserPlus },
      { to: "/admin/vendors", label: "Vendors", icon: Truck },
      { to: "/admin/categories", label: "Categories", icon: Tag },
      { to: "/admin/parts", label: "Parts", icon: Package }
    ]
  },
  {
    label: "Operations",
    items: [
      { to: "/admin/purchase-invoices", label: "Purchase Invoices", icon: FileText }
    ]
  },
  {
    label: "Insights",
    items: [
      { to: "/admin/reports", label: "Reports", icon: BarChart3 }
    ]
  }
];

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-slate-50 to-brand-50/40">
      <Sidebar groups={groups} title="Admin Console" subtitle="Vehicle Inventory" />
      <MobileDrawer open={open} onClose={() => setOpen(false)} groups={groups} title="Admin" />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenu={() => setOpen(true)} />
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
