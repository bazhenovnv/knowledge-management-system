import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { databaseService } from '@/utils/databaseService';
import { Footer } from '@/components/layout/Footer';

export default function DemoEmployeesPage() {
  const [isLoading, setIsLoading] = useState(false);

  const demoEmployees = [
    {
      full_name: 'Иванов Петр Сергеевич',
      email: 'p.ivanov@company.com',
      phone: '+7 (999) 111-22-33',
      department: 'IT',
      position: 'Senior разработчик',
      role: 'employee',
      hire_date: '2024-03-15',
      password: 'demo123'
    },
    {
      full_name: 'Смирнова Анна Михайловна',
      email: 'a.smirnova@company.com',
      phone: '+7 (999) 222-33-44',
      department: 'Маркетинг',
      position: 'Маркетолог',
      role: 'employee',
      hire_date: '2024-05-20',
      password: 'demo123'
    },
    {
      full_name: 'Кузнецов Алексей Владимирович',
      email: 'a.kuznetsov@company.com',
      phone: '+7 (999) 333-44-55',
      department: 'QA/Тестирование',
      position: 'QA инженер',
      role: 'employee',
      hire_date: '2024-01-10',
      password: 'demo123'
    },
    {
      full_name: 'Попова Елена Александровна',
      email: 'e.popova@company.com',
      phone: '+7 (999) 444-55-66',
      department: 'HR',
      position: 'HR-менеджер',
      role: 'employee',
      hire_date: '2023-08-01',
      password: 'demo123'
    },
    {
      full_name: 'Морозов Дмитрий Игоревич',
      email: 'd.morozov@company.com',
      phone: '+7 (999) 555-66-77',
      department: 'Дизайн',
      position: 'Дизайнер',
      role: 'employee',
      hire_date: '2024-07-12',
      password: 'demo123'
    }
  ];

  const createDemoEmployees = async () => {
    setIsLoading(true);
    let successCount = 0;
    
    try {
      for (const employee of demoEmployees) {
        try {
          const result = await databaseService.createEmployee(employee);
          if (result) {
            successCount++;
          }
        } catch (error) {
          console.error(`Ошибка создания сотрудника ${employee.full_name}:`, error);
        }
      }
      
      if (successCount > 0) {
        toast.success(`Создано ${successCount} тестовых сотрудников из ${demoEmployees.length}`);
      } else {
        toast.error('Не удалось создать ни одного сотрудника (возможно, они уже существуют)');
      }
    } catch (error) {
      toast.error('Ошибка при создании тестовых сотрудников');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="UserPlus" size={24} />
              Создание тестовых сотрудников
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-sm text-gray-600">
              <p className="mb-4">
                Эта страница создаст 5 тестовых сотрудников для демонстрации функций системы управления персоналом.
              </p>
              
              <h3 className="font-semibold mb-2">Будут созданы следующие сотрудники:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {demoEmployees.map((emp, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-white">
                    <div className="font-medium">{emp.full_name}</div>
                    <div className="text-xs text-gray-500">
                      {emp.department} • {emp.position}
                    </div>
                    <div className="text-xs text-gray-500">{emp.email}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button
                onClick={createDemoEmployees}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Создание сотрудников...
                  </>
                ) : (
                  <>
                    <Icon name="Users" size={16} className="mr-2" />
                    Создать тестовых сотрудников
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => window.location.href = '/employees'}
                variant="outline"
              >
                <Icon name="ArrowRight" size={16} className="mr-2" />
                Перейти к управлению
              </Button>
            </div>
            
            <div className="text-xs text-gray-500 border-t pt-4">
              <p><strong>Примечание:</strong> Все тестовые сотрудники создаются с временным паролем "demo123".</p>
              <p>После создания вы сможете редактировать их данные на странице управления сотрудниками.</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}