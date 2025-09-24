import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Employee } from '@/utils/database';
import { AssignmentFormData } from './assignmentFormTypes';

interface AssignmentEmployeeSelectorProps {
  formData: AssignmentFormData;
  employees: Employee[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedDepartments: string[];
  toggleEmployee: (employeeId: number) => void;
  handleSelectAllEmployees: () => void;
  toggleDepartmentFilter: (department: string) => void;
}

const AssignmentEmployeeSelector: React.FC<AssignmentEmployeeSelectorProps> = ({
  formData,
  employees,
  searchQuery,
  setSearchQuery,
  selectedDepartments,
  toggleEmployee,
  handleSelectAllEmployees,
  toggleDepartmentFilter
}) => {
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = !searchQuery || 
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = selectedDepartments.length === 0 || 
      selectedDepartments.includes(emp.department);
    
    return matchesSearch && matchesDepartment;
  });

  const departments = [...new Set(employees.map(emp => emp.department))].filter(Boolean);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Выберите сотрудников для назначения *</Label>
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSelectAllEmployees}
          >
            {filteredEmployees.every(emp => formData.assignees.includes(emp.id)) 
              ? 'Снять все' 
              : 'Выбрать всех'
            }
          </Button>
          <Badge variant="secondary">
            {formData.assignees.length} выбрано
          </Badge>
        </div>
      </div>

      {/* Фильтры по отделам */}
      <div className="space-y-2">
        <Label className="text-sm">Фильтр по отделам:</Label>
        <div className="flex flex-wrap gap-2">
          {departments.map(department => (
            <Button
              key={department}
              type="button"
              variant={selectedDepartments.includes(department) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleDepartmentFilter(department)}
              className="text-xs"
            >
              {department}
            </Button>
          ))}
        </div>
      </div>

      {/* Поиск */}
      <div className="relative">
        <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Поиск по имени, email или отделу..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Список сотрудников */}
      <div className="max-h-64 overflow-y-auto border rounded-md">
        {filteredEmployees.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Icon name="Users" size={24} className="mx-auto mb-2 opacity-50" />
            <p>Сотрудники не найдены</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredEmployees.map((employee) => (
              <div
                key={employee.id}
                className={`flex items-center space-x-3 p-3 rounded cursor-pointer hover:bg-gray-50 transition-colors ${
                  formData.assignees.includes(employee.id) 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'border border-transparent'
                }`}
                onClick={() => toggleEmployee(employee.id)}
              >
                <input
                  type="checkbox"
                  checked={formData.assignees.includes(employee.id)}
                  onChange={() => toggleEmployee(employee.id)}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{employee.name}</span>
                    {formData.assignees.includes(employee.id) && (
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentEmployeeSelector;