import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTenant } from "../context/TenantContext";
import { apiFetch } from "../lib/api";

type Issue = {
  id: string;
  title: string;
  category: string;
  location: string;
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

export default function Issues() {
  const { tenantId } = useTenant();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch("/issues", tenantId)
      .then(setIssues)
      .finally(() => setLoading(false));
  }, [tenantId]);

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Issues</h1>
        <Link
          to="/issues/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + New Issue
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Risk</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Priority</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {issues.map((issue) => (
              <tr key={issue.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = `/issues/${issue.id}`}>
                <td className="px-4 py-3 font-medium text-gray-900">{issue.title}</td>
                <td className="px-4 py-3 text-gray-500">{issue.category}</td>
                <td className="px-4 py-3">
                  <span className="font-bold text-gray-900">{issue.risk_score}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[issue.priority] ?? ""}`}>
                    {issue.priority}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 capitalize">{issue.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}