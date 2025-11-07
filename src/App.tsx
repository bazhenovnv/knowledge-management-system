
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import Index from "./pages/Index";
import Bitrix24 from "./pages/Bitrix24";
import DatabaseTestPage from "./pages/DatabaseTestPage";
import NotFound from "./pages/NotFound";
import TestLogin from "./components/TestLogin";
import TestRegister from "./components/TestRegister";
import AuthTestPage from "./pages/AuthTestPage";
import AddEmployeeTestPage from "./pages/AddEmployeeTestPage";
import EmployeeManagementPage from "./pages/EmployeeManagementPage";
import DemoEmployeesPage from "./pages/DemoEmployeesPage";
import AdminSettings from "./pages/AdminSettings";
import AdminConsole from "./pages/AdminConsole";
import NotificationsPage from "./pages/NotificationsPage";
import BranchesPage from "./pages/BranchesPage";
import GuideIndex from "./pages/GuideIndex";
import SqlServerGuide from "./pages/SqlServerGuide";
import SecretsManager from "./pages/SecretsManager";
import TestSqlConnection from "./pages/TestSqlConnection";
import VideoConferencesPage from "./pages/VideoConferencesPage";
import VideoCall from "./pages/VideoCall";
import ExternalDatabaseTest from "./pages/ExternalDatabaseTest";
import DatabaseMigration from "./pages/DatabaseMigration";
import ServiceHealthCheck from "./pages/ServiceHealthCheck";
import ExternalDbStatus from "./pages/ExternalDbStatus";
import LimitExceeded from "./pages/LimitExceeded";
import DatabaseStatsPage from "./pages/DatabaseStatsPage";
import PasswordResetPage from "./pages/PasswordResetPage";
import { GlobalConsoleLogger } from "./components/admin/GlobalConsoleLogger";
import { DataProvider } from "./contexts/DataContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DataProvider>
          <GlobalConsoleLogger />
          <Toaster />
          <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/bitrix24" element={<Bitrix24 />} />
            <Route path="/db-test" element={<DatabaseTestPage />} />
            <Route path="/test-login" element={<TestLogin />} />
            <Route path="/test-register" element={<TestRegister />} />
            <Route path="/auth-test" element={<AuthTestPage />} />
            <Route path="/add-employee-test" element={<AddEmployeeTestPage />} />
            <Route path="/employees" element={<EmployeeManagementPage />} />
            <Route path="/demo-employees" element={<DemoEmployeesPage />} />
            <Route path="/admin-settings" element={<AdminSettings />} />
            <Route path="/admin-console" element={<AdminConsole />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/branches" element={<BranchesPage />} />
            <Route path="/guide" element={<GuideIndex />} />
            <Route path="/sql-guide" element={<SqlServerGuide />} />
            <Route path="/secrets" element={<SecretsManager />} />
            <Route path="/test-sql" element={<TestSqlConnection />} />
            <Route path="/video-conferences" element={<VideoConferencesPage />} />
            <Route path="/video-call" element={<VideoCall />} />
            <Route path="/external-db" element={<ExternalDatabaseTest />} />
            <Route path="/migrate-db" element={<DatabaseMigration />} />
            <Route path="/health-check" element={<ServiceHealthCheck />} />
            <Route path="/db-status" element={<ExternalDbStatus />} />
            <Route path="/limit-exceeded" element={<LimitExceeded />} />
            <Route path="/db-stats" element={<DatabaseStatsPage />} />
            <Route path="/reset-password" element={<PasswordResetPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </DataProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;