import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { DatabaseEmployee } from '@/utils/databaseService';

// Безопасная функция для получения инициалов
const getInitials = (name: string | null | undefined): string => {
  if (!name || typeof name !== 'string') {
    return '??';
  }
  
  try {
    return name.split(' ')
      .filter(n => n && n.length > 0)
      .map(n => n.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase() || '??';
  } catch {
    return '??';
  }
};

interface DatabaseEmployeeCardProps {
  employee: DatabaseEmployee;
  onEdit: (employee: DatabaseEmployee) => void;
  onChangePassword: (employee: DatabaseEmployee) => void;
  onSendNotification: (employee: DatabaseEmployee) => void;
  onDelete: (employee: DatabaseEmployee) => void;
}

export const DatabaseEmployeeCard: React.FC<DatabaseEmployeeCardProps> = ({
  employee,
  onEdit,
  onChangePassword,
  onSendNotification,
  onDelete
}) => {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-4">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
          <span className="text-lg font-medium text-blue-600">
            {getInitials(employee.full_name)}
          </span>
        </div>
        <div>
          <div className="font-medium text-lg">{employee.full_name || 'Не указано'}</div>
          <div className="text-sm text-gray-500">
            {employee.position || 'Не указано'} • {employee.department || 'Не указано'}
          </div>
          <div className="text-xs text-gray-400 flex items-center space-x-2">
            <Icon name="Mail" size={12} />
            <span>{employee.email || 'Не указано'}</span>
            {employee.phone && (
              <>
                <span>•</span>
                <Icon name="Phone" size={12} />
                <span>{employee.phone}</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <Badge 
          variant={employee.role === 'admin' ? 'destructive' : 
                   employee.role === 'teacher' ? 'default' : 'secondary'}
        >
          {employee.role === 'admin' ? 'Администратор' : 
           employee.role === 'teacher' ? 'Преподаватель' : 'Сотрудник'}
        </Badge>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(employee)}
            className="text-blue-600 hover:text-blue-700"
            title="Редактировать"
          >
            <Icon name="Edit" size={14} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onChangePassword(employee)}
            className="text-green-600 hover:text-green-700"
            title="Изменить пароль"
          >
            <Icon name="Key" size={14} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSendNotification(employee)}
            className="text-purple-600 hover:text-purple-700"
            title="Отправить уведомление"
          >
            <Icon name="Send" size={14} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(employee)}
            className="text-red-600 hover:text-red-700"
            title="Удалить"
          >
            <Icon name="Trash2" size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
};