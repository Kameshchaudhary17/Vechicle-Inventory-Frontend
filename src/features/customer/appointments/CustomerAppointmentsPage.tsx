import PageHeader from "../../../components/common/PageHeader";
import AppointmentsPanel from "../../shared/engagement/AppointmentsPanel";

export default function CustomerAppointmentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Service" title="Appointments" subtitle="Book and track your service appointments." />
      <AppointmentsPanel />
    </div>
  );
}
