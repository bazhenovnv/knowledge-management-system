import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { DatabaseEmployee } from '@/utils/databaseService';
import { externalDb } from '@/services/externalDbService';
import AddEmployeeForm from './AddEmployeeForm';

const DatabaseTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState<DatabaseEmployee[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connected' | 'error'>('idle');
  const [showAddForm, setShowAddForm] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    setConnectionStatus('idle');
    
    try {
      // Тест получения сотрудников
      const employeeData = await externalDb.getEmployees();
      setEmployees(employeeData);
      
      // Тест получения статистики
      const statsData = await externalDb.getDatabaseStats();
      setStats(statsData);
      
      if (employeeData.length > 0 || statsData) {
        setConnectionStatus('connected');
        toast.success('Подключение к базе данных успешно!');
      } else {
        setConnectionStatus('error');
        toast.warning('Подключение установлено, но данных не найдено');
      }
    } catch (error) {
      setConnectionStatus('error');
      toast.error('Ошибка подключения к базе данных');
      console.error('Database connection error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmployeeAdded = (newEmployee: DatabaseEmployee) => {
    setEmployees(prev => [newEmployee, ...prev]);
    setShowAddForm(false);
    // Обновляем статистику
    testConnection();
  };

  useEffect(() => {
    // Автоматически тестируем подключение при загрузке компонента
    testConnection();
  }, []);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Подключено';
      case 'error': return 'Ошибка';
      default: return 'Не проверено';
    }
  };

  return (
    <div className="space-y-6">
      {showAddForm && (
        <AddEmployeeForm 
          onEmployeeAdded={handleEmployeeAdded}
          onCancel={() => setShowAddForm(false)}
        />
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Icon name="Database" size={24} />
            <span>Тест подключения к базе данных</span>
            <Badge variant="outline" className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
              <span>{getStatusText()}</span>
            </Badge>
          </CardTitle>
          <CardDescription>
            Проверка работоспособности подключения к PostgreSQL базе данных
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Button 
                onClick={testConnection} 
                disabled={isLoading}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-[0.25px] border-black"
              >
                {isLoading ? (
                  <Icon name="Loader2" size={16} className="animate-spin" />
                ) : (
                  <Icon name="RefreshCw" size={16} />
                )}
                <span>{isLoading ? 'Проверка...' : 'Проверить подключение'}</span>
              </Button>
              
              <Button 
                onClick={() => setShowAddForm(!showAddForm)}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Icon name="UserPlus" size={16} />
                <span>{showAddForm ? 'Скрыть форму' : 'Добавить сотрудника'}</span>
              </Button>
            </div>
            
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.active_employees || 0}</div>
                  <div className="text-sm text-gray-500">Активные сотрудники</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{stats.inactive_employees || 0}</div>
                  <div className="text-sm text-gray-500">Неактивные</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.active_courses || 0}</div>
                  <div className="text-sm text-gray-500">Активные курсы</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.total_enrollments || 0}</div>
                  <div className="text-sm text-gray-500">Записи на курсы</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.total_attendance || 0}</div>
                  <div className="text-sm text-gray-500">Посещаемость</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {employees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Данные из базы данных ({employees.length} записей)</CardTitle>
            <CardDescription>Сотрудники из таблицы employees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                      <span className="text-sm font-medium text-blue-600">
                        {employee.full_name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{employee.full_name || 'Без имени'}</div>
                      <div className="text-sm text-gray-500">
                        {employee.position || 'Без должности'} • {employee.department || 'Без отдела'}
                      </div>
                      <div className="text-xs text-gray-400">{employee.email || 'Без email'}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={employee.role === 'admin' ? 'destructive' : 
                               employee.role === 'teacher' ? 'default' : 'secondary'}
                    >
                      {employee.role || 'employee'}
                    </Badge>
                    <Badge variant={employee.is_active ? 'default' : 'secondary'}>
                      {employee.is_active ? 'Активен' : 'Неактивен'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DatabaseTest;