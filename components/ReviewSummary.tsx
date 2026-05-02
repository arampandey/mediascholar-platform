interface Review {
  id: string;
  clarityScore?: number | null;
  methodologyScore?: number | null;
  relevanceScore?: number | null;
  originalityScore?: number | null;
  remarks?: string | null;
  decision?: string | null;
  reviewer?: { name: string };
}

export default function ReviewSummary({ reviews }: { reviews: Review[] }) {
  // A review is considered submitted if it has a decision OR any score filled in
  const submitted = reviews.filter(r =>
    r.decision !== null && r.decision !== undefined ||
    (r.clarityScore !== null && r.clarityScore !== undefined)
  );
  if (!submitted.length) return <p className="text-sm text-gray-400 italic">No reviews submitted yet.</p>;

  const avg = (key: keyof Review) => {
    const vals = submitted.map(r => r[key] as number).filter(v => v !== null && v !== undefined);
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : "N/A";
  };

  const criteria = [
    { label: "Clarity", key: "clarityScore" as keyof Review },
    { label: "Methodology", key: "methodologyScore" as keyof Review },
    { label: "Relevance", key: "relevanceScore" as keyof Review },
    { label: "Originality", key: "originalityScore" as keyof Review },
  ];

  const decisionColor: Record<string, string> = { ACCEPT: "text-green-600", MINOR_REVISION: "text-yellow-600", MAJOR_REVISION: "text-orange-600", REJECT: "text-red-600" };

  const hasScores = submitted.some(r => r.clarityScore !== null && r.clarityScore !== undefined);

  return (
    <div className="space-y-4">
      {/* Score grid — only if at least one reviewer filled scores */}
      {hasScores && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {criteria.map(c => {
            const val = parseFloat(avg(c.key));
            const color = val >= 7 ? "text-green-600" : val >= 5 ? "text-yellow-600" : "text-red-500";
            return (
              <div key={c.key} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                <div className={`text-2xl font-extrabold ${color}`}>{avg(c.key)}</div>
                <div className="text-xs text-gray-500 mt-0.5">{c.label}</div>
                <div className="text-xs text-gray-400">/ 10</div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${val >= 7 ? "bg-green-500" : val >= 5 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${(val / 10) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Per-reviewer decisions + remarks */}
      <div className="space-y-3">
        {submitted.map((r, i) => (
          <div key={r.id} className={`border rounded-lg p-3 bg-white ${
            r.decision === "REJECT" ? "border-red-300 bg-red-50" :
            r.decision === "ACCEPT" ? "border-green-200 bg-green-50" :
            r.decision === "MAJOR_REVISION" ? "border-orange-200 bg-orange-50" :
            r.decision === "MINOR_REVISION" ? "border-blue-200 bg-blue-50" :
            "border-gray-200"
          }`}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-gray-700">Reviewer {i + 1}{r.reviewer ? ` — ${r.reviewer.name}` : ""}</span>
              {r.decision && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  decisionColor[r.decision] ? `bg-opacity-10 ${decisionColor[r.decision]}` : "text-gray-600"
                }`}>{r.decision.replace(/_/g, " ")}</span>
              )}
            </div>
            {r.remarks ? (
              <p className="text-sm text-gray-700 mt-1 leading-relaxed italic">&ldquo;{r.remarks}&rdquo;</p>
            ) : (
              r.decision && <p className="text-xs text-gray-400 mt-1 italic">No remarks provided.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
