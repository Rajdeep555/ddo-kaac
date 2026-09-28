import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";

import AppLayout from "./components/layout/AppLayout";

import CashierDashboard from "./pages/cashier/Dashboard";
import TaxCreate from "./pages/cashier/TaxCreate";
import TaxCreated from "./pages/cashier/TaxCreated";

import AdminDashboard from "./pages/admin/Dashboard";
import DdoCreate from "./pages/admin/DdoCreate";
import DdoCreated from "./pages/admin/DdoCreated";
import TaxDetails from "./pages/admin/TaxDetails";

import UserCreate from "./pages/admin/UserCreate";
import UserCreated from "./pages/admin/UserCreated";

import { getUser } from "./services/auth";

const getDashboardPath = (user) => {
  if (user?.role === "ADMIN") {
    return "/admin/dashboard";
  }

  if (user?.role === "CASHIER") {
    return "/cashier";
  }

  return "/login";
};

const ProtectedRoute = ({ children, role }) => {
  const user = getUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    return <Navigate to={getDashboardPath(user)} replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const user = getUser();

  if (user) {
    return <Navigate to={getDashboardPath(user)} replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>

      {/* Login */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Cashier */}
      <Route
        path="/cashier"
        element={
          <ProtectedRoute role="CASHIER">
            <AppLayout role="CASHIER" />
          </ProtectedRoute>
        }
      >
        <Route index element={<CashierDashboard />} />
        <Route path="tax/create" element={<TaxCreate />} />
        <Route path="tax/created" element={<TaxCreated />} />
      </Route>

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="ADMIN">
            <AppLayout role="ADMIN" />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />

        {/* DDO */}
        <Route path="ddo/create" element={<DdoCreate />} />
        <Route path="ddo/created" element={<DdoCreated />} />

        {/* Tax */}
        <Route path="tax-details" element={<TaxDetails />} />

        {/* Users */}
        <Route path="users/create" element={<UserCreate />} />
        <Route path="users/created" element={<UserCreated />} />
      </Route>

      {/* Root */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      {/* Unknown URL */}
      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />

    </Routes>
  );
}

export default App;
