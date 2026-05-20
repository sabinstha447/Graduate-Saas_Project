import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TenantProvider } from "./context/TenantContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Issues from "./pages/Issues";
import NewIssue from "./pages/NewIssue";
import IssueDetail from "./pages/IssueDetail";

export default function App() {
  return (
    <TenantProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="issues" element={<Issues />} />
            <Route path="issues/new" element={<NewIssue />} />
            <Route path="issues/:id" element={<IssueDetail />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TenantProvider>
  );
}