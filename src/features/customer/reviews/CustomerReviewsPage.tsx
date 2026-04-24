import PageHeader from "../../../components/common/PageHeader";
import ReviewsPanel from "../../shared/engagement/ReviewsPanel";

export default function CustomerReviewsPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Feedback" title="Reviews" subtitle="Rate the service and share your experience." />
      <ReviewsPanel />
    </div>
  );
}
