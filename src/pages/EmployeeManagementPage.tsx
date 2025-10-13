import React from 'react';
import Icon from '@/components/ui/icon';
import EmployeeList from '@/components/EmployeeList';

export default function EmployeeManagementPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Управление сотрудниками
          </h1>
          <p className="text-gray-600">
            Просмотр, добавление и редактирование информации о сотрудниках
          </p>
        </div>

        <EmployeeList />

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Возможности системы:</p>
              <ul className="space-y-1 text-blue-700">
                <li>• Поиск сотрудников по имени, email, отделу или должности</li>
                <li>• Добавление новых сотрудников с валидацией данных</li>
                <li>• Редактирование информации о сотрудниках</li>
                <li>• Мягкое удаление (деактивация) сотрудников</li>
                <li>• Автоматическое сохранение в PostgreSQL</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}