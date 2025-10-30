import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Icon from "@/components/ui/icon";
import { Notification } from "@/hooks/useNotifications";

interface NotificationPanelProps {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onActionClick?: (notification: Notification) => void;
}

export const NotificationPanel = ({
  notifications,
  unreadCount,
  isOpen,
  onOpenChange,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
  onActionClick,
}: NotificationPanelProps) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <Icon name="CheckCircle" size={20} className="text-green-600" />;
      case "warning":
        return (
          <Icon name="AlertTriangle" size={20} className="text-yellow-600" />
        );
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
    .slice(0, 10);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Icon name="Bell" size={20} />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-96">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center">
              <span>Уведомления</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {unreadCount} новых
                </Badge>
              )}
            </SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <Icon name="X" size={18} />
            </Button>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {notifications.length > 0 && (
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllAsRead}
                disabled={unreadCount === 0}
              >
                <Icon name="CheckCheck" size={16} className="mr-2" />
                Отметить все как прочитанные
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="text-red-600 hover:text-red-700"
              >
                <Icon name="Trash2" size={16} className="mr-2" />
                Очистить все
              </Button>
            </div>
          )}

          <ScrollArea className="h-[calc(100vh-12rem)]">
            {recentNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Icon
                  name="Bell"
                  size={48}
                  className="mx-auto mb-4 text-gray-300"
                />
                <p className="text-gray-500">Уведомлений нет</p>
              </div>
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
                    onClick={() => onMarkAsRead(notification.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="flex items-center space-x-2">
                            {getNotificationIcon(notification.type)}
                            {getCategoryIcon(notification.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm text-gray-900 truncate">
                                {notification.title}
                              </h4>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 flex-shrink-0"></div>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                              {notification.actionUrl && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs h-6 px-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onActionClick?.(notification);
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
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-600 ml-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(notification.id);
                          }}
                        >
                          <Icon name="X" size={14} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};