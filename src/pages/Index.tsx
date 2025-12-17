import { useState, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useAppearance } from "@/hooks/useAppearance";
import AuthPage from "@/components/auth/AuthPage";
import authService from "@/utils/authService";
import { Navigation } from "@/components/layout/Navigation";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { EmployeeDashboard } from "@/components/dashboard/EmployeeDashboard";
import { TeacherDashboard } from "@/components/dashboard/TeacherDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { useNavigate } from "react-router-dom";

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
import { ConferencesTab } from "@/components/conferences/ConferencesTab";
import { Footer } from "@/components/layout/Footer";
import { useData } from "@/contexts/DataContext";
import { Loader2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { isLoading: dataLoading, lastUpdated, refreshData } = useData();
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
    setIsLoggedIn,
    setUserRole,
    setUserName,
    setUserId,
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

  const handleAuthSuccess = async () => {
    console.log('[Auth] Успешная авторизация, обновляем данные...');
    // После успешной авторизации обновляем данные из authService
    const employee = authService.getCurrentEmployee();
    console.log('[Auth] Текущий пользователь:', employee);
    if (employee) {
      console.log('[Auth] Устанавливаем данные пользователя...');
      setUserRole(employee.role as "employee" | "teacher" | "admin");
      setUserName(employee.full_name);
      setUserId(employee.id);
      
      console.log('[Auth] Устанавливаем isLoggedIn = true');
      setIsLoggedIn(true);
      
      console.log('[Auth] Данные пользователя установлены, вход выполнен');
      
      // Принудительно обновляем интерфейс
      setTimeout(() => {
        console.log('[Auth] Проверка isLoggedIn после таймаута');
      }, 100);
      
      // Обновляем список сотрудников из базы
      try {
        await refreshData();
        console.log('[Auth] Данные обновлены успешно');
      } catch (error) {
        console.error('[Auth] Ошибка обновления данных:', error);
      }
    } else {
      console.error('[Auth] Не удалось получить данные пользователя');
    }
  };

  if (!isLoggedIn) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <ContentWrapper>
      {dataLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Загрузка данных...</p>
          </div>
        </div>
      )}
      <div className="min-h-screen flex flex-col" style={getBackgroundStyle()}>
        <div className="sticky top-0 z-50" style={getBackgroundStyle()}>
          <div className="px-4 pt-4">
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
                isAuthenticated={isLoggedIn}
                isLoading={dataLoading}
                lastUpdated={lastUpdated}
                refreshData={refreshData}
              />
            </Tabs>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <div className="px-4 pb-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="dashboard" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderDashboard()}
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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



          <TabsContent value="analytics" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <AnalyticsTab />
          </TabsContent>

          <TabsContent value="tests" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
              <TabsContent value="assignments" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
              <TabsContent value="employees" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
              <TabsContent value="conferences" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <ConferencesTab 
                    userRole={userRole}
                    userId={userId}
                    userName={userName || 'Пользователь'}
                  />
                </div>
              </TabsContent>
            </>
          )}

          <TabsContent value="settings" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="rounded-lg shadow-sm bg-transparent">
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
        
        {/* Футер */}
        <Footer />
      </div>
    </ContentWrapper>
  );
};

export default Index;