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
  const submitted = reviews.filter(r => r.clarityScore !== null && r.clarityScore !== undefined);
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

  return (
    <div className="space-y-4">
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
      <div className="space-y-3">
        {submitted.map((r, i) => (
          <div key={r.id} className="border border-gray-200 rounded-lg p-3 bg-white">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-gray-500">Reviewer {i + 1}{r.reviewer ? ` — ${r.reviewer.name}` : ""}</span>
              {r.decision && <span className={`text-xs font-bold ${decisionColor[r.decision] || "text-gray-600"}`}>{r.decision.replace(/_/g, " ")}</span>}
            </div>
            {r.remarks && <p className="text-sm text-gray-600">{r.remarks}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
