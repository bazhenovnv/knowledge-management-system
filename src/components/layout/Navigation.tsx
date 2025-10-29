import { Button } from "@/components/ui/button";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { NotificationPanel } from "@/components/notifications/NotificationPanel";
import { NotificationBadge } from "@/components/notifications/NotificationBadge";
import NotificationBell from "@/components/notifications/NotificationBell";
import { useNotifications } from "@/hooks/useNotifications";
import { useViewedTests } from "@/hooks/useViewedTests";
import { useState } from "react";
import ServerStatusIndicator from "@/components/status/ServerStatusIndicator";
import SupportChat from "@/components/support/SupportChat";
import { useData } from "@/contexts/DataContext";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onLogout?: () => void;
  userRole?: string;
  userName?: string;
  employeeId?: number;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export const Navigation = ({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  onLogout,
  userRole,
  userName,
  employeeId = 1,
  showBackButton = false,
  onBackClick,
}: NavigationProps) => {
  const {
    notifications,
    unreadCount,
    isOpen,
    setIsOpen,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();
  
  const { getNewTestsCount } = useViewedTests();
  const { isLoading, lastUpdated, refreshData } = useData();
  
  // Мок данные тестов для подсчета новых
  const mockTests = [
    { id: "1", createdAt: new Date("2024-01-15") },
    { id: "2", createdAt: new Date("2024-01-10") },
  ];
  
  const newTestsCount = getNewTestsCount(mockTests);

  const handleActionClick = (notification: any) => {
    // Закрываем панель уведомлений
    setIsOpen(false);

    // Переходим на соответствующую вкладку
    if (notification.actionUrl?.includes("dashboard")) {
      setActiveTab("dashboard");
    } else if (notification.actionUrl?.includes("knowledge")) {
      setActiveTab("knowledge");
    } else if (notification.actionUrl?.includes("analytics")) {
      setActiveTab("analytics");
    }
  };
  return (
    <>
      <div className="flex items-center justify-between mb-6 px-[7px] bg-emerald-100 shadow-md rounded-lg">
        <div className="flex items-center space-x-4">
          <img 
            src="https://cdn.poehali.dev/files/ef4f26ae-4e82-46e1-a4de-1c072818869c.png" 
            alt="Logo" 
            className="object-contain w-10 h-10"
          />
          <h1 className="font-bold text-gray-900 text-2xl">
            Центр развития и тестирования
          </h1>
          {userName && (
            <div className="items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-lg px-3 py-2 hidden md:flex">
              <Icon name="User" size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">{userName}</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <ServerStatusIndicator compact />
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-shadow"
            title={lastUpdated ? `Обновлено: ${lastUpdated.toLocaleTimeString()}` : "Обновить данные"}
          >
            <Icon name={isLoading ? "Loader2" : "RefreshCw"} size={16} className={isLoading ? "animate-spin" : ""} />
          </Button>
          <NotificationBell employeeId={employeeId} isAdmin={userRole === 'admin'} />
          <SupportChat 
            employeeId={employeeId} 
            isAdmin={userRole === 'admin'}
            compact={true}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab("settings")}
            className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-shadow"
            title="Настройки"
          >
            <Icon name="Settings" size={16} />
          </Button>
          {onLogout && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                onLogout();
              }}
              className="text-red-600 border-red-600 hover:bg-red-50 shadow-lg hover:shadow-xl transition-shadow"
            >
              <Icon name="LogOut" size={16} className="mr-2" />
              Выход
            </Button>
          )}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden shadow-lg hover:shadow-xl transition-shadow">
                <Icon name="Menu" size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle>Навигация</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-full py-4">
                <div className="space-y-2">

                  <Button
                    variant={activeTab === "dashboard" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      setActiveTab("dashboard");
                      setSidebarOpen(false);
                    }}
                  >
                    <Icon name="LayoutDashboard" size={16} className="mr-2" />
                    Панель управления
                  </Button>
                  <Button
                    variant={activeTab === "knowledge" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      setActiveTab("knowledge");
                      setSidebarOpen(false);
                    }}
                  >
                    <Icon name="BookOpen" size={16} className="mr-2" />
                    База знаний
                  </Button>
                  <Button
                    variant={activeTab === "tests" ? "default" : "ghost"}
                    className="w-full justify-start test-button-animate test-button-glow test-button-hover relative"
                    onClick={() => {
                      setActiveTab("tests");
                      setSidebarOpen(false);
                    }}
                  >
                    <Icon name="FileText" size={16} className="mr-2" />
                    Тесты
                    {newTestsCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-bounce">
                        {newTestsCount > 99 ? '99+' : newTestsCount}
                      </span>
                    )}
                  </Button>
                  <Button
                    variant={activeTab === "analytics" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      setActiveTab("analytics");
                      setSidebarOpen(false);
                    }}
                  >
                    <Icon name="BarChart3" size={16} className="mr-2" />
                    Аналитика
                  </Button>
                  {(userRole === "admin" || userRole === "teacher") && (
                    <>
                      <Button
                        variant={activeTab === "assignments" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => {
                          setActiveTab("assignments");
                          setSidebarOpen(false);
                        }}
                      >
                        <Icon name="ClipboardList" size={16} className="mr-2" />
                        Задания
                      </Button>
                      <Button
                        variant={activeTab === "employees" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => {
                          setActiveTab("employees");
                          setSidebarOpen(false);
                        }}
                      >
                        <Icon name="Users" size={16} className="mr-2" />
                        Сотрудники
                      </Button>
                    </>
                  )}
                  <Button
                    variant={activeTab === "settings" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      setActiveTab("settings");
                      setSidebarOpen(false);
                    }}
                  >
                    <Icon name="Settings" size={16} className="mr-2" />
                    Настройки
                  </Button>
                  {userRole === "admin" && (
                    <>
                      <Button
                        variant="ghost"
                        className="w-full justify-start bg-orange-50 hover:bg-orange-100"
                        onClick={() => {
                          window.location.href = '/admin-settings';
                          setSidebarOpen(false);
                        }}
                      >
                        <Icon name="Wrench" size={16} className="mr-2" />
                        Настройки проекта
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start border-blue-500 text-blue-600 hover:bg-blue-50"
                        onClick={() => {
                          window.open('/admin-console', '_blank');
                          setSidebarOpen(false);
                        }}
                      >
                        <Icon name="Terminal" size={16} className="mr-2" />
                        Консоль ошибок
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      window.location.href = '/bitrix24';
                      setSidebarOpen(false);
                    }}
                  >
                    <Icon name="Zap" size={16} className="mr-2" />
                    Битрикс24
                  </Button>
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-8">
        {showBackButton && onBackClick && (
          <Button
            variant="default"
            size="lg"
            onClick={onBackClick}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all flex-shrink-0"
          >
            <Icon name="ArrowLeft" size={20} className="mr-2" />
            Назад
          </Button>
        )}
        <TabsList className={`grid w-full ${(userRole === "admin" || userRole === "teacher") ? 'grid-cols-6' : 'grid-cols-4'} bg-transparent gap-2`}>

        <TabsTrigger
          value="dashboard"
          onClick={() => {
            if (activeTab === "dashboard") {
              window.dispatchEvent(new CustomEvent('resetSubsection'));
            }
          }}
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white bg-gray-200 text-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
        >
          <Icon name="LayoutDashboard" size={16} className="mr-2" />
          <span className="hidden sm:inline text-lg">
            Панель
          </span>
        </TabsTrigger>
        <TabsTrigger
          value="knowledge"
          onClick={() => {
            if (activeTab === "knowledge") {
              window.dispatchEvent(new CustomEvent('resetSubsection'));
            }
          }}
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white bg-gray-200 text-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
        >
          <Icon name="BookOpen" size={16} className="mr-2" />
          <span className="hidden sm:inline text-lg">
            База знаний
          </span>
        </TabsTrigger>
        <TabsTrigger
          value="tests"
          onClick={() => {
            if (activeTab === "tests") {
              window.dispatchEvent(new CustomEvent('resetSubsection'));
            }
          }}
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white bg-gray-200 text-gray-700 transition-all duration-300 test-button-animate test-button-glow test-button-hover relative shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
        >
          <Icon name="FileText" size={16} className="mr-2" />
          <span className="hidden sm:inline text-lg">
            Тесты
          </span>
          {newTestsCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-bounce">
              {newTestsCount > 99 ? '99+' : newTestsCount}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="analytics"
          onClick={() => {
            if (activeTab === "analytics") {
              window.dispatchEvent(new CustomEvent('resetSubsection'));
            }
          }}
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white bg-gray-200 text-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
        >
          <Icon name="BarChart3" size={16} className="mr-2" />
          <span className="hidden sm:inline text-lg">
            Аналитика
          </span>
        </TabsTrigger>
        {(userRole === "admin" || userRole === "teacher") && (
          <>
            <TabsTrigger
              value="assignments"
              onClick={() => {
                if (activeTab === "assignments") {
                  window.dispatchEvent(new CustomEvent('resetSubsection'));
                }
              }}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white bg-gray-200 text-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              <Icon name="ClipboardList" size={16} className="mr-2" />
              <span className="hidden sm:inline text-lg">
                Задания
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="employees"
              onClick={() => {
                if (activeTab === "employees") {
                  window.dispatchEvent(new CustomEvent('resetSubsection'));
                }
              }}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white bg-gray-200 text-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              <Icon name="Users" size={16} className="mr-2" />
              <span className="hidden sm:inline text-lg">
                Сотрудники
              </span>
            </TabsTrigger>
          </>
        )}

      </TabsList>
      </div>
    </>
  );
};