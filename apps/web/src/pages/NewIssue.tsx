import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTenant } from "../context/TenantContext";
import { apiFetch } from "../lib/api";

export default function NewIssue() {
  const { tenantId } = useTenant();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    impact: 3,
    likelihood: 3,
    priority: "medium",
  });

  const handleSubmit = async () => {
    setError("");
    try {
      await apiFetch("/issues", tenantId, {
        method: "POST",
        body: JSON.stringify({ ...form, impact: Number(form.impact), likelihood: Number(form.likelihood) }),
      });
      navigate("/issues");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">New Issue</h1>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <Field label="Title">
          <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </Field>
        <Field label="Description">
          <textarea className="input h-24 resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </Field>
        <Field label="Category">
          <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="">Select...</option>
            <option>Drainage</option>
            <option>Signage</option>
            <option>Footpaths</option>
            <option>Roading</option>
            <option>Fencing</option>
            <option>Other</option>
          </select>
        </Field>
        <Field label="Location">
          <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label={`Impact (${form.impact})`}>
            <input type="range" min={1} max={5} value={form.impact} onChange={(e) => setForm({ ...form, impact: Number(e.target.value) })} className="w-full" />
          </Field>
          <Field label={`Likelihood (${form.likelihood})`}>
            <input type="range" min={1} max={5} value={form.likelihood} onChange={(e) => setForm({ ...form, likelihood: Number(e.target.value) })} className="w-full" />
          </Field>
        </div>
        <p className="text-sm text-gray-500">Risk Score: <span className="font-bold text-gray-900">{Number(form.impact) * Number(form.likelihood)}</span></p>
        <Field label="Priority">
          <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </Field>
      </div>

      <button onClick={handleSubmit} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
        Submit Issue
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}