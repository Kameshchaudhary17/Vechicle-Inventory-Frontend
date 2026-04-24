import { useState } from "react";
import { CalendarDays, PackageSearch, Star } from "lucide-react";
import PageHeader from "../../../components/common/PageHeader";
import AppointmentsPanel from "../../shared/engagement/AppointmentsPanel";
import PartRequestsPanel from "../../shared/engagement/PartRequestsPanel";
import ReviewsPanel from "../../shared/engagement/ReviewsPanel";

type Tab = "appointments" | "partRequests" | "reviews";

export default function StaffEngagementPage() {
  const [tab, setTab] = useState<Tab>("appointments");
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="CRM" title="Customer Engagement" subtitle="Appointments, part requests, and service reviews from all customers." />

      <div className="flex gap-2 border-b border-slate-100">
        <TabBtn active={tab === "appointments"} onClick={() => setTab("appointments")}><CalendarDays className="w-4 h-4" /> Appointments</TabBtn>
        <TabBtn active={tab === "partRequests"} onClick={() => setTab("partRequests")}><PackageSearch className="w-4 h-4" /> Part Requests</TabBtn>
        <TabBtn active={tab === "reviews"} onClick={() => setTab("reviews")}><Star className="w-4 h-4" /> Reviews</TabBtn>
      </div>

      {tab === "appointments" && <AppointmentsPanel allowCreate={false} staffMode />}
      {tab === "partRequests" && <PartRequestsPanel allowCreate={false} staffMode />}
      {tab === "reviews" && <ReviewsPanel allowCreate={false} staffMode />}
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border-b-2 transition ${
      active ? "border-brand-600 text-brand-700" : "border-transparent text-slate-500 hover:text-slate-700"
    }`}>{children}</button>
  );
}
