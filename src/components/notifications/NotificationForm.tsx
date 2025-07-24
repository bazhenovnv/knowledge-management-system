import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import { database } from '@/utils/database';

interface Employee {
  id: number;
  name: string;
  email: string;
  position: string;
  department: string;
}

interface NotificationFormProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  selectedEmployee?: Employee | null;
  currentUserRole: 'admin' | 'teacher';
}

interface NotificationData {
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  type: 'info' | 'warning' | 'urgent' | 'reminder';
  recipients: number[];
  scheduledFor?: string;
}

const NotificationForm: React.FC<NotificationFormProps> = ({
  isOpen,
  onClose,
  employees,
  selectedEmployee,
  currentUserRole
}) => {
  const [formData, setFormData] = useState<NotificationData>({
    title: '',
    message: '',
    priority: 'medium',
    type: 'info',
    recipients: selectedEmployee ? [selectedEmployee.id] : [],
    scheduledFor: ''
  });

  const [isSelectAll, setIsSelectAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Сброс формы при закрытии
  const handleClose = () => {
    setFormData({
      title: '',
      message: '',
      priority: 'medium',
      type: 'info',
      recipients: selectedEmployee ? [selectedEmployee.id] : [],
      scheduledFor: ''
    });
    setIsSelectAll(false);
    setSearchQuery('');
    setSelectedDepartments([]);
    setSelectedRoles([]);
    setShowFilters(false);
    onClose();
  };

  // Получение уникальных отделов и ролей
  const departments = [...new Set(employees.map(emp => emp.department))].filter(Boolean);
  const roles = [...new Set(employees.map(emp => emp.position))].filter(Boolean);

  // Фильтрация сотрудников по поиску, отделам и ролям
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = !searchQuery || 
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = selectedDepartments.length === 0 || 
      selectedDepartments.includes(emp.department);
    
    const matchesRole = selectedRoles.length === 0 || 
      selectedRoles.includes(emp.position);
    
    return matchesSearch && matchesDepartment && matchesRole;
  });

  // Выбор/снятие выбора сотрудника
  const toggleEmployee = (employeeId: number) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.includes(employeeId)
        ? prev.recipients.filter(id => id !== employeeId)
        : [...prev.recipients, employeeId]
    }));
  };

  // Выбрать всех / снять выбор со всех
  const handleSelectAll = () => {
    if (isSelectAll) {
      setFormData(prev => ({ ...prev, recipients: [] }));
    } else {
      setFormData(prev => ({ ...prev, recipients: filteredEmployees.map(emp => emp.id) }));
    }
    setIsSelectAll(!isSelectAll);
  };

  // Выбрать сотрудников по отделу
  const handleSelectByDepartment = (department: string) => {
    const departmentEmployees = employees.filter(emp => emp.department === department);
    const departmentIds = departmentEmployees.map(emp => emp.id);
    const allSelected = departmentIds.every(id => formData.recipients.includes(id));
    
    if (allSelected) {
      // Убираем всех из отдела
      setFormData(prev => ({
        ...prev,
        recipients: prev.recipients.filter(id => !departmentIds.includes(id))
      }));
    } else {
      // Добавляем всех из отдела
      setFormData(prev => ({
        ...prev,
        recipients: [...new Set([...prev.recipients, ...departmentIds])]
      }));
    }
  };

  // Выбрать сотрудников по роли
  const handleSelectByRole = (role: string) => {
    const roleEmployees = employees.filter(emp => emp.position === role);
    const roleIds = roleEmployees.map(emp => emp.id);
    const allSelected = roleIds.every(id => formData.recipients.includes(id));
    
    if (allSelected) {
      // Убираем всех с этой ролью
      setFormData(prev => ({
        ...prev,
        recipients: prev.recipients.filter(id => !roleIds.includes(id))
      }));
    } else {
      // Добавляем всех с этой ролью
      setFormData(prev => ({
        ...prev,
        recipients: [...new Set([...prev.recipients, ...roleIds])]
      }));
    }
  };

  // Переключение фильтра отдела
  const toggleDepartmentFilter = (department: string) => {
    setSelectedDepartments(prev => 
      prev.includes(department) 
        ? prev.filter(d => d !== department)
        : [...prev, department]
    );
  };

  // Переключение фильтра роли
  const toggleRoleFilter = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  // Очистить все фильтры
  const clearAllFilters = () => {
    setSelectedDepartments([]);
    setSelectedRoles([]);
    setSearchQuery('');
  };

  // Получение цвета приоритета
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Получение цвета типа уведомления
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'bg-red-600';
      case 'warning': return 'bg-orange-500';
      case 'reminder': return 'bg-blue-500';
      case 'info': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  // Отправка уведомления
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Введите заголовок уведомления');
      return;
    }
    
    if (!formData.message.trim()) {
      toast.error('Введите текст уведомления');
      return;
    }
    
    if (formData.recipients.length === 0) {
      toast.error('Выберите получателей');
      return;
    }

    try {
      // Создаем уведомление через базу данных
      const notificationData = {
        title: formData.title,
        message: formData.message,
        priority: formData.priority,
        type: formData.type,
        recipients: formData.recipients,
        createdBy: `${currentUserRole}_user`,
        createdByRole: currentUserRole,
        scheduledFor: formData.scheduledFor ? new Date(formData.scheduledFor) : undefined,
        status: formData.scheduledFor ? 'scheduled' as const : 'sent' as const
      };

      const createdNotification = database.createNotification(notificationData);

      // Отмечаем уведомление как доставленное всем получателям
      if (createdNotification.status === 'sent') {
        formData.recipients.forEach(recipientId => {
          database.markNotificationAsDelivered(createdNotification.id, recipientId);
        });
      }

      const recipientNames = employees
        .filter(emp => formData.recipients.includes(emp.id))
        .map(emp => emp.name)
        .join(', ');

      if (formData.scheduledFor) {
        const scheduleDate = new Date(formData.scheduledFor).toLocaleString('ru-RU');
        toast.success(`Уведомление запланировано на ${scheduleDate} для: ${recipientNames}`);
      } else {
        toast.success(`Уведомление отправлено: ${recipientNames}`);
      }
      
      handleClose();
    } catch (error) {
      toast.error('Ошибка при отправке уведомления');
      console.error('Ошибка отправки:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Icon name="Bell" size={20} />
            <span>Отправить уведомление</span>
            {selectedEmployee && (
              <Badge variant="outline">
                для {selectedEmployee.name}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Заголовок */}
          <div className="space-y-2">
            <Label htmlFor="title">Заголовок уведомления *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Введите заголовок..."
              required
            />
          </div>

          {/* Сообщение */}
          <div className="space-y-2">
            <Label htmlFor="message">Текст уведомления *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Введите текст уведомления..."
              rows={4}
              required
            />
          </div>

          {/* Приоритет и тип */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Приоритет</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: 'low' | 'medium' | 'high') => 
                  setFormData(prev => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor('low')}`}></div>
                      <span>Низкий</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor('medium')}`}></div>
                      <span>Средний</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor('high')}`}></div>
                      <span>Высокий</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Тип уведомления</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'info' | 'warning' | 'urgent' | 'reminder') => 
                  setFormData(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">
                    <div className="flex items-center space-x-2">
                      <Icon name="Info" size={16} />
                      <span>Информация</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="warning">
                    <div className="flex items-center space-x-2">
                      <Icon name="AlertTriangle" size={16} />
                      <span>Предупреждение</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="urgent">
                    <div className="flex items-center space-x-2">
                      <Icon name="AlertCircle" size={16} />
                      <span>Срочно</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="reminder">
                    <div className="flex items-center space-x-2">
                      <Icon name="Clock" size={16} />
                      <span>Напоминание</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Отложенная отправка */}
          <div className="space-y-2">
            <Label htmlFor="scheduledFor">Отложенная отправка (необязательно)</Label>
            <Input
              id="scheduledFor"
              type="datetime-local"
              value={formData.scheduledFor}
              onChange={(e) => setFormData(prev => ({ ...prev, scheduledFor: e.target.value }))}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          {/* Получатели */}
          {!selectedEmployee && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Получатели *</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Icon name="Filter" size={16} className="mr-1" />
                    Фильтры
                  </Button>
                  <Badge variant="secondary">
                    {formData.recipients.length} выбрано
                  </Badge>
                </div>
              </div>

              {/* Быстрые действия */}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {isSelectAll ? '❌ Снять все' : '✅ Выбрать всех'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                >
                  <Icon name="RotateCcw" size={14} className="mr-1" />
                  Сбросить фильтры
                </Button>
              </div>

              {/* Фильтры */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  {/* Фильтр по отделам */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Отделы:</Label>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {departments.map(department => {
                        const departmentEmployees = employees.filter(emp => emp.department === department);
                        const selectedInDept = departmentEmployees.filter(emp => formData.recipients.includes(emp.id)).length;
                        const totalInDept = departmentEmployees.length;
                        
                        return (
                          <div key={department} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={selectedDepartments.includes(department)}
                                onChange={() => toggleDepartmentFilter(department)}
                                className="w-4 h-4"
                              />
                              <span className="text-sm">{department}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {selectedInDept}/{totalInDept}
                              </Badge>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => handleSelectByDepartment(department)}
                              >
                                {selectedInDept === totalInDept ? 'Убрать' : 'Выбрать'}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Фильтр по ролям */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Роли:</Label>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {roles.map(role => {
                        const roleEmployees = employees.filter(emp => emp.position === role);
                        const selectedInRole = roleEmployees.filter(emp => formData.recipients.includes(emp.id)).length;
                        const totalInRole = roleEmployees.length;
                        
                        return (
                          <div key={role} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={selectedRoles.includes(role)}
                                onChange={() => toggleRoleFilter(role)}
                                className="w-4 h-4"
                              />
                              <span className="text-sm">{role}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {selectedInRole}/{totalInRole}
                              </Badge>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => handleSelectByRole(role)}
                              >
                                {selectedInRole === totalInRole ? 'Убрать' : 'Выбрать'}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Поиск получателей */}
              <div className="relative">
                <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Поиск по имени, email, отделу или должности..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Статистика поиска */}
              {(searchQuery || selectedDepartments.length > 0 || selectedRoles.length > 0) && (
                <div className="flex items-center justify-between text-sm text-gray-600 bg-blue-50 p-2 rounded">
                  <span>Найдено: {filteredEmployees.length} сотрудников</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => {
                      const filteredIds = filteredEmployees.map(emp => emp.id);
                      const allFilteredSelected = filteredIds.every(id => formData.recipients.includes(id));
                      
                      if (allFilteredSelected) {
                        setFormData(prev => ({
                          ...prev,
                          recipients: prev.recipients.filter(id => !filteredIds.includes(id))
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          recipients: [...new Set([...prev.recipients, ...filteredIds])]
                        }));
                      }
                    }}
                  >
                    {filteredEmployees.every(emp => formData.recipients.includes(emp.id)) 
                      ? 'Убрать найденных' 
                      : 'Выбрать найденных'
                    }
                  </Button>
                </div>
              )}

              {/* Список получателей */}
              <div className="max-h-48 overflow-y-auto border rounded-md">
                {filteredEmployees.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <Icon name="Users" size={24} className="mx-auto mb-2 opacity-50" />
                    <p>Сотрудники не найдены</p>
                    <p className="text-xs">Попробуйте изменить параметры поиска</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {filteredEmployees.map((employee) => (
                      <div
                        key={employee.id}
                        className={`flex items-center space-x-3 p-3 rounded cursor-pointer hover:bg-gray-50 transition-colors ${
                          formData.recipients.includes(employee.id) 
                            ? 'bg-blue-50 border border-blue-200 shadow-sm' 
                            : 'border border-transparent'
                        }`}
                        onClick={() => toggleEmployee(employee.id)}
                      >
                        <input
                          type="checkbox"
                          checked={formData.recipients.includes(employee.id)}
                          onChange={() => toggleEmployee(employee.id)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{employee.name}</span>
                            {formData.recipients.includes(employee.id) && (
                              <Icon name="Check" size={14} className="text-blue-600" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center space-x-2">
                            <Icon name="Briefcase" size={12} />
                            <span>{employee.position}</span>
                            <span>•</span>
                            <Icon name="Building2" size={12} />
                            <span>{employee.department}</span>
                          </div>
                          <div className="text-xs text-gray-400 flex items-center space-x-1">
                            <Icon name="Mail" size={10} />
                            <span>{employee.email}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Выбранные получатели */}
              {formData.recipients.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Выбранные получатели ({formData.recipients.length}):</Label>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-2 bg-gray-50 rounded">
                    {employees
                      .filter(emp => formData.recipients.includes(emp.id))
                      .map(employee => (
                        <Badge 
                          key={employee.id} 
                          variant="secondary" 
                          className="flex items-center space-x-1 cursor-pointer hover:bg-red-100"
                          onClick={() => toggleEmployee(employee.id)}
                        >
                          <span>{employee.name}</span>
                          <Icon name="X" size={12} />
                        </Badge>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Отмена
            </Button>
            <Button type="submit" className="flex items-center space-x-2">
              <Icon name="Send" size={16} />
              <span>
                {formData.scheduledFor ? 'Запланировать' : 'Отправить'}
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationForm;