import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { testsService, DatabaseTest } from '@/utils/testsService';
import DatabaseTestTaking from './DatabaseTestTaking';

interface DatabaseTestManagementProps {
  userId: number;
  userRole: 'admin' | 'teacher' | 'employee';
}

const DatabaseTestManagement: React.FC<DatabaseTestManagementProps> = ({ userId, userRole }) => {
  const [tests, setTests] = useState<DatabaseTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [takingTestId, setTakingTestId] = useState<number | null>(null);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    setIsLoading(true);
    try {
      const testsData = await testsService.getTests();
      setTests(testsData);
    } catch (error) {
      toast.error('Ошибка загрузки тестов');
      console.error('Error loading tests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTests = tests.filter(test => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      test.title.toLowerCase().includes(query) ||
      test.description?.toLowerCase().includes(query) ||
      test.course_title?.toLowerCase().includes(query)
    );
  });

  const handleViewTest = (test: DatabaseTest) => {
    setTakingTestId(test.id);
  };

  const handleCompleteTest = () => {
    setTakingTestId(null);
    loadTests();
  };

  const handleCancelTest = () => {
    setTakingTestId(null);
  };

  const handleEditTest = (test: DatabaseTest) => {
    toast.info('Редактирование тестов скоро будет доступно');
  };

  const handleDeleteTest = async (testId: number) => {
    if (!confirm('Удалить тест?')) return;
    
    try {
      const success = await testsService.deleteTest(testId);
      if (success) {
        toast.success('Тест удален');
        await loadTests();
      } else {
        toast.error('Ошибка удаления теста');
      }
    } catch (error) {
      toast.error('Ошибка удаления теста');
      console.error('Error deleting test:', error);
    }
  };

  if (takingTestId) {
    return (
      <DatabaseTestTaking
        testId={takingTestId}
        userId={userId}
        onComplete={handleCompleteTest}
        onCancel={handleCancelTest}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Icon name="Loader2" size={24} className="animate-spin" />
          <span>Загрузка тестов...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и статистика */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Тесты из базы данных</CardTitle>
              <CardDescription>
                Система тестирования знаний сотрудников
              </CardDescription>
            </div>
            {(userRole === 'admin' || userRole === 'teacher') && (
              <Button onClick={() => toast.info('Создание тестов скоро будет доступно')}>
                <Icon name="Plus" size={16} className="mr-2" />
                Создать тест
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon name="FileText" size={20} className="text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Всего тестов</p>
                  <p className="text-2xl font-bold">{tests.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon name="CheckCircle" size={20} className="text-green-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Активных</p>
                  <p className="text-2xl font-bold">
                    {tests.filter(t => t.is_active).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon name="HelpCircle" size={20} className="text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Вопросов</p>
                  <p className="text-2xl font-bold">
                    {tests.reduce((sum, t) => sum + (t.questions_count || 0), 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon name="Users" size={20} className="text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Результатов</p>
                  <p className="text-2xl font-bold">
                    {tests.reduce((sum, t) => sum + (t.results_count || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Поиск */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Поиск тестов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Список тестов */}
      <Card>
        <CardHeader>
          <CardTitle>Доступные тесты ({filteredTests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Icon name="FileText" size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Тесты не найдены</p>
              <p className="text-sm">Попробуйте изменить параметры поиска</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTests.map((test) => (
                <div
                  key={test.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{test.title}</h3>
                        {test.is_active ? (
                          <Badge variant="default" className="bg-green-500">
                            Активен
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            Неактивен
                          </Badge>
                        )}
                      </div>
                      
                      {test.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {test.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        {test.course_title && (
                          <div className="flex items-center space-x-1">
                            <Icon name="BookOpen" size={14} />
                            <span>{test.course_title}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-1">
                          <Icon name="HelpCircle" size={14} />
                          <span>{test.questions_count || 0} вопросов</span>
                        </div>
                        
                        {test.time_limit && (
                          <div className="flex items-center space-x-1">
                            <Icon name="Clock" size={14} />
                            <span>{test.time_limit} мин</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-1">
                          <Icon name="Target" size={14} />
                          <span>Проходной: {test.passing_score}%</span>
                        </div>

                        {test.creator_name && (
                          <div className="flex items-center space-x-1">
                            <Icon name="User" size={14} />
                            <span>{test.creator_name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleViewTest(test)}
                      >
                        <Icon name="Play" size={16} className="mr-1" />
                        Пройти
                      </Button>
                      
                      {(userRole === 'admin' || (userRole === 'teacher' && test.creator_id === userId)) && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTest(test)}
                          >
                            <Icon name="Edit" size={16} />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTest(test.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseTestManagement;