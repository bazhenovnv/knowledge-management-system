import React from 'react';
import Icon from '@/components/ui/icon';
import { DEMO_USERS } from '@/utils/passwordResetService';

interface DemoUsersInfoProps {
  compact?: boolean;
}

export default function DemoUsersInfo({ compact = false }: DemoUsersInfoProps) {
  const usersToShow = compact ? DEMO_USERS.slice(0, 3) : DEMO_USERS;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="font-medium text-blue-900 mb-2 flex items-center">
        <Icon name="Info" size={16} className="mr-2" />
        Тестовые аккаунты для демонстрации:
      </h4>
      
      <div className="space-y-1 text-sm text-blue-800">
        {usersToShow.map(user => (
          <div key={user.email} className="flex justify-between items-center">
            <span className="font-mono">{user.email}</span>
            <span className="text-blue-600 text-xs">{user.department}</span>
          </div>
        ))}
        
        {compact && DEMO_USERS.length > 3 && (
          <div className="text-xs text-blue-600 mt-2 text-center">
            И еще {DEMO_USERS.length - 3} пользователей...
          </div>
        )}
      </div>
      
      <div className="mt-3 pt-3 border-t border-blue-200">
        <div className="text-xs text-blue-700 space-y-1">
          <div className="flex items-center">
            <Icon name="Clock" size={12} className="mr-1" />
            <span>Код действует 15 минут</span>
          </div>
          <div className="flex items-center">
            <Icon name="Shield" size={12} className="mr-1" />
            <span>Максимум 3 попытки ввода</span>
          </div>
          <div className="flex items-center">
            <Icon name="Key" size={12} className="mr-1" />
            <span>Универсальный код: 123456</span>
          </div>
        </div>
      </div>
    </div>
  );
}