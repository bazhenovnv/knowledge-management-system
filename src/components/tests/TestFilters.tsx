import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEPARTMENTS } from "@/constants/departments";

interface TestFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filter: string;
  setFilter: (value: string) => void;
  departmentFilter: string;
  setDepartmentFilter: (value: string) => void;
}

export const TestFilters: React.FC<TestFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filter,
  setFilter,
  departmentFilter,
  setDepartmentFilter
}) => {
  return (
    <div className="flex space-x-4 items-center flex-wrap">
      <Input
        placeholder="Поиск тестов..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
      <Select value={filter} onValueChange={setFilter}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Фильтр по статусу" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все тесты</SelectItem>
          <SelectItem value="published">Опубликованные</SelectItem>
          <SelectItem value="draft">Черновики</SelectItem>
          <SelectItem value="archived">Архивированные</SelectItem>
        </SelectContent>
      </Select>
      <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Фильтр по отделу" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все отделы</SelectItem>
          <SelectItem value="Все отделы">Все отделы</SelectItem>
          {DEPARTMENTS.map(dept => (
            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};