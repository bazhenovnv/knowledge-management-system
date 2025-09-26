
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Bitrix24 from "./pages/Bitrix24";
import DatabaseTestPage from "./pages/DatabaseTestPage";
import NotFound from "./pages/NotFound";
import TestLogin from "./components/TestLogin";
import TestRegister from "./components/TestRegister";
import AuthTestPage from "./pages/AuthTestPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;