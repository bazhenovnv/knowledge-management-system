import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Icon from "@/components/ui/icon";

interface EmployeeTabFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  departmentFilter: string;
  setDepartmentFilter: (filter: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  departments: string[];
  filteredCount?: number;
}

const EmployeeTabFilters: React.FC<EmployeeTabFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  departmentFilter,
  setDepartmentFilter,
  statusFilter,
  setStatusFilter,
  departments,
  filteredCount
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Icon
          name="Search"
          size={20}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        />
        <Input
          placeholder="Поиск по имени, отделу, должности..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-24"
        />
        {searchQuery && filteredCount !== undefined && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 bg-white px-2">
            {filteredCount} результатов
          </div>
        )}
      </div>
      
      <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Все отделы" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все отделы</SelectItem>
          {departments.map(dept => (
            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Все статусы" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все статусы</SelectItem>
          <SelectItem value="1">Статус 1 (Критический)</SelectItem>
          <SelectItem value="2">Статус 2 (Низкий)</SelectItem>
          <SelectItem value="3">Статус 3 (Средний)</SelectItem>
          <SelectItem value="4">Статус 4 (Хороший)</SelectItem>
          <SelectItem value="5">Статус 5 (Отличный)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default EmployeeTabFilters;