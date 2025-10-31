import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type SortField = 'name' | 'department' | 'position' | 'hire_date' | 'created_at';
export type SortOrder = 'asc' | 'desc';
export type StatusFilter = 'all' | 'active' | 'inactive';
export type RoleFilter = 'all' | 'admin' | 'teacher' | 'employee';

interface EmployeeToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddEmployee: () => void;
  onImport: () => void;
  onExportExcel: () => void;
  onExportCSV: () => void;
  employeeCount: number;
  filteredCount: number;
  sortField: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField) => void;
  statusFilter: StatusFilter;
  roleFilter: RoleFilter;
  onStatusFilterChange: (status: StatusFilter) => void;
  onRoleFilterChange: (role: RoleFilter) => void;
}

export function EmployeeToolbar({
  searchTerm,
  onSearchChange,
  onAddEmployee,
  onImport,
  onExportExcel,
  onExportCSV,
  employeeCount,
  filteredCount,
  sortField,
  sortOrder,
  onSortChange,
  statusFilter,
  roleFilter,
  onStatusFilterChange,
  onRoleFilterChange
}: EmployeeToolbarProps) {
  const getSortLabel = (field: SortField): string => {
    const labels = {
      name: 'ФИО',
      department: 'Отдел',
      position: 'Должность',
      hire_date: 'Дата найма',
      created_at: 'Дата создания'
    };
    return labels[field];
  };

  const getStatusLabel = (status: StatusFilter): string => {
    const labels = {
      all: 'Все',
      active: 'Активные',
      inactive: 'Неактивные'
    };
    return labels[status];
  };

  const getRoleLabel = (role: RoleFilter): string => {
    const labels = {
      all: 'Все роли',
      admin: 'Администраторы',
      teacher: 'Преподаватели',
      employee: 'Сотрудники'
    };
    return labels[role];
  };
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Icon 
            name="Search" 
            size={18} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <Input
            type="text"
            placeholder="Поиск по ФИО, email, отделу, должности..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Icon name="Filter" size={18} className="mr-2" />
                Статус: {getStatusLabel(statusFilter)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onStatusFilterChange('all')}>
                <Icon name="Users" size={16} className="mr-2" />
                Все {statusFilter === 'all' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusFilterChange('active')}>
                <Icon name="UserCheck" size={16} className="mr-2" />
                Активные {statusFilter === 'active' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusFilterChange('inactive')}>
                <Icon name="UserX" size={16} className="mr-2" />
                Неактивные {statusFilter === 'inactive' && '✓'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Icon name="Shield" size={18} className="mr-2" />
                {getRoleLabel(roleFilter)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onRoleFilterChange('all')}>
                <Icon name="Users" size={16} className="mr-2" />
                Все роли {roleFilter === 'all' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRoleFilterChange('admin')}>
                <Icon name="ShieldCheck" size={16} className="mr-2" />
                Администраторы {roleFilter === 'admin' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRoleFilterChange('teacher')}>
                <Icon name="GraduationCap" size={16} className="mr-2" />
                Преподаватели {roleFilter === 'teacher' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRoleFilterChange('employee')}>
                <Icon name="User" size={16} className="mr-2" />
                Сотрудники {roleFilter === 'employee' && '✓'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Icon name="ArrowUpDown" size={18} className="mr-2" />
                Сортировка: {getSortLabel(sortField)}
                <Icon name={sortOrder === 'asc' ? 'ArrowUp' : 'ArrowDown'} size={14} className="ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onSortChange('name')}>
                <Icon name="User" size={16} className="mr-2" />
                По ФИО {sortField === 'name' && <Icon name={sortOrder === 'asc' ? 'ArrowUp' : 'ArrowDown'} size={12} className="ml-auto" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange('department')}>
                <Icon name="Building" size={16} className="mr-2" />
                По отделу {sortField === 'department' && <Icon name={sortOrder === 'asc' ? 'ArrowUp' : 'ArrowDown'} size={12} className="ml-auto" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange('position')}>
                <Icon name="Briefcase" size={16} className="mr-2" />
                По должности {sortField === 'position' && <Icon name={sortOrder === 'asc' ? 'ArrowUp' : 'ArrowDown'} size={12} className="ml-auto" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange('hire_date')}>
                <Icon name="Calendar" size={16} className="mr-2" />
                По дате найма {sortField === 'hire_date' && <Icon name={sortOrder === 'asc' ? 'ArrowUp' : 'ArrowDown'} size={12} className="ml-auto" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange('created_at')}>
                <Icon name="Clock" size={16} className="mr-2" />
                По дате создания {sortField === 'created_at' && <Icon name={sortOrder === 'asc' ? 'ArrowUp' : 'ArrowDown'} size={12} className="ml-auto" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Icon name="Download" size={18} className="mr-2" />
                Экспорт
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onExportExcel}>
                <Icon name="FileSpreadsheet" size={16} className="mr-2" />
                Экспорт в Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportCSV}>
                <Icon name="FileText" size={16} className="mr-2" />
                Экспорт в CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" onClick={onImport}>
            <Icon name="Upload" size={18} className="mr-2" />
            Импорт
          </Button>

          <Button onClick={onAddEmployee}>
            <Icon name="Plus" size={18} className="mr-2" />
            Добавить
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        {filteredCount === employeeCount ? (
          <>Всего сотрудников: <strong>{employeeCount}</strong></>
        ) : (
          <>Показано: <strong>{filteredCount}</strong> из <strong>{employeeCount}</strong></>
        )}
      </div>
    </div>
  );
}