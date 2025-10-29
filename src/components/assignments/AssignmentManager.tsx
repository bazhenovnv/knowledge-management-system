import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import { database, Assignment, AssignmentProgress, Employee, Test, KnowledgeMaterial } from '@/utils/database';
import AssignmentForm from './AssignmentForm';
import { useScrollPosition } from '@/hooks/useScrollPosition';

interface AssignmentManagerProps {
  currentUserRole: 'admin' | 'teacher';
  currentUserId: string;
}

const AssignmentManager: React.FC<AssignmentManagerProps> = ({ currentUserRole, currentUserId }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [progress, setProgress] = useState<AssignmentProgress[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [materials, setMaterials] = useState<KnowledgeMaterial[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(() => {
    const saved = localStorage.getItem('assignmentStatusFilter');
    return saved || 'all';
  });
  const [priorityFilter, setPriorityFilter] = useState<string>(() => {
    const saved = localStorage.getItem('assignmentPriorityFilter');
    return saved || 'all';
  });
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  
  const { scrollRef, showIndicator } = useScrollPosition('assignmentsManager', assignments.length);

  useEffect(() => {
    loadData();
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem('assignmentStatusFilter', statusFilter);
  }, [statusFilter]);

  useEffect(() => {
    localStorage.setItem('assignmentPriorityFilter', priorityFilter);
  }, [priorityFilter]);

  const loadData = () => {
    const allAssignments = database.getAssignmentsByCreator(currentUserId);
    const allProgress = database.getAssignmentProgress();
    const allEmployees = database.getEmployees();
    const allTests = database.getTests();
    const allMaterials = database.getKnowledgeMaterials();
    
    setAssignments(allAssignments);
    setProgress(allProgress);
    setEmployees(allEmployees);
    setTests(allTests);
    setMaterials(allMaterials);
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = !searchQuery || 
      assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || assignment.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getAssignmentProgress = (assignmentId: string) => {
    return progress.filter(p => p.assignmentId === assignmentId);
  };

  const getAssigneeNames = (assigneeIds: number[]) => {
    return employees
      .filter(emp => assigneeIds.includes(emp.id))
      .map(emp => emp.name)
      .join(', ');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const updateAssignmentStatus = (assignmentId: string, newStatus: 'active' | 'completed' | 'cancelled') => {
    database.updateAssignment(assignmentId, { status: newStatus });
    loadData();
    toast.success('Статус задания обновлен');
  };

  const deleteAssignment = (assignmentId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить это задание?')) {
      database.deleteAssignment(assignmentId);
      loadData();
      toast.success('Задание удалено');
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCompletionStats = (assignmentId: string) => {
    const assignmentProgress = getAssignmentProgress(assignmentId);
    const total = assignmentProgress.length;
    const completed = assignmentProgress.filter(p => p.status === 'completed').length;
    const inProgress = assignmentProgress.filter(p => p.status === 'in_progress').length;
    const pending = assignmentProgress.filter(p => p.status === 'pending').length;
    
    return { total, completed, inProgress, pending };
  };

  const overallStats = {
    totalAssignments: assignments.length,
    activeAssignments: assignments.filter(a => a.status === 'active').length,
    completedAssignments: assignments.filter(a => a.status === 'completed').length,
    averageCompletion: assignments.length > 0 
      ? Math.round(assignments.reduce((sum, a) => sum + a.completionRate, 0) / assignments.length)
      : 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Управление заданиями</h2>
          <p className="text-gray-600">Создавайте и отслеживайте задания для сотрудников</p>
        </div>
        
        <Button 
          onClick={() => setShowAssignmentForm(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Icon name="Plus" size={16} className="mr-2" />
          Создать задание
        </Button>
      </div>

      {/* Общая статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Icon name="ClipboardList" size={24} className="text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{overallStats.totalAssignments}</div>
                <div className="text-sm text-gray-600">Всего заданий</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Icon name="PlayCircle" size={24} className="text-green-600" />
              <div>
                <div className="text-2xl font-bold">{overallStats.activeAssignments}</div>
                <div className="text-sm text-gray-600">Активных</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Icon name="CheckCircle" size={24} className="text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{overallStats.completedAssignments}</div>
                <div className="text-sm text-gray-600">Завершено</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Icon name="TrendingUp" size={24} className="text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{overallStats.averageCompletion}%</div>
                <div className="text-sm text-gray-600">Средний прогресс</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-64">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Поиск заданий..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-24"
          />
          {searchQuery && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 bg-white px-2">
              {filteredAssignments.length} результатов
            </div>
          )}
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="draft">Черновик</SelectItem>
            <SelectItem value="active">Активные</SelectItem>
            <SelectItem value="completed">Завершенные</SelectItem>
            <SelectItem value="cancelled">Отмененные</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Приоритет" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все приоритеты</SelectItem>
            <SelectItem value="low">Низкий</SelectItem>
            <SelectItem value="medium">Средний</SelectItem>
            <SelectItem value="high">Высокий</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Список заданий */}
      <div className="relative">
        {showIndicator && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-fade-in">
            <Icon name="ArrowDown" size={16} className="animate-bounce" />
            <span className="text-sm font-medium">Восстановление позиции...</span>
          </div>
        )}
      <div ref={scrollRef} className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {filteredAssignments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Icon name="ClipboardList" size={48} className="text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Нет заданий</h3>
              <p className="text-gray-500 text-center mb-4">
                Создайте первое задание для ваших сотрудников
              </p>
              <Button onClick={() => setShowAssignmentForm(true)}>
                <Icon name="Plus" size={16} className="mr-2" />
                Создать задание
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredAssignments.map((assignment) => {
            const stats = getCompletionStats(assignment.id);
            
            return (
              <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <CardTitle>{assignment.title}</CardTitle>
                        <Badge className={getPriorityColor(assignment.priority)}>
                          {assignment.priority === 'high' ? 'Высокий' : 
                           assignment.priority === 'medium' ? 'Средний' : 'Низкий'}
                        </Badge>
                        <Badge className={getStatusColor(assignment.status)}>
                          {assignment.status === 'active' ? 'Активно' :
                           assignment.status === 'completed' ? 'Завершено' :
                           assignment.status === 'cancelled' ? 'Отменено' : 'Черновик'}
                        </Badge>
                      </div>
                      <CardDescription>{assignment.description}</CardDescription>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Select
                        value={assignment.status}
                        onValueChange={(value: 'active' | 'completed' | 'cancelled') => 
                          updateAssignmentStatus(assignment.id, value)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Активно</SelectItem>
                          <SelectItem value="completed">Завершено</SelectItem>
                          <SelectItem value="cancelled">Отменено</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteAssignment(assignment.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </div>

                  {/* Прогресс выполнения */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Общий прогресс</span>
                      <span>{assignment.completionRate}%</span>
                    </div>
                    <Progress value={assignment.completionRate} className="w-full" />
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Статистика выполнения */}
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-600">{stats.total}</div>
                      <div className="text-xs text-gray-500">Назначено</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">{stats.completed}</div>
                      <div className="text-xs text-gray-500">Завершено</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-yellow-600">{stats.inProgress}</div>
                      <div className="text-xs text-gray-500">В процессе</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-600">{stats.pending}</div>
                      <div className="text-xs text-gray-500">Ожидает</div>
                    </div>
                  </div>

                  {/* Информация о задании */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Назначено сотрудникам:</div>
                      <div className="font-medium">{getAssigneeNames(assignment.assignees)}</div>
                    </div>
                    
                    <div>
                      <div className="text-gray-600">Содержимое:</div>
                      <div className="flex items-center space-x-4">
                        {assignment.testIds && assignment.testIds.length > 0 && (
                          <span className="flex items-center space-x-1">
                            <Icon name="FileText" size={14} />
                            <span>{assignment.testIds.length} тест(ов)</span>
                          </span>
                        )}
                        {assignment.materialIds && assignment.materialIds.length > 0 && (
                          <span className="flex items-center space-x-1">
                            <Icon name="BookOpen" size={14} />
                            <span>{assignment.materialIds.length} материал(ов)</span>
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-gray-600">Создано:</div>
                      <div>{formatDate(assignment.createdAt)}</div>
                    </div>
                    
                    {assignment.dueDate && (
                      <div>
                        <div className="text-gray-600">Срок выполнения:</div>
                        <div className={new Date(assignment.dueDate) < new Date() ? 'text-red-600 font-medium' : ''}>
                          {formatDate(assignment.dueDate)}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
      </div>

      {/* Форма создания задания */}
      <AssignmentForm
        isOpen={showAssignmentForm}
        onClose={() => {
          setShowAssignmentForm(false);
          setSelectedAssignment(null);
          loadData();
        }}
        employees={employees}
        tests={tests}
        materials={materials}
        currentUserRole={currentUserRole}
        currentUserId={currentUserId}
      />
    </div>
  );
};

export default AssignmentManager;