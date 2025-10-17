
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
import { GlobalConsoleLogger } from "./components/admin/GlobalConsoleLogger";

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
        <GlobalConsoleLogger />
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;