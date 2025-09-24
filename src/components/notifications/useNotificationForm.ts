import { useState } from 'react';
import { toast } from 'sonner';
import { database } from '@/utils/database';
import { 
  Employee, 
  NotificationData, 
  QuickFilters, 
  NotificationTemplate 
} from './notificationFormTypes';

interface UseNotificationFormProps {
  employees: Employee[];
  selectedEmployee?: Employee | null;
  currentUserRole: 'admin' | 'teacher';
  onClose: () => void;
}

export const useNotificationForm = ({
  employees,
  selectedEmployee,
  currentUserRole,
  onClose
}: UseNotificationFormProps) => {
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
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [quickFilters, setQuickFilters] = useState<QuickFilters>({
    adminsOnly: false,
    teachersOnly: false,
    activeOnly: false,
    studentsOnly: false
  });

  // Шаблоны уведомлений
  const notificationTemplates: NotificationTemplate[] = [
    {
      id: 'meeting',
      title: 'Приглашение на собрание',
      message: 'Уважаемые коллеги! Приглашаем вас на собрание, которое состоится [дата] в [время]. Тема: [тема собрания]. Просьба подтвердить участие.',
      type: 'reminder',
      priority: 'medium'
    },
    {
      id: 'deadline',
      title: 'Напоминание о дедлайне',
      message: 'Напоминаем, что срок выполнения задачи "[название задачи]" истекает [дата]. Пожалуйста, завершите работу в указанные сроки.',
      type: 'warning',
      priority: 'high'
    },
    {
      id: 'test_available',
      title: 'Новый тест доступен',
      message: 'Для вас доступен новый тест: "[название теста]". Пройдите тестирование до [дата]. Время выполнения: [время] минут.',
      type: 'info',
      priority: 'medium'
    },
    {
      id: 'system_update',
      title: 'Обновление системы',
      message: 'Уведомляем о плановом обновлении системы [дата] с [время] по [время]. В это время доступ к системе будет ограничен.',
      type: 'info',
      priority: 'low'
    },
    {
      id: 'urgent',
      title: 'Срочное уведомление',
      message: '[Срочное сообщение]. Просьба принять к сведению и при необходимости связаться с администрацией.',
      type: 'urgent',
      priority: 'high'
    }
  ];

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
    setSelectedStatuses([]);
    setShowFilters(false);
    setQuickFilters({
      adminsOnly: false,
      teachersOnly: false,
      activeOnly: false,
      studentsOnly: false
    });
    onClose();
  };

  // Фильтрация сотрудников
  const filteredEmployees = (employees || []).filter(emp => {
    const matchesSearch = !searchQuery || 
      emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = selectedDepartments.length === 0 || 
      selectedDepartments.includes(emp.department);
    
    const matchesRole = selectedRoles.length === 0 || 
      selectedRoles.includes(emp.position);
    
    const matchesStatus = selectedStatuses.length === 0 || 
      selectedStatuses.includes(emp.status || 'active');
    
    const matchesQuickFilters = 
      (!quickFilters.adminsOnly || emp.role === 'admin') &&
      (!quickFilters.teachersOnly || emp.role === 'teacher') &&
      (!quickFilters.studentsOnly || emp.role === 'student') &&
      (!quickFilters.activeOnly || emp.status === 'active');
    
    return matchesSearch && matchesDepartment && matchesRole && matchesStatus && matchesQuickFilters;
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
    const departmentEmployees = (employees || []).filter(emp => emp.department === department);
    const departmentIds = departmentEmployees.map(emp => emp.id);
    const allSelected = departmentIds.every(id => formData.recipients.includes(id));
    
    if (allSelected) {
      setFormData(prev => ({
        ...prev,
        recipients: prev.recipients.filter(id => !departmentIds.includes(id))
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        recipients: [...new Set([...prev.recipients, ...departmentIds])]
      }));
    }
  };

  // Выбрать сотрудников по роли
  const handleSelectByRole = (role: string) => {
    const roleEmployees = (employees || []).filter(emp => emp.position === role);
    const roleIds = roleEmployees.map(emp => emp.id);
    const allSelected = roleIds.every(id => formData.recipients.includes(id));
    
    if (allSelected) {
      setFormData(prev => ({
        ...prev,
        recipients: prev.recipients.filter(id => !roleIds.includes(id))
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        recipients: [...new Set([...prev.recipients, ...roleIds])]
      }));
    }
  };

  // Переключение фильтров
  const toggleDepartmentFilter = (department: string) => {
    setSelectedDepartments(prev => 
      prev.includes(department) 
        ? prev.filter(d => d !== department)
        : [...prev, department]
    );
  };

  const toggleRoleFilter = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const toggleStatusFilter = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const toggleQuickFilter = (filterKey: keyof QuickFilters) => {
    setQuickFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey]
    }));
  };

  // Очистить все фильтры
  const clearAllFilters = () => {
    setSelectedDepartments([]);
    setSelectedRoles([]);
    setSelectedStatuses([]);
    setSearchQuery('');
    setQuickFilters({
      adminsOnly: false,
      teachersOnly: false,
      activeOnly: false,
      studentsOnly: false
    });
  };

  // Применение шаблона
  const applyTemplate = (template: NotificationTemplate) => {
    setFormData(prev => ({
      ...prev,
      title: template.title,
      message: template.message,
      type: template.type,
      priority: template.priority
    }));
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

      if (createdNotification.status === 'sent') {
        formData.recipients.forEach(recipientId => {
          database.markNotificationAsDelivered(createdNotification.id, recipientId);
        });
      }

      const recipientNames = (employees || [])
        .filter(emp => formData.recipients.includes(emp.id))
        .map(emp => emp.full_name)
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

  return {
    formData,
    setFormData,
    isSelectAll,
    searchQuery,
    setSearchQuery,
    selectedDepartments,
    selectedRoles,
    selectedStatuses,
    showFilters,
    setShowFilters,
    quickFilters,
    filteredEmployees,
    notificationTemplates,
    handleClose,
    toggleEmployee,
    handleSelectAll,
    handleSelectByDepartment,
    handleSelectByRole,
    toggleDepartmentFilter,
    toggleRoleFilter,
    toggleStatusFilter,
    toggleQuickFilter,
    clearAllFilters,
    applyTemplate,
    handleSubmit
  };
};