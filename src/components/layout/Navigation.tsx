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
import { useNotifications } from "@/hooks/useNotifications";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Navigation = ({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Развитие сотрудников
          </h1>
          <NotificationBadge count={unreadCount} />
        </div>
        <div className="flex items-center space-x-2">
          <NotificationPanel
            notifications={notifications}
            unreadCount={unreadCount}
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onDelete={deleteNotification}
            onClearAll={clearAll}
            onActionClick={handleActionClick}
          />
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
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
                  variant={activeTab === "home" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveTab("home");
                    setSidebarOpen(false);
                  }}
                >
                  <Icon name="Home" size={16} className="mr-2" />
                  Главная
                </Button>
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
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      <TabsList className="grid w-full grid-cols-4 mb-8 bg-white/50 backdrop-blur-sm">
        <TabsTrigger
          value="home"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300"
        >
          <Icon name="Home" size={16} className="mr-2" />
          <span className="hidden sm:inline">Главная</span>
        </TabsTrigger>
        <TabsTrigger
          value="dashboard"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300"
        >
          <Icon name="LayoutDashboard" size={16} className="mr-2" />
          <span className="hidden sm:inline">Панель</span>
        </TabsTrigger>
        <TabsTrigger
          value="knowledge"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300"
        >
          <Icon name="BookOpen" size={16} className="mr-2" />
          <span className="hidden sm:inline">База знаний</span>
        </TabsTrigger>
        <TabsTrigger
          value="analytics"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300"
        >
          <Icon name="BarChart3" size={16} className="mr-2" />
          <span className="hidden sm:inline">Аналитика</span>
        </TabsTrigger>
      </TabsList>
    </>
  );
};