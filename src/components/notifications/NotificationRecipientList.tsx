import React from 'react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Employee, NotificationData } from './notificationFormTypes';

interface NotificationRecipientListProps {
  formData: NotificationData;
  employees: Employee[];
  filteredEmployees: Employee[];
  toggleEmployee: (employeeId: number) => void;
}

const NotificationRecipientList: React.FC<NotificationRecipientListProps> = ({
  formData,
  employees,
  filteredEmployees,
  toggleEmployee
}) => {
  return (
    <div className="space-y-4">
      {/* Список получателей */}
      <div className="max-h-48 overflow-y-auto border rounded-md">
        {filteredEmployees.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Icon name="Users" size={24} className="mx-auto mb-2 opacity-50" />
            <p>Сотрудники не найдены</p>
            <p className="text-xs">Попробуйте изменить параметры поиска</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredEmployees.map((employee) => (
              <div
                key={employee.id}
                className={`flex items-center space-x-3 p-3 rounded cursor-pointer hover:bg-gray-50 transition-colors ${
                  formData.recipients.includes(employee.id) 
                    ? 'bg-blue-50 border border-blue-200 shadow-sm' 
                    : 'border border-transparent'
                }`}
                onClick={() => toggleEmployee(employee.id)}
              >
                <input
                  type="checkbox"
                  checked={formData.recipients.includes(employee.id)}
                  onChange={() => toggleEmployee(employee.id)}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{employee.name}</span>
                    {formData.recipients.includes(employee.id) && (
                      <Icon name="Check" size={14} className="text-blue-600" />
                    )}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center space-x-2">
                    <Icon name="Briefcase" size={12} />
                    <span>{employee.position}</span>
                    <span>•</span>
                    <Icon name="Building2" size={12} />
                    <span>{employee.department}</span>
                  </div>
                  <div className="text-xs text-gray-400 flex items-center space-x-1">
                    <Icon name="Mail" size={10} />
                    <span>{employee.email}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Выбранные получатели */}
      {formData.recipients.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Выбранные получатели ({formData.recipients.length}):</Label>
          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-2 bg-gray-50 rounded">
            {employees
              .filter(emp => formData.recipients.includes(emp.id))
              .map(employee => (
                <Badge 
                  key={employee.id} 
                  variant="secondary" 
                  className="flex items-center space-x-1 cursor-pointer hover:bg-red-100"
                  onClick={() => toggleEmployee(employee.id)}
                >
                  <span>{employee.name}</span>
                  <Icon name="X" size={12} />
                </Badge>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationRecipientList;