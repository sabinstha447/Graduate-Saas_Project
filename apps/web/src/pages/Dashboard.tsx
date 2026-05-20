import { useEffect, useState } from "react";
import { useTenant } from "../context/TenantContext";
import { apiFetch } from "../lib/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type Summary = {
  total_issues: string;
  open_issues: string;
  critical_issues: string;
  high_issues: string;
  avg_risk_score: string;
  max_risk_score: string;
};

export default function Dashboard() {
  const { tenantId, tenantName } = useTenant();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch("/dashboard/summary", tenantId)
      .then(setSummary)
      .finally(() => setLoading(false));
  }, [tenantId]);

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!summary) return <p className="text-red-500">Failed to load summary.</p>;

  const chartData = [
    { name: "Total", value: Number(summary.total_issues) },
    { name: "Open", value: Number(summary.open_issues) },
    { name: "Critical", value: Number(summary.critical_issues) },
    { name: "High", value: Number(summary.high_issues) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">{tenantName}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Issues" value={summary.total_issues} color="blue" />
        <StatCard label="Open Issues" value={summary.open_issues} color="yellow" />
        <StatCard label="Critical" value={summary.critical_issues} color="red" />
        <StatCard label="Avg Risk Score" value={summary.avg_risk_score} color="purple" />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Issue Breakdown</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700",
    yellow: "bg-yellow-50 text-yellow-700",
    red: "bg-red-50 text-red-700",
    purple: "bg-purple-50 text-purple-700",
  };

  return (
    <div className={`rounded-xl p-4 ${colors[color]}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}