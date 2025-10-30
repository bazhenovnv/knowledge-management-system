import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import NotificationForm from '@/components/notifications/NotificationForm';
import EmployeeStats from './EmployeeStats';
import EmployeeFilters from './EmployeeFilters';
import BulkActionsBar from './BulkActionsBar';
import EmployeeTable from './EmployeeTable';
import EmployeeForm from './EmployeeForm';
import BulkActionsDialog from './BulkActionsDialog';
import { useEmployeeManagement } from './useEmployeeManagement';
import { AdvancedEmployeeManagementProps } from './types';
import { databaseService, DatabaseEmployee } from '@/utils/databaseService';

const AdvancedEmployeeManagement: React.FC<AdvancedEmployeeManagementProps> = ({
  employees,
  onUpdateEmployees
}) => {
  const {
    // State
    searchQuery, setSearchQuery,
    selectedDepartment, setSelectedDepartment,
    selectedRole, setSelectedRole,
    selectedStatus, setSelectedStatus,
    sortBy, setSortBy,
    sortOrder, setSortOrder,
    formData, setFormData,
    selectedEmployees, setSelectedEmployees,
    editingEmployee, setEditingEmployee,
    deletingEmployee, setDeletingEmployee,
    selectedEmployeeForNotification, setSelectedEmployeeForNotification,
    bulkAction, setBulkAction,
    bulkValue, setBulkValue,
    stats,
    filteredAndSortedEmployees,

    // Dialogs
    isAddDialogOpen, setIsAddDialogOpen,
    isEditDialogOpen, setIsEditDialogOpen,
    isBulkEditOpen, setIsBulkEditOpen,
    isDeleteDialogOpen, setIsDeleteDialogOpen,
    isNotificationFormOpen, setIsNotificationFormOpen,

    // Actions
    handleAddEmployee,
    handleEditEmployee,
    handleSaveEdit,
    handleDeleteEmployee,
    handleSelectAll,
    handleBulkAction,
    exportToExcel
  } = useEmployeeManagement({ employees, onUpdateEmployees });

  const handleSelectEmployee = (employeeId: number, checked: boolean) => {
    if (checked) {
      setSelectedEmployees([...selectedEmployees, employeeId]);
    } else {
      setSelectedEmployees(selectedEmployees.filter(id => id !== employeeId));
    }
  };

  const handleNotifyEmployee = (employee: any) => {
    setSelectedEmployeeForNotification(employee);
    setIsNotificationFormOpen(true);
  };

  const handleDeleteEmployeeClick = (employee: any) => {
    setDeletingEmployee(employee);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и основные действия */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Управление сотрудниками</h2>
          <p className="text-gray-600">Всего сотрудников: {stats.total}</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-[0.25px] border-black"
          >
            <Icon name="UserPlus" size={16} />
            <span>Добавить сотрудника</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsNotificationFormOpen(true)}
            className="flex items-center space-x-2 border-[0.25px] border-black"
          >
            <Icon name="Bell" size={16} />
            <span>Уведомить всех</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => exportToExcel(employees, 'all_employees')}
            className="flex items-center space-x-2 border-[0.25px] border-black"
          >
            <Icon name="Download" size={16} />
            <span>Экспорт</span>
          </Button>
        </div>
      </div>

      {/* Статистика */}
      <EmployeeStats 
        stats={stats} 
        selectedEmployeesCount={selectedEmployees.length}
      />

      {/* Фильтры и поиск */}
      <EmployeeFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        stats={stats}
      />

      {/* Панель массовых действий */}
      <BulkActionsBar
        selectedEmployeesCount={selectedEmployees.length}
        onBulkEdit={() => setIsBulkEditOpen(true)}
        onClearSelection={() => setSelectedEmployees([])}
      />

      {/* Таблица сотрудников */}
      <EmployeeTable
        employees={filteredAndSortedEmployees}
        selectedEmployees={selectedEmployees}
        onSelectEmployee={handleSelectEmployee}
        onSelectAll={handleSelectAll}
        onEditEmployee={handleEditEmployee}
        onDeleteEmployee={handleDeleteEmployeeClick}
        onNotifyEmployee={handleNotifyEmployee}
      />

      {/* Форма добавления сотрудника */}
      <EmployeeForm
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        title="Добавить нового сотрудника"
        formData={formData}
        setFormData={setFormData}
        onSave={handleAddEmployee}
        isEditing={false}
      />

      {/* Форма редактирования сотрудника */}
      <EmployeeForm
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Редактировать сотрудника"
        formData={formData}
        setFormData={setFormData}
        onSave={handleSaveEdit}
        isEditing={true}
      />

      {/* Диалог массовых действий */}
      <BulkActionsDialog
        isOpen={isBulkEditOpen}
        onOpenChange={setIsBulkEditOpen}
        bulkAction={bulkAction}
        setBulkAction={setBulkAction}
        bulkValue={bulkValue}
        setBulkValue={setBulkValue}
        selectedEmployeesCount={selectedEmployees.length}
        onApplyBulkAction={handleBulkAction}
      />

      {/* Диалог удаления */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить сотрудника <strong>{deletingEmployee?.name}</strong>? 
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEmployee} className="bg-red-600 hover:bg-red-700">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Форма уведомлений */}
      <NotificationForm
        isOpen={isNotificationFormOpen}
        onClose={() => {
          setIsNotificationFormOpen(false);
          setSelectedEmployeeForNotification(null);
        }}
        employees={employees}
        selectedEmployee={selectedEmployeeForNotification}
        currentUserRole="admin"
      />
    </div>
  );
};

export default AdvancedEmployeeManagement;