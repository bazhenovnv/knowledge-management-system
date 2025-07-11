import { useState, useEffect } from "react";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: Date;
  isRead: boolean;
  category: "test" | "course" | "system" | "achievement";
  actionUrl?: string;
  actionText?: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Инициализация с тестовыми уведомлениями
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: "1",
        title: "Новый тест доступен",
        message: "Тест по информационной безопасности готов к прохождению",
        type: "info",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 часа назад
        isRead: false,
        category: "test",
        actionUrl: "/dashboard",
        actionText: "Пройти тест",
      },
      {
        id: "2",
        title: "Курс завершен",
        message: 'Поздравляем! Вы успешно завершили курс "Основы React"',
        type: "success",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 день назад
        isRead: false,
        category: "achievement",
        actionUrl: "/analytics",
        actionText: "Посмотреть результаты",
      },
      {
        id: "3",
        title: "Напоминание о дедлайне",
        message:
          'До окончания курса "TypeScript для разработчиков" остается 3 дня',
        type: "warning",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 часа назад
        isRead: true,
        category: "course",
        actionUrl: "/knowledge",
        actionText: "Продолжить изучение",
      },
      {
        id: "4",
        title: "Новый материал",
        message: 'Добавлен новый курс "Дизайн интерфейсов"',
        type: "info",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 часов назад
        isRead: false,
        category: "course",
        actionUrl: "/knowledge",
        actionText: "Изучить",
      },
      {
        id: "5",
        title: "Обновление системы",
        message:
          "Система будет недоступна завтра с 02:00 до 04:00 для технического обслуживания",
        type: "warning",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 часов назад
        isRead: true,
        category: "system",
      },
    ];

    setNotifications(mockNotifications);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const addNotification = (
    notification: Omit<Notification, "id" | "timestamp">,
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const getNotificationsByCategory = (category: string) => {
    return notifications.filter((n) => n.category === category);
  };

  const getRecentNotifications = (limit: number = 5) => {
    return notifications
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  };

  return {
    notifications,
    unreadCount,
    isOpen,
    setIsOpen,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    addNotification,
    getNotificationsByCategory,
    getRecentNotifications,
  };
};
