import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export default function MinimalIndex() {
  const [user] = useState({
    name: 'Администратор Системы',
    role: 'admin'
  });

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Заголовок */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src="https://cdn.poehali.dev/files/ef4f26ae-4e82-46e1-a4de-1c072818869c.png" 
              alt="Logo" 
              className="w-10 h-10 object-contain"
            />
            <h1 className="text-2xl font-bold text-gray-900">
              Центр развития и тестирования
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
              <Icon name="User" size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">{user.name}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              <Icon name="LogOut" size={16} className="mr-2" />
              Выход
            </Button>
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Система управления обучением
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Добро пожаловать в центр развития и тестирования сотрудников. 
            Система временно находится в режиме восстановления.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Icon name="Users" size={24} className="text-blue-600" />
              </div>
              <h3 className="ml-4 text-lg font-semibold text-gray-900">Сотрудники</h3>
            </div>
            <p className="text-gray-600">Управление данными сотрудников и их профилями</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Icon name="BookOpen" size={24} className="text-green-600" />
              </div>
              <h3 className="ml-4 text-lg font-semibold text-gray-900">Обучение</h3>
            </div>
            <p className="text-gray-600">База знаний и обучающие материалы</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Icon name="ClipboardCheck" size={24} className="text-purple-600" />
              </div>
              <h3 className="ml-4 text-lg font-semibold text-gray-900">Тестирование</h3>
            </div>
            <p className="text-gray-600">Система тестов и оценки знаний</p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Система восстанавливается
            </h3>
            <p className="text-blue-700">
              Мы устраняем технические неполадки. Основные функции будут доступны в ближайшее время.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}