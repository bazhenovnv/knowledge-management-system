import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import DatabaseTest from '@/components/DatabaseTest';

const DatabaseTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/">
            <Button variant="outline" className="flex items-center space-x-2">
              <ArrowLeft size={16} />
              <span>Назад к главной</span>
            </Button>
          </Link>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Тестирование базы данных
            </h1>
            <p className="text-lg text-gray-600">
              Проверка подключения к PostgreSQL и работоспособности системы
            </p>
          </div>
          
          <DatabaseTest />
        </div>
      </div>
    </div>
  );
};

export default DatabaseTestPage;