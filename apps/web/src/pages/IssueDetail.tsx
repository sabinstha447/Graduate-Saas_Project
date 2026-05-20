import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTenant } from "../context/TenantContext";
import { apiFetch } from "../lib/api";

type Issue = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  impact: number;
  likelihood: number;
  risk_score: number;
  priority: string;
  status: string;
  created_at: string;
};

const priorityColors: Record<string, string> = {
  critical: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-green-100 text-green-700",
};

const riskColor = (score: number) => {
  if (score >= 16) return "text-red-600";
  if (score >= 9) return "text-orange-500";
  return "text-green-600";
};

export default function IssueDetail() {
  const { id } = useParams();
  const { tenantId } = useTenant();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    apiFetch(`/issues/${id}`, tenantId)
      .then(setIssue)
      .catch(() => setError("Issue not found."))
      .finally(() => setLoading(false));
  }, [id, tenantId]);

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!issue) return null;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Back link */}
      <Link to="/issues" className="text-sm text-blue-600 hover:underline">
        ← Back to Issues
      </Link>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">{issue.title}</h1>
        <p className="text-sm text-gray-500">
          {issue.category} — {issue.location}
        </p>
      </div>

      {/* Detail card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">

        <div className="grid grid-cols-3 gap-4">
          <DetailItem label="Status" value={<span className="capitalize">{issue.status}</span>} />
          <DetailItem
            label="Priority"
            value={
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[issue.priority] ?? ""}`}>
                {issue.priority}
              </span>
            }
          />
          <DetailItem
            label="Risk Score"
            value={
              <span className={`text-2xl font-bold ${riskColor(issue.risk_score)}`}>
                {issue.risk_score}
              </span>
            }
          />
        </div>

        <hr className="border-gray-100" />

        <div className="grid grid-cols-2 gap-4">
          <DetailItem label="Impact" value={`${issue.impact} / 5`} />
          <DetailItem label="Likelihood" value={`${issue.likelihood} / 5`} />
        </div>

        <hr className="border-gray-100" />

        {issue.description && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Description</p>
            <p className="text-sm text-gray-700">{issue.description}</p>
          </div>
        )}

        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Reported</p>
          <p className="text-sm text-gray-700">{new Date(issue.created_at).toLocaleDateString("en-NZ", { dateStyle: "long" })}</p>
        </div>

      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <div className="text-sm text-gray-900">{value}</div>
    </div>
  );
}