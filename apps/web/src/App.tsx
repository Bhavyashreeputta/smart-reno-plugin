import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import RequireAuth from "./auth/RequireAuth";
import AppShell from "./components/AppShell";  
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Leads from "./pages/Leads";
import Appointments from "./pages/Appointments";
import Artifacts from "./pages/Artifacts";
import Audit from "./pages/Audit";

function ProtectedLayout() {
  return (
    <RequireAuth>
      <AppShell>
        <Outlet />
      </AppShell>
    </RequireAuth>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="artifacts" element={<Artifacts />} />
            <Route path="audit" element={<Audit />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}