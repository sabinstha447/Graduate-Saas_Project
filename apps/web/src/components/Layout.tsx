import { Outlet, NavLink } from "react-router-dom";
import { useTenant } from "../context/TenantContext";

const TENANTS = [
  { id: "a0000000-0000-0000-0000-000000000001", name: "Southland Maintenance Team" },
  { id: "a0000000-0000-0000-0000-000000000002", name: "Dunedin Property Services" },
];

export default function Layout() {
  const { tenantName, setTenant } = useTenant();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">CP</span>
          </div>
          <span className="font-semibold text-gray-900">CivicPulse</span>
        </div>

        {/* Tenant switcher */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Tenant:</span>
          <select
            className="text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white"
            value={tenantName}
            onChange={(e) => {
              const tenant = TENANTS.find((t) => t.name === e.target.value);
              if (tenant) setTenant(tenant.id, tenant.name);
            }}
          >
            {TENANTS.map((t) => (
              <option key={t.id} value={t.name}>{t.name}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-48 min-h-screen bg-white border-r border-gray-200 p-4 space-y-1">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-sm font-medium ${
                isActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/issues"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-sm font-medium ${
                isActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
              }`
            }
          >
            Issues
          </NavLink>
        </nav>

        {/* Main content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}