import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Icon from "@/components/ui/icon";
import { useNotifications } from "@/hooks/useNotifications";
import { Footer } from "@/components/layout/Footer";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <Icon name="CheckCircle" size={20} className="text-green-600" />;
      case "warning":
        return <Icon name="AlertTriangle" size={20} className="text-yellow-600" />;
      case "error":
        return <Icon name="XCircle" size={20} className="text-red-600" />;
      default:
        return <Icon name="Info" size={20} className="text-blue-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "test":
        return <Icon name="FileText" size={16} className="text-blue-600" />;
      case "course":
        return <Icon name="BookOpen" size={16} className="text-green-600" />;
      case "achievement":
        return <Icon name="Trophy" size={16} className="text-yellow-600" />;
      case "system":
        return <Icon name="Settings" size={16} className="text-gray-600" />;
      default:
        return <Icon name="Bell" size={16} className="text-gray-600" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} дн. назад`;
    } else if (hours > 0) {
      return `${hours} ч. назад`;
    } else if (minutes > 0) {
      return `${minutes} мин. назад`;
    } else {
      return "Только что";
    }
  };

  const recentNotifications = notifications
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 50);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <Icon name="Bell" className="mr-3" size={32} />
              Уведомления
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-3">
                  {unreadCount} новых
                </Badge>
              )}
            </h1>
            <p className="text-gray-600">Все ваши уведомления в одном месте</p>
          </div>
          <Button 
            onClick={() => navigate('/')}
            variant="outline"
            size="lg"
          >
            <Icon name="ArrowLeft" className="mr-2" size={20} />
            Вернуться в приложение
          </Button>
        </div>

        {notifications.length > 0 && (
          <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <Icon name="CheckCheck" size={16} className="mr-2" />
              Отметить все как прочитанные
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-red-600 hover:text-red-700"
            >
              <Icon name="Trash2" size={16} className="mr-2" />
              Очистить все
            </Button>
          </div>
        )}

        <ScrollArea className="h-[calc(100vh-16rem)]">
          {recentNotifications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-16">
                <Icon
                  name="Bell"
                  size={64}
                  className="mx-auto mb-4 text-gray-300"
                />
                <p className="text-gray-500 text-lg">Уведомлений нет</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    notification.isRead
                      ? "opacity-60"
                      : "border-blue-200 bg-blue-50/50"
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="flex items-center space-x-2">
                          {getNotificationIcon(notification.type)}
                          {getCategoryIcon(notification.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-base text-gray-900">
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 flex-shrink-0"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            {notification.actionUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-sm h-7 px-3"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(notification.actionUrl);
                                }}
                              >
                                {notification.actionText || "Перейти"}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 ml-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                      >
                        <Icon name="X" size={16} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
      <Footer />
    </div>
  );
}