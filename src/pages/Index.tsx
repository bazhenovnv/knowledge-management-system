import { useState, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Navigation } from "@/components/layout/Navigation";
import { EmployeeDashboard } from "@/components/dashboard/EmployeeDashboard";
import { TeacherDashboard } from "@/components/dashboard/TeacherDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import UserNavbar from "@/components/auth/UserNavbar";
import authService from "@/utils/authService";

import { KnowledgeTab } from "@/components/tabs/KnowledgeTab";
import { AnalyticsTab } from "@/components/tabs/AnalyticsTab";
import { EmployeesTab } from "@/components/employees/EmployeesTab";

import DatabaseEmployeeManagement from "@/components/employees/DatabaseEmployeeManagement";
import { database } from "@/utils/database";
import { getStatusColor, getStatusText } from "@/utils/statusUtils";
import AliceAssistant from "@/components/ai/AliceAssistant";
import TestManagement from "@/components/tests/TestManagement";
import AssignmentManager from "@/components/assignments/AssignmentManager";
import MyAssignments from "@/components/assignments/MyAssignments";
import UserSettings from "@/components/settings/UserSettings";
import { DatabaseSetup } from "@/components/setup/DatabaseSetup";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [employees, setEmployees] = useState([]);

  // Get current user from auth service
  const currentEmployee = authService.getCurrentEmployee();
  const userRole = currentEmployee?.role || 'employee';

  // Initialize database and load data
  useEffect(() => {
    const initializeAndLoadData = () => {
      database.initializeDatabase();
      const employeesFromDB = database.getEmployees();
      setEmployees(employeesFromDB);
    };
    initializeAndLoadData();
  }, []);

  // Navigation handlers from assignments
  useEffect(() => {
    const handleNavigateToTest = () => setActiveTab("tests");
    const handleNavigateToKnowledge = () => setActiveTab("knowledge");
    const handleNavigateToEmployees = () => setActiveTab("employees");

    window.addEventListener('navigateToTest', handleNavigateToTest);
    window.addEventListener('navigateToKnowledge', handleNavigateToKnowledge);
    window.addEventListener('navigateToEmployees', handleNavigateToEmployees);

    return () => {
      window.removeEventListener('navigateToTest', handleNavigateToTest);
      window.removeEventListener('navigateToKnowledge', handleNavigateToKnowledge);
      window.removeEventListener('navigateToEmployees', handleNavigateToEmployees);
    };
  }, []);

  const handleLogout = () => {
    // Force page reload to trigger auth check
    window.location.reload();
  };

  const handleUpdateEmployees = (updatedEmployees: any[]) => {
    setEmployees(updatedEmployees);
  };

  const filteredEmployees = employees.filter(emp => 
    emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Don't render if no current employee (should be handled by ProtectedRoute)
  if (!currentEmployee) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900">
            Система управления знаниями
          </h1>
        </div>
        
        <UserNavbar employee={currentEmployee} onLogout={handleLogout} />
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar Navigation */}
        <Navigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userRole={userRole}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <main className="h-full overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              {/* Dashboard Tab */}
              <TabsContent value="dashboard" className="h-full m-0">
                {userRole === 'admin' ? (
                  <AdminDashboard />
                ) : userRole === 'manager' ? (
                  <TeacherDashboard />
                ) : (
                  <EmployeeDashboard />
                )}
              </TabsContent>

              {/* Knowledge Tab */}
              <TabsContent value="knowledge" className="h-full m-0">
                <KnowledgeTab />
              </TabsContent>

              {/* Employees Tab - Database Version */}
              <TabsContent value="employees" className="h-full m-0">
                <div className="h-full p-6">
                  <DatabaseEmployeeManagement />
                </div>
              </TabsContent>

              {/* Tests Tab */}
              <TabsContent value="tests" className="h-full m-0">
                <div className="h-full p-6">
                  <TestManagement 
                    userRole={userRole} 
                    userName={currentEmployee.full_name}
                  />
                </div>
              </TabsContent>

              {/* Assignments Tab */}
              <TabsContent value="assignments" className="h-full m-0">
                <div className="h-full p-6">
                  {userRole === 'admin' || userRole === 'manager' ? (
                    <AssignmentManager />
                  ) : (
                    <MyAssignments />
                  )}
                </div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="h-full m-0">
                <AnalyticsTab />
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="h-full m-0">
                <div className="h-full p-6">
                  <UserSettings 
                    currentUser={{
                      name: currentEmployee.full_name,
                      role: userRole,
                      email: currentEmployee.email,
                      phone: currentEmployee.phone || '',
                      department: currentEmployee.department || '',
                      avatar: currentEmployee.avatar_url || '',
                      theme: currentEmployee.theme || 'light'
                    }}
                  />
                </div>
              </TabsContent>

              {/* Database Setup Tab - Admin Only */}
              {userRole === 'admin' && (
                <TabsContent value="database" className="h-full m-0">
                  <div className="h-full p-6">
                    <DatabaseSetup />
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </main>
        </div>
      </div>

      {/* Alice AI Assistant */}
      <AliceAssistant />
    </div>
  );
};

export default Index;