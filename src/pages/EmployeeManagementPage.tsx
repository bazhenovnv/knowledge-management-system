import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmployeeList from '@/components/EmployeeList';
import AddEmployeeForm from '@/components/AddEmployeeForm';
import { DatabaseEmployee } from '@/utils/databaseService';
import Icon from '@/components/ui/icon';

export default function EmployeeManagementPage() {
  const [activeTab, setActiveTab] = useState('list');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEmployeeAdded = (employee: DatabaseEmployee) => {
    setActiveTab('list');
    setRefreshKey(prev => prev + 1); // Принудительное обновление списка
  };

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

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <Icon name="Users" size={16} />
              Список сотрудников
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center gap-2">
              <Icon name="UserPlus" size={16} />
              Добавить сотрудника
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            <EmployeeList key={refreshKey} />
          </TabsContent>

          <TabsContent value="add">
            <AddEmployeeForm
              onEmployeeAdded={handleEmployeeAdded}
              onCancel={() => setActiveTab('list')}
            />
          </TabsContent>
        </Tabs>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Возможности системы:</p>
              <ul className="space-y-1 text-blue-700">
                <li>• Просмотр всех активных сотрудников</li>
                <li>• Добавление новых сотрудников в базу данных</li>
                <li>• Редактирование информации о сотрудниках</li>
                <li>• Выпадающие списки отделов и должностей</li>
                <li>• Автоматическое сохранение в PostgreSQL</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}