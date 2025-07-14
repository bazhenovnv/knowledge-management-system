import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { AuthForm } from "@/components/auth/AuthForm";
import { Navigation } from "@/components/layout/Navigation";
import { EmployeeDashboard } from "@/components/dashboard/EmployeeDashboard";
import { TeacherDashboard } from "@/components/dashboard/TeacherDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { HomeTab } from "@/components/tabs/HomeTab";
import { KnowledgeTab } from "@/components/tabs/KnowledgeTab";
import { AnalyticsTab } from "@/components/tabs/AnalyticsTab";
import { employees } from "@/data/mockData";
import { getStatusColor, getStatusText } from "@/utils/statusUtils";
import AliceAssistant from "@/components/ai/AliceAssistant";
import TestManagement from "@/components/tests/TestManagement";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    isLoggedIn,
    userRole,
    loginForm,
    registerForm,
    showRegister,
    setLoginForm,
    setRegisterForm,
    setShowRegister,
    handleLogin,
    handleLogout,
    handleRegister,
    handlePasswordReset,
  } = useAuth();

  const renderDashboard = () => {
    switch (userRole) {
      case "employee":
        return <EmployeeDashboard onLogout={handleLogout} />;
      case "teacher":
        return (
          <TeacherDashboard
            onLogout={handleLogout}
            employees={employees}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
          />
        );
      case "admin":
        return (
          <AdminDashboard
            onLogout={handleLogout}
            employees={employees}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
          />
        );
      default:
        return <EmployeeDashboard onLogout={handleLogout} />;
    }
  };

  if (!isLoggedIn) {
    return (
      <AuthForm
        showRegister={showRegister}
        loginForm={loginForm}
        registerForm={registerForm}
        onLoginFormChange={setLoginForm}
        onRegisterFormChange={setRegisterForm}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onToggleRegister={() => setShowRegister(!showRegister)}
        onPasswordReset={handlePasswordReset}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <Navigation
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            onLogout={handleLogout}
          />

          <TabsContent value="home" className="space-y-6">
            <HomeTab setActiveTab={setActiveTab} />
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            {renderDashboard()}
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-6">
            <KnowledgeTab
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </TabsContent>

          <TabsContent value="tests" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <TestManagement userRole={userRole} />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsTab />
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Помощник Алиса */}
      <AliceAssistant onNavigate={setActiveTab} userRole={userRole} />
    </div>
  );
};

export default Index;