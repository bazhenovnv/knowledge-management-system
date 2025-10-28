import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { database, Assignment, AssignmentProgress, Test, KnowledgeMaterial } from '@/utils/database';
import { useScrollPosition } from '@/hooks/useScrollPosition';

interface MyAssignmentsProps {
  userId: number;
}

const MyAssignments: React.FC<MyAssignmentsProps> = ({ userId }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [progress, setProgress] = useState<AssignmentProgress[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [materials, setMaterials] = useState<KnowledgeMaterial[]>([]);
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('myAssignmentsTab');
    return saved || 'all';
  });

  const scrollRef = useScrollPosition('myAssignments', assignments.length);

  useEffect(() => {
    loadData();
  }, [userId]);

  useEffect(() => {
    localStorage.setItem('myAssignmentsTab', activeTab);
  }, [activeTab]);

  const loadData = () => {
    const userAssignments = database.getAssignmentsForUser(userId);
    const userProgress = database.getUserProgress(userId);
    const allTests = database.getTests();
    const allMaterials = database.getKnowledgeMaterials();
    
    setAssignments(userAssignments);
    setProgress(userProgress);
    setTests(allTests);
    setMaterials(allMaterials);
  };

  const getAssignmentProgress = (assignmentId: string) => {
    return progress.find(p => p.assignmentId === assignmentId);
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'overdue': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'CheckCircle';
      case 'in_progress': return 'PlayCircle';
      case 'overdue': return 'AlertCircle';
      default: return 'Circle';
    }
  };

  const startAssignment = (assignmentId: string) => {
    database.updateAssignmentProgress(assignmentId, userId, {
      status: 'in_progress',
      startedAt: new Date()
    });
    loadData();
  };

  const openTest = (testId: string) => {
    // Создаем событие для навигации к тестам
    const event = new CustomEvent('navigateToTest', { 
      detail: { testId } 
    });
    window.dispatchEvent(event);
    
    // Показываем уведомление
    toast.success('Переход к тесту...');
  };

  const openMaterial = (materialId: string, assignmentId: string) => {
    // Отмечаем материал как просмотренный
    database.markMaterialViewed(assignmentId, userId, materialId, 5); // 5 минут как примерное время
    
    // Создаем событие для навигации к базе знаний
    const event = new CustomEvent('navigateToKnowledge', { 
      detail: { materialId } 
    });
    window.dispatchEvent(event);
    
    // Показываем уведомление
    toast.success('Переход к материалу...');
    loadData();
  };

  const filteredAssignments = assignments.filter(assignment => {
    const assignmentProgress = getAssignmentProgress(assignment.id);
    const status = assignmentProgress?.status || 'pending';
    
    switch (activeTab) {
      case 'pending':
        return status === 'pending';
      case 'in_progress':
        return status === 'in_progress';
      case 'completed':
        return status === 'completed';
      case 'overdue':
        return status === 'overdue' || (assignment.dueDate && new Date(assignment.dueDate) < new Date() && status !== 'completed');
      default:
        return true;
    }
  });

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (assignment: Assignment) => {
    if (!assignment.dueDate) return false;
    const assignmentProgress = getAssignmentProgress(assignment.id);
    return new Date(assignment.dueDate) < new Date() && assignmentProgress?.status !== 'completed';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Мои задания</h2>
          <p className="text-gray-600">Управляйте своими заданиями и отслеживайте прогресс</p>
        </div>
        
        {/* Общая статистика */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{assignments.length}</div>
            <div className="text-xs text-gray-500">Всего заданий</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {progress.filter(p => p.status === 'completed').length}
            </div>
            <div className="text-xs text-gray-500">Завершено</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {progress.filter(p => p.status === 'in_progress').length}
            </div>
            <div className="text-xs text-gray-500">В процессе</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {assignments.filter(a => isOverdue(a)).length}
            </div>
            <div className="text-xs text-gray-500">Просрочено</div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Все</TabsTrigger>
          <TabsTrigger value="pending">Ожидающие</TabsTrigger>
          <TabsTrigger value="in_progress">В процессе</TabsTrigger>
          <TabsTrigger value="completed">Завершенные</TabsTrigger>
          <TabsTrigger value="overdue">Просроченные</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredAssignments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Icon name="ClipboardList" size={48} className="text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Нет заданий</h3>
                <p className="text-gray-500 text-center">
                  {activeTab === 'all' 
                    ? 'У вас пока нет назначенных заданий'
                    : `Нет заданий в категории "${activeTab}"`
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div ref={scrollRef} className="grid gap-4 max-h-[600px] overflow-y-auto pr-2">
              {filteredAssignments.map((assignment) => {
                const assignmentProgress = getAssignmentProgress(assignment.id);
                const isAssignmentOverdue = isOverdue(assignment);
                
                return (
                  <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Icon 
                            name={getStatusIcon(assignmentProgress?.status || 'pending')} 
                            size={20} 
                            className={`${getProgressColor(assignmentProgress?.status || 'pending')} text-white rounded-full p-1`} 
                          />
                          <div>
                            <CardTitle className="flex items-center space-x-2">
                              <span>{assignment.title}</span>
                              {isAssignmentOverdue && (
                                <Badge variant="destructive" className="text-xs">
                                  Просрочено
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription>{assignment.description}</CardDescription>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(assignment.priority)}>
                            {assignment.priority === 'high' ? 'Высокий' : 
                             assignment.priority === 'medium' ? 'Средний' : 'Низкий'}
                          </Badge>
                          
                          {assignmentProgress?.status === 'pending' && (
                            <Button 
                              size="sm" 
                              onClick={() => startAssignment(assignment.id)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Icon name="Play" size={16} className="mr-1" />
                              Начать
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {/* Прогресс */}
                      {assignmentProgress && assignmentProgress.progress > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Прогресс выполнения</span>
                            <span>{assignmentProgress.progress}%</span>
                          </div>
                          <Progress value={assignmentProgress.progress} className="w-full" />
                        </div>
                      )}
                      
                      {/* Информация о сроках */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center space-x-1">
                            <Icon name="Calendar" size={14} />
                            <span>Создано: {formatDate(assignment.createdAt)}</span>
                          </span>
                          {assignment.dueDate && (
                            <span className="flex items-center space-x-1">
                              <Icon name="Clock" size={14} />
                              <span className={isAssignmentOverdue ? 'text-red-600 font-medium' : ''}>
                                До: {formatDate(assignment.dueDate)}
                              </span>
                            </span>
                          )}
                        </div>
                        
                        {assignmentProgress?.completedAt && (
                          <span className="flex items-center space-x-1 text-green-600">
                            <Icon name="CheckCircle" size={14} />
                            <span>Завершено: {formatDate(assignmentProgress.completedAt)}</span>
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <Accordion type="single" collapsible>
                        <AccordionItem value="details">
                          <AccordionTrigger className="text-sm">
                            Детали задания
                          </AccordionTrigger>
                          <AccordionContent className="space-y-4">
                            {/* Тесты */}
                            {assignment.testIds && assignment.testIds.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="font-medium flex items-center space-x-2">
                                  <Icon name="FileText" size={16} />
                                  <span>Тесты ({assignment.testIds.length})</span>
                                </h4>
                                <div className="space-y-2">
                                  {assignment.testIds.map((testId) => {
                                    const test = tests.find(t => t.id === testId);
                                    if (!test) return null;
                                    
                                    const testResult = assignmentProgress?.testResults?.find(tr => tr.testId === testId);
                                    
                                    return (
                                      <div key={testId} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex-1">
                                          <div className="font-medium">{test.title}</div>
                                          <div className="text-sm text-gray-500 flex items-center space-x-2">
                                            <Icon name="Clock" size={12} />
                                            <span>{test.timeLimit} мин</span>
                                            <span>•</span>
                                            <span>{test.questions.length} вопросов</span>
                                          </div>
                                        </div>
                                        
                                        <div className="flex items-center space-x-2">
                                          {testResult && testResult.completed && (
                                            <Badge variant="outline" className="text-green-600 border-green-200">
                                              <Icon name="CheckCircle" size={12} className="mr-1" />
                                              {testResult.score}%
                                            </Badge>
                                          )}
                                          
                                          <Button
                                            size="sm"
                                            variant={testResult?.completed ? "outline" : "default"}
                                            onClick={() => openTest(testId)}
                                          >
                                            {testResult?.completed ? 'Просмотреть' : 'Пройти тест'}
                                          </Button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                            
                            {/* Материалы */}
                            {assignment.materialIds && assignment.materialIds.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="font-medium flex items-center space-x-2">
                                  <Icon name="BookOpen" size={16} />
                                  <span>Материалы для изучения ({assignment.materialIds.length})</span>
                                </h4>
                                <div className="space-y-2">
                                  {assignment.materialIds.map((materialId) => {
                                    const material = materials.find(m => m.id === materialId);
                                    if (!material) return null;
                                    
                                    const materialProgress = assignmentProgress?.materialProgress?.find(mp => mp.materialId === materialId);
                                    
                                    return (
                                      <div key={materialId} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex-1">
                                          <div className="font-medium">{material.title}</div>
                                          <div className="text-sm text-gray-500 flex items-center space-x-2">
                                            <Icon name="Clock" size={12} />
                                            <span>{material.duration}</span>
                                            <span>•</span>
                                            <Icon name="Tag" size={12} />
                                            <span>{material.category}</span>
                                          </div>
                                        </div>
                                        
                                        <div className="flex items-center space-x-2">
                                          {materialProgress && materialProgress.viewed && (
                                            <Badge variant="outline" className="text-green-600 border-green-200">
                                              <Icon name="CheckCircle" size={12} className="mr-1" />
                                              Изучено
                                            </Badge>
                                          )}
                                          
                                          <Button
                                            size="sm"
                                            variant={materialProgress?.viewed ? "outline" : "default"}
                                            onClick={() => openMaterial(materialId, assignment.id)}
                                          >
                                            {materialProgress?.viewed ? 'Повторить' : 'Изучить'}
                                          </Button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyAssignments;