import { useState, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useAppearance } from "@/hooks/useAppearance";
import { AuthForm } from "@/components/auth/AuthForm";
import { Navigation } from "@/components/layout/Navigation";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { EmployeeDashboard } from "@/components/dashboard/EmployeeDashboard";
import { TeacherDashboard } from "@/components/dashboard/TeacherDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";

import { KnowledgeTab } from "@/components/tabs/KnowledgeTab";
import { AnalyticsTab } from "@/components/tabs/AnalyticsTab";
import { EmployeesTab } from "@/components/employees/EmployeesTab";
import EmployeeList from "@/components/EmployeeList";
import { database } from "@/utils/database";
import { getStatusColor, getStatusText } from "@/utils/statusUtils";
import AliceAssistant from "@/components/ai/AliceAssistant";
import DatabaseTestManagement from "@/components/tests/DatabaseTestManagement";
import AssignmentManager from "@/components/assignments/AssignmentManager";
import MyAssignments from "@/components/assignments/MyAssignments";
import UserSettings from "@/components/settings/UserSettings";
import { DatabaseSetup } from "@/components/setup/DatabaseSetup";
import SupportChat from "@/components/support/SupportChat";

const Index = () => {
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('lastActiveTab');
    return savedTab || "dashboard";
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [prevActiveTab, setPrevActiveTab] = useState(activeTab);
  const [showBackButton, setShowBackButton] = useState(false);
  const [onBackClick, setOnBackClick] = useState<(() => void) | undefined>(undefined);

  useEffect(() => {
    localStorage.setItem('lastActiveTab', activeTab);
    
    if (prevActiveTab !== activeTab) {
      window.dispatchEvent(new CustomEvent('resetSubsection'));
      setPrevActiveTab(activeTab);
      // Скрываем кнопку "Назад" при смене вкладки
      setShowBackButton(false);
    }
  }, [activeTab, prevActiveTab]);

  // Инициализируем базу данных и загружаем сотрудников
  useEffect(() => {
    const initializeAndLoadData = () => {
      // Инициализируем базу данных с начальными данными
      database.initializeDatabase();
      
      // Загружаем сотрудников
      const employeesFromDB = database.getEmployees();
      setEmployees(employeesFromDB);
    };
    initializeAndLoadData();
  }, []);

  // Обработчики навигации из заданий
  useEffect(() => {
    const handleNavigateToTest = () => {
      setActiveTab("tests");
    };

    const handleNavigateToKnowledge = () => {
      setActiveTab("knowledge");
    };

    const handleNavigateToEmployees = () => {
      setActiveTab("employees");
    };

    window.addEventListener('navigateToTest', handleNavigateToTest);
    window.addEventListener('navigateToKnowledge', handleNavigateToKnowledge);
    window.addEventListener('navigateToEmployees', handleNavigateToEmployees);

    return () => {
      window.removeEventListener('navigateToTest', handleNavigateToTest);
      window.removeEventListener('navigateToKnowledge', handleNavigateToKnowledge);
      window.removeEventListener('navigateToEmployees', handleNavigateToEmployees);
    };
  }, []);

  const {
    isLoggedIn,
    userRole,
    userName,
    userId,
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

  const { getBackgroundStyle, getContentBackgroundColor } = useAppearance();

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
    <ContentWrapper>
      <div className="min-h-screen flex flex-col" style={getBackgroundStyle()}>
        <div className="sticky top-0 z-50" style={getBackgroundStyle()}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <Navigation
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                onLogout={handleLogout}
                userRole={userRole}
                userName={userName}
                employeeId={1}
                showBackButton={showBackButton}
                onBackClick={onBackClick}
              />
            </Tabs>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="dashboard" className="space-y-6">
            {renderDashboard()}
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-6">
            <KnowledgeTab
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              userRole={userRole}
              currentUserId={1}
              onBackButtonChange={(show, callback) => {
                setShowBackButton(show);
                setOnBackClick(() => callback);
              }}
            />
          </TabsContent>



          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsTab />
          </TabsContent>

          <TabsContent value="tests" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {(() => {
                try {
                  const currentUser = database.getCurrentUser();
                  return <DatabaseTestManagement 
                    userRole={userRole} 
                    userId={currentUser?.id || 1} 
                  />;
                } catch (error) {
                  console.error('TestManagement error:', error);
                  return <div className="text-red-500">Ошибка загрузки раздела "Тесты": {String(error)}</div>;
                }
              })()}
            </div>
          </TabsContent>

          {(userRole === "admin" || userRole === "teacher") && (
            <>
              <TabsContent value="assignments" className="space-y-6">
                {userRole === "admin" || userRole === "teacher" ? (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <AssignmentManager 
                      currentUserRole={userRole}
                      currentUserId={userName || 'admin'}
                    />
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <MyAssignments userId={1} />
                  </div>
                )}
              </TabsContent>
              <TabsContent value="employees" className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  {(() => {
                    try {
                      // Для админов и преподавателей показываем полное управление сотрудниками
                      if (userRole === "admin" || userRole === "teacher") {
                        return <EmployeeList />;
                      }
                      // Для обычных сотрудников показываем базовую работу
                      return <EmployeesTab userRole={userRole} />;
                    } catch (error) {
                      console.error('Employees section error:', error);
                      return <div className="text-red-500">Ошибка загрузки раздела "Сотрудники": {String(error)}</div>;
                    }
                  })()}
                </div>
              </TabsContent>
            </>
          )}

          <TabsContent value="settings" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm">
              <UserSettings userId={userId} />
            </div>
            {userRole === "admin" && (
              <div className="bg-white rounded-lg shadow-sm">
                <DatabaseSetup />
              </div>
            )}
          </TabsContent>

          </Tabs>
        </div>
      </div>

        {/* AI Помощник Алиса */}
        <AliceAssistant onNavigate={setActiveTab} userRole={userRole} />
      </div>
    </ContentWrapper>
  );
};

export default Index;