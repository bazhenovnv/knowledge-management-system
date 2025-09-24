import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { getStatusText } from '@/utils/statusUtils';
import { EmployeeStats, SortField, SortOrder } from './types';

interface EmployeeFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedDepartment: string;
  setSelectedDepartment: (dept: string) => void;
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  sortBy: SortField;
  setSortBy: (field: SortField) => void;
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
  stats: EmployeeStats;
}

const EmployeeFilters: React.FC<EmployeeFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  selectedDepartment,
  setSelectedDepartment,
  selectedRole,
  setSelectedRole,
  selectedStatus,
  setSelectedStatus,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  stats
}) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label>Поиск</Label>
            <div className="relative">
              <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Поиск сотрудников..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Отдел</Label>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все отделы</SelectItem>
                {Object.keys(stats.byDepartment).map(dept => (
                  <SelectItem key={dept} value={dept}>
                    {dept} ({stats.byDepartment[dept]})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Роль</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все роли</SelectItem>
                <SelectItem value="admin">Администратор ({stats.byRole.admin || 0})</SelectItem>
                <SelectItem value="teacher">Преподаватель ({stats.byRole.teacher || 0})</SelectItem>
                <SelectItem value="employee">Сотрудник ({stats.byRole.employee || 0})</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Статус</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                {[1, 2, 3, 4, 5].map(status => (
                  <SelectItem key={status} value={status.toString()}>
                    {getStatusText(status)} ({stats.byStatus[status.toString()] || 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Сортировка</Label>
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const parts = value ? value.split('-') : ['name', 'asc'];
              const [field, order] = parts;
              setSortBy((field || 'name') as SortField);
              setSortOrder((order || 'asc') as SortOrder);
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Имя (А-Я)</SelectItem>
                <SelectItem value="name-desc">Имя (Я-А)</SelectItem>
                <SelectItem value="department-asc">Отдел (А-Я)</SelectItem>
                <SelectItem value="createdAt-desc">Дата создания (новые)</SelectItem>
                <SelectItem value="createdAt-asc">Дата создания (старые)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeFilters;