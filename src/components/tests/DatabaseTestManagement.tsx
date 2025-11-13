import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { testsService, DatabaseTest } from '@/utils/testsService';
import DatabaseTestTaking from './DatabaseTestTaking';
import TestResultsView from './TestResultsView';
import TestCreationForm from './TestCreationForm';
import TestEditForm from './TestEditForm';
import DeleteTestDialog from './DeleteTestDialog';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { autoRefreshService } from '@/services/autoRefreshService';

interface DatabaseTestManagementProps {
  userId: number;
  userRole: 'admin' | 'teacher' | 'employee';
}

const DatabaseTestManagement: React.FC<DatabaseTestManagementProps> = ({ userId, userRole }) => {
  const [tests, setTests] = useState<DatabaseTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [takingTestId, setTakingTestId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('testManagementTab');
    return saved || 'tests';
  });
  const [isCreatingTest, setIsCreatingTest] = useState(false);
  const [editingTestId, setEditingTestId] = useState<number | null>(null);
  const [deletingTest, setDeletingTest] = useState<{ id: number; title: string; isDeleted?: boolean } | null>(null);
  const [showDeletedTests, setShowDeletedTests] = useState(false);

  const { scrollRef, showIndicator } = useScrollPosition('testsManagement', tests.length);

  useEffect(() => {
    loadTests();
    
    autoRefreshService.subscribe('test-management', () => {
      console.log('🔄 Обновление тестов по сигналу autoRefreshService');
      loadTests();
    });
    
    return () => {
      autoRefreshService.unsubscribe('test-management');
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('testManagementTab', activeTab);
  }, [activeTab]);

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

  const activeTests = tests.filter(test => test.is_active);
  const deletedTests = tests.filter(test => !test.is_active);

  const filteredTests = (showDeletedTests ? deletedTests : activeTests).filter(test => {
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
    setEditingTestId(test.id);
  };

  const handleDeleteTest = (test: DatabaseTest) => {
    setDeletingTest({ id: test.id, title: test.title, isDeleted: !test.is_active });
  };

  const confirmDeleteTest = async (permanent: boolean) => {
    if (!deletingTest) return;
    
    try {
      const success = await testsService.deleteTest(deletingTest.id, permanent);
      if (success) {
        toast.success(permanent ? 'Тест полностью удалён из базы данных' : 'Тест успешно удалён');
        await loadTests();
      } else {
        toast.error('Ошибка удаления теста');
      }
    } catch (error) {
      toast.error('Ошибка удаления теста');
      console.error('Error deleting test:', error);
    } finally {
      setDeletingTest(null);
    }
  };

  const handleRestoreTest = async (testId: number, testTitle: string) => {
    try {
      const success = await testsService.restoreTest(testId);
      if (success) {
        toast.success(`Тест "${testTitle}" восстановлен`);
        await loadTests();
      } else {
        toast.error('Ошибка восстановления теста');
      }
    } catch (error) {
      toast.error('Ошибка восстановления теста');
      console.error('Error restoring test:', error);
    }
  };

  if (isCreatingTest) {
    return (
      <TestCreationForm
        userId={userId}
        onCancel={() => setIsCreatingTest(false)}
        onSuccess={() => {
          setIsCreatingTest(false);
          loadTests();
        }}
      />
    );
  }

  if (editingTestId) {
    return (
      <TestEditForm
        testId={editingTestId}
        onCancel={() => setEditingTestId(null)}
        onSuccess={() => {
          setEditingTestId(null);
          loadTests();
        }}
      />
    );
  }

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
    <>
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 bg-transparent">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="tests">
          <Icon name="FileText" size={16} className="mr-2" />
          Тесты
        </TabsTrigger>
        <TabsTrigger value="results">
          <Icon name="BarChart" size={16} className="mr-2" />
          Результаты
        </TabsTrigger>
      </TabsList>

      <TabsContent value="tests" className="space-y-6">
        {/* Заголовок и статистика */}
        <Card className="bg-transparent border-transparent shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Тесты из базы данных</CardTitle>
                <CardDescription>
                  Система тестирования знаний сотрудников
                </CardDescription>
              </div>
              {(userRole === 'admin' || userRole === 'teacher') && (
                <Button 
                  onClick={() => setIsCreatingTest(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-[0.25px] border-black"
                >
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

      {/* Поиск и фильтры */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="relative">
              <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Поиск тестов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-24"
              />
              {searchQuery && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 bg-white px-2">
                  {filteredTests.length} результатов
                </div>
              )}
            </div>
            
            {(userRole === 'admin' || userRole === 'teacher') && deletedTests.length > 0 && (
              <div className="flex items-center space-x-2">
                <Button
                  variant={showDeletedTests ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowDeletedTests(!showDeletedTests)}
                >
                  <Icon name={showDeletedTests ? 'Eye' : 'EyeOff'} size={16} className="mr-2" />
                  {showDeletedTests ? 'Показать активные' : `Удалённые тесты (${deletedTests.length})`}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Список тестов */}
      <Card>
        <CardHeader>
          <CardTitle>Доступные тесты ({filteredTests.length})</CardTitle>
        </CardHeader>
        <CardContent className="relative">
          {showIndicator && (
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-fade-in">
              <Icon name="ArrowDown" size={16} className="animate-bounce" />
              <span className="text-sm font-medium">Восстановление позиции...</span>
            </div>
          )}
          <div ref={scrollRef} className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
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
                            Удалён
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
                      {test.is_active ? (
                        <>
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
                                title="Редактировать тест"
                              >
                                <Icon name="Edit" size={16} />
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteTest(test)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                title="Удалить тест"
                              >
                                <Icon name="Trash2" size={16} />
                              </Button>
                            </>
                          )}
                        </>
                      ) : (
                        (userRole === 'admin' || userRole === 'teacher') && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRestoreTest(test.id, test.title)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-300"
                            >
                              <Icon name="RotateCcw" size={16} className="mr-2" />
                              Восстановить
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteTest(test)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                              title="Удалить навсегда"
                            >
                              <Icon name="Trash2" size={16} />
                            </Button>
                          </>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </CardContent>
      </Card>
      </TabsContent>

      <TabsContent value="results" className="space-y-6">
        <TestResultsView userId={userId} userRole={userRole} />
      </TabsContent>
    </Tabs>

    <DeleteTestDialog
      isOpen={!!deletingTest}
      testTitle={deletingTest?.title || ''}
      isDeleted={deletingTest?.isDeleted}
      onConfirm={confirmDeleteTest}
      onCancel={() => setDeletingTest(null)}
    />
    </>
  );
};

export default DatabaseTestManagement;