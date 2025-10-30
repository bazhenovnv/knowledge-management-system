import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

// Импорт созданных компонентов
import NotificationBasicInfo from './NotificationBasicInfo';
import NotificationRecipientFilters from './NotificationRecipientFilters';
import NotificationRecipientList from './NotificationRecipientList';
import { useNotificationForm } from './useNotificationForm';
import { NotificationFormProps } from './notificationFormTypes';

const NotificationForm: React.FC<NotificationFormProps> = ({
  isOpen,
  onClose,
  employees,
  selectedEmployee,
  currentUserRole
}) => {
  const {
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
    handleSubmit
  } = useNotificationForm({
    employees,
    selectedEmployee,
    currentUserRole,
    onClose
  });

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <Icon name="Bell" size={20} />
              <span>Отправить уведомление</span>
              {selectedEmployee && (
                <Badge variant="outline">
                  для {selectedEmployee.name}
                </Badge>
              )}
            </DialogTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8"
            >
              <Icon name="X" size={16} />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Основная информация уведомления */}
          <NotificationBasicInfo 
            formData={formData}
            setFormData={setFormData}
          />

          {/* Получатели - показываем только если нет предвыбранного сотрудника */}
          {!selectedEmployee && (
            <div className="space-y-4">
              {/* Фильтры получателей */}
              <NotificationRecipientFilters
                formData={formData}
                setFormData={setFormData}
                employees={employees}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedDepartments={selectedDepartments}
                selectedRoles={selectedRoles}
                selectedStatuses={selectedStatuses}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                quickFilters={quickFilters}
                isSelectAll={isSelectAll}
                filteredEmployees={filteredEmployees}
                handleSelectAll={handleSelectAll}
                handleSelectByDepartment={handleSelectByDepartment}
                handleSelectByRole={handleSelectByRole}
                toggleDepartmentFilter={toggleDepartmentFilter}
                toggleRoleFilter={toggleRoleFilter}
                toggleStatusFilter={toggleStatusFilter}
                toggleQuickFilter={toggleQuickFilter}
                clearAllFilters={clearAllFilters}
              />

              {/* Список получателей */}
              <NotificationRecipientList
                formData={formData}
                employees={employees}
                filteredEmployees={filteredEmployees}
                toggleEmployee={toggleEmployee}
              />
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleClose} className="border-[0.25px] border-black">
              <Icon name="X" size={16} className="mr-2" />
              Отмена
            </Button>
            <Button 
              type="submit" 
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-[0.25px] border-black"
            >
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