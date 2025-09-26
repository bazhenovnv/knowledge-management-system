import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AddEmployeeForm from '@/components/AddEmployeeForm';
import { DatabaseEmployee } from '@/utils/databaseService';

export default function AddEmployeeTestPage() {
  const [showForm, setShowForm] = useState(false);
  const [lastEmployee, setLastEmployee] = useState<DatabaseEmployee | null>(null);

  const handleEmployeeAdded = (employee: DatabaseEmployee) => {
    setLastEmployee(employee);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {!showForm ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Тестирование добавления сотрудников</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => setShowForm(true)}
                className="w-full"
              >
                Добавить нового сотрудника
              </Button>
              
              {lastEmployee && (
                <div className="border rounded-lg p-4 bg-green-50">
                  <h3 className="font-semibold text-green-800 mb-2">
                    ✅ Последний добавленный сотрудник:
                  </h3>
                  <div className="text-sm space-y-1">
                    <p><strong>ID:</strong> {lastEmployee.id}</p>
                    <p><strong>Имя:</strong> {lastEmployee.full_name}</p>
                    <p><strong>Email:</strong> {lastEmployee.email}</p>
                    <p><strong>Отдел:</strong> {lastEmployee.department}</p>
                    <p><strong>Должность:</strong> {lastEmployee.position}</p>
                    <p><strong>Роль:</strong> {lastEmployee.role}</p>
                    {lastEmployee.phone && <p><strong>Телефон:</strong> {lastEmployee.phone}</p>}
                    {lastEmployee.hire_date && <p><strong>Дата найма:</strong> {lastEmployee.hire_date}</p>}
                  </div>
                </div>
              )}
              
              <div className="text-sm text-gray-600">
                <p><strong>Инструкция:</strong></p>
                <p>1. Нажмите кнопку "Добавить нового сотрудника"</p>
                <p>2. Заполните форму данными</p>
                <p>3. Нажмите "Добавить сотрудника"</p>
                <p>4. Сотрудник будет сохранен в базе данных PostgreSQL</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div>
            <Button 
              onClick={() => setShowForm(false)}
              variant="outline"
              className="mb-4"
            >
              ← Назад к меню
            </Button>
            
            <AddEmployeeForm
              onEmployeeAdded={handleEmployeeAdded}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}