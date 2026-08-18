import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { ToastProvider } from "./components/ui/Toast";
import { AppShell } from "./components/layout/AppShell";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { SalesPage } from "./pages/SalesPage";
import { PurchasesPage } from "./pages/PurchasesPage";
import { CustomersPage } from "./pages/CustomersPage";
import { CustomerDetailPage } from "./pages/CustomerDetailPage";
import { MorePage } from "./pages/MorePage";
import { RemindersPage } from "./pages/RemindersPage";
import { BackupPage } from "./pages/BackupPage";
import { InsightsPage } from "./pages/InsightsPage";

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-100">
      <p className="font-display text-lg text-cocoa-500">After25 Cakes</p>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <FullScreenLoader />;

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <ToastProvider>
      <DataProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="sales" element={<SalesPage />} />
            <Route path="purchases" element={<PurchasesPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="customers/:phoneKey" element={<CustomerDetailPage />} />
            <Route path="more" element={<MorePage />} />
            <Route path="more/insights" element={<InsightsPage />} />
            <Route path="more/reminders" element={<RemindersPage />} />
            <Route path="more/backup" element={<BackupPage />} />
            <Route path="login" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </DataProvider>
    </ToastProvider>
  );
}
