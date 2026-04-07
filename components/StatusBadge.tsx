const COLORS: Record<string, string> = {
  SUBMITTED: "bg-blue-100 text-blue-700",
  PLAGIARISM_CHECK: "bg-yellow-100 text-yellow-700",
  UNDER_REVIEW: "bg-purple-100 text-purple-700",
  REVISION_REQUESTED: "bg-orange-100 text-orange-700",
  RESUBMITTED: "bg-cyan-100 text-cyan-700",
  ACCEPTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  PUBLISHED: "bg-emerald-100 text-emerald-700",
};
const LABELS: Record<string, string> = {
  SUBMITTED: "Submitted", PLAGIARISM_CHECK: "Plagiarism Check",
  UNDER_REVIEW: "Under Review", REVISION_REQUESTED: "Revision Requested",
  RESUBMITTED: "Resubmitted", ACCEPTED: "Accepted", REJECTED: "Rejected", PUBLISHED: "Published",
};
export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${COLORS[status] || "bg-gray-100 text-gray-600"}`}>
      {LABELS[status] || status}
    </span>
  );
}
