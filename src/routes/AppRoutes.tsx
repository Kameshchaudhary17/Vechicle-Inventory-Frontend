import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { roleHome } from "../lib/utils/roleHome";

import RegisterPage from "../features/auth/pages/RegisterPage";
import VerifyOtpPage from "../features/auth/pages/VerifyOtpPage";
import LoginPage from "../features/auth/pages/LoginPage";

import RoleRoute from "./RoleRoute";
import AdminLayout from "../layouts/AdminLayout/AdminLayout";
import StaffLayout from "../layouts/StaffLayout/StaffLayout";
import CustomerLayout from "../layouts/CustomerLayout/CustomerLayout";

import AdminDashboard from "../features/admin/dashboard/AdminDashboard";
import StaffPage from "../features/admin/staff/StaffPage";
import VendorPage from "../features/admin/vendors/VendorPage";
import CategoryPage from "../features/admin/categories/CategoryPage";
import PartPage from "../features/admin/parts/PartPage";
import AdminCustomersPage from "../features/admin/customers/AdminCustomersPage";
import PurchaseInvoicePage from "../features/admin/purchases/PurchaseInvoicePage";
import AdminReportsPage from "../features/admin/reports/AdminReportsPage";
import FinancialReportPage from "../features/admin/reports/FinancialReportPage";
import CustomerInsightsPage from "../features/shared/reports/CustomerInsightsPage";

import StaffDashboard from "../features/staff/dashboard/StaffDashboard";
import StaffCustomersPage from "../features/staff/customers/StaffCustomersPage";
import SalesInvoicePage from "../features/staff/sales/SalesInvoicePage";
import StaffEngagementPage from "../features/staff/engagement/StaffEngagementPage";

import CustomerDashboard from "../features/customer/dashboard/CustomerDashboard";
import CustomerAppointmentsPage from "../features/customer/appointments/CustomerAppointmentsPage";
import CustomerPartRequestsPage from "../features/customer/partRequests/CustomerPartRequestsPage";
import CustomerReviewsPage from "../features/customer/reviews/CustomerReviewsPage";
import CustomerHistoryPage from "../features/customer/history/CustomerHistoryPage";
import CustomerProfilePage from "../features/customer/profile/CustomerProfilePage";
import CustomerVehiclesPage from "../features/customer/vehicles/CustomerVehiclesPage";

function Home() {
  const { user } = useAuth();
  return <Navigate to={roleHome(user?.role)} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RoleRoute allow={["Admin"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="vendors" element={<VendorPage />} />
          <Route path="categories" element={<CategoryPage />} />
          <Route path="parts" element={<PartPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
          <Route path="purchase-invoices" element={<PurchaseInvoicePage />} />
          <Route path="sales-invoices" element={<SalesInvoicePage />} />
          <Route path="reports" element={<AdminReportsPage />}>
            <Route index element={<FinancialReportPage />} />
            <Route path="customers" element={<CustomerInsightsPage />} />
          </Route>
        </Route>
      </Route>

      <Route element={<RoleRoute allow={["Staff"]} />}>
        <Route path="/staff" element={<StaffLayout />}>
          <Route index element={<StaffDashboard />} />
          <Route path="customers" element={<StaffCustomersPage />} />
          <Route path="sales-invoices" element={<SalesInvoicePage />} />
          <Route path="engagement" element={<StaffEngagementPage />} />
          <Route path="reports" element={<CustomerInsightsPage />} />
        </Route>
      </Route>

      <Route element={<RoleRoute allow={["Customer"]} />}>
        <Route path="/customer" element={<CustomerLayout />}>
          <Route index element={<CustomerDashboard />} />
          <Route path="profile" element={<CustomerProfilePage />} />
          <Route path="vehicles" element={<CustomerVehiclesPage />} />
          <Route path="appointments" element={<CustomerAppointmentsPage />} />
          <Route path="part-requests" element={<CustomerPartRequestsPage />} />
          <Route path="reviews" element={<CustomerReviewsPage />} />
          <Route path="history" element={<CustomerHistoryPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Home />} />
    </Routes>
  );
}
