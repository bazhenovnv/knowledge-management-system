import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Employee, NotificationData, QuickFilters } from './notificationFormTypes';

interface NotificationRecipientFiltersProps {
  formData: NotificationData;
  setFormData: React.Dispatch<React.SetStateAction<NotificationData>>;
  employees: Employee[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedDepartments: string[];
  selectedRoles: string[];
  selectedStatuses: string[];
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  quickFilters: QuickFilters;
  isSelectAll: boolean;
  filteredEmployees: Employee[];
  handleSelectAll: () => void;
  handleSelectByDepartment: (department: string) => void;
  handleSelectByRole: (role: string) => void;
  toggleDepartmentFilter: (department: string) => void;
  toggleRoleFilter: (role: string) => void;
  toggleStatusFilter: (status: string) => void;
  toggleQuickFilter: (filterKey: keyof QuickFilters) => void;
  clearAllFilters: () => void;
}

const NotificationRecipientFilters: React.FC<NotificationRecipientFiltersProps> = ({
  formData,
  setFormData,
  employees,
  searchQuery,
  setSearchQuery,
  selectedDepartments,
  selectedRoles,
  selectedStatuses,
  showFilters,
  setShowFilters,
  quickFilters,
  isSelectAll,
  filteredEmployees,
  handleSelectAll,
  handleSelectByDepartment,
  handleSelectByRole,
  toggleDepartmentFilter,
  toggleRoleFilter,
  toggleStatusFilter,
  toggleQuickFilter,
  clearAllFilters
}) => {
  const departments = [...new Set(employees.map(emp => emp.department))].filter(Boolean);
  const roles = [...new Set(employees.map(emp => emp.position))].filter(Boolean);
  const statuses = [...new Set(employees.map(emp => emp.status || 'active'))].filter(Boolean);

  return (
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

      {/* Быстрые фильтры */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={quickFilters.adminsOnly ? "default" : "outline"}
            size="sm"
            onClick={() => toggleQuickFilter('adminsOnly')}
            className="text-xs"
          >
            <Icon name="Shield" size={12} className="mr-1" />
            Только админы
          </Button>
          <Button
            type="button"
            variant={quickFilters.teachersOnly ? "default" : "outline"}
            size="sm"
            onClick={() => toggleQuickFilter('teachersOnly')}
            className="text-xs"
          >
            <Icon name="BookOpen" size={12} className="mr-1" />
            Только преподаватели
          </Button>
          <Button
            type="button"
            variant={quickFilters.studentsOnly ? "default" : "outline"}
            size="sm"
            onClick={() => toggleQuickFilter('studentsOnly')}
            className="text-xs"
          >
            <Icon name="GraduationCap" size={12} className="mr-1" />
            Только студенты
          </Button>
          <Button
            type="button"
            variant={quickFilters.activeOnly ? "default" : "outline"}
            size="sm"
            onClick={() => toggleQuickFilter('activeOnly')}
            className="text-xs"
          >
            <Icon name="UserCheck" size={12} className="mr-1" />
            Только активные
          </Button>
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
      </div>

      {/* Фильтры */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
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

          {/* Фильтр по статусам */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Статусы:</Label>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {statuses.map(status => {
                const statusEmployees = employees.filter(emp => (emp.status || 'active') === status);
                const selectedInStatus = statusEmployees.filter(emp => formData.recipients.includes(emp.id)).length;
                const totalInStatus = statusEmployees.length;
                
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedStatuses.includes(status)}
                        onChange={() => toggleStatusFilter(status)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm capitalize">{status}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {selectedInStatus}/{totalInStatus}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => {
                          const statusIds = statusEmployees.map(emp => emp.id);
                          const allSelected = statusIds.every(id => formData.recipients.includes(id));
                          
                          if (allSelected) {
                            setFormData(prev => ({
                              ...prev,
                              recipients: prev.recipients.filter(id => !statusIds.includes(id))
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              recipients: [...new Set([...prev.recipients, ...statusIds])]
                            }));
                          }
                        }}
                      >
                        {selectedInStatus === totalInStatus ? 'Убрать' : 'Выбрать'}
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
    </div>
  );
};

export default NotificationRecipientFilters;