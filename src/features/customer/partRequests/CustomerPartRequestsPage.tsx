import PageHeader from "../../../components/common/PageHeader";
import PartRequestsPanel from "../../shared/engagement/PartRequestsPanel";

export default function CustomerPartRequestsPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Parts" title="Part Requests" subtitle="Request parts we don't stock yet — we'll reply with a quote." />
      <PartRequestsPanel />
    </div>
  );
}
