import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import Icon from '@/components/ui/icon';
import { bitrix24Service, Bitrix24Task, TASK_STATUSES, TASK_PRIORITIES } from '@/services/bitrix24';

interface TaskListProps {
  refreshTrigger?: number;
  onTaskSelect?: (task: Bitrix24Task) => void;
}

export function TaskList({ refreshTrigger, onTaskSelect }: TaskListProps) {
  const [tasks, setTasks] = useState<Bitrix24Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const taskList = await bitrix24Service.getTasks({
        select: ['ID', 'TITLE', 'DESCRIPTION', 'STATUS', 'PRIORITY', 'RESPONSIBLE_ID', 'CREATED_DATE', 'DEADLINE'],
        filter: { '!STATUS': 5 } // Исключаем завершенные задачи
      });
      
      setTasks(taskList || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки задач';
      setError(errorMessage);
      toast({
        title: 'Ошибка',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [refreshTrigger]);

  const getStatusBadge = (status: number) => {
    const statusText = TASK_STATUSES[status as keyof typeof TASK_STATUSES] || 'Неизвестно';
    const variant = status === 5 ? 'default' : status === 3 ? 'destructive' : 'secondary';
    
    return (
      <Badge variant={variant} className="text-xs">
        {statusText}
      </Badge>
    );
  };

  const getPriorityIcon = (priority: number) => {
    if (priority === 3) return <Icon name="AlertTriangle" size={16} className="text-red-500" />;
    if (priority === 2) return <Icon name="Minus" size={16} className="text-yellow-500" />;
    return <Icon name="ArrowDown" size={16} className="text-green-500" />;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const handleTaskClick = (task: Bitrix24Task) => {
    if (onTaskSelect) {
      onTaskSelect(task);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Icon name="AlertCircle" size={48} className="text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadTasks} variant="outline">
              <Icon name="RefreshCw" size={16} className="mr-2" />
              Повторить попытку
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon name="CheckSquare" size={24} className="text-blue-600" />
          <h2 className="text-2xl font-bold">Задачи Битрикс24</h2>
          <Badge variant="outline">{tasks.length}</Badge>
        </div>
        <Button onClick={loadTasks} variant="outline" size="sm">
          <Icon name="RefreshCw" size={16} className="mr-2" />
          Обновить
        </Button>
      </div>

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Icon name="CheckSquare" size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Активных задач не найдено</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <Card 
              key={task.ID} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleTaskClick(task)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1 line-clamp-2">
                      {task.TITLE || 'Без названия'}
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-2 text-sm">
                      <span>ID: {task.ID}</span>
                      {task.RESPONSIBLE_ID && (
                        <>
                          <span>•</span>
                          <span>Ответственный: {task.RESPONSIBLE_ID}</span>
                        </>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {getPriorityIcon(task.PRIORITY)}
                    {getStatusBadge(task.STATUS)}
                  </div>
                </div>
              </CardHeader>
              
              {(task.DESCRIPTION || task.DEADLINE || task.CREATED_DATE) && (
                <CardContent className="pt-0">
                  {task.DESCRIPTION && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {task.DESCRIPTION}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    {task.CREATED_DATE && (
                      <div className="flex items-center space-x-1">
                        <Icon name="Calendar" size={12} />
                        <span>Создана: {formatDate(task.CREATED_DATE)}</span>
                      </div>
                    )}
                    
                    {task.DEADLINE && (
                      <div className="flex items-center space-x-1">
                        <Icon name="Clock" size={12} />
                        <span>Срок: {formatDate(task.DEADLINE)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default TaskList;