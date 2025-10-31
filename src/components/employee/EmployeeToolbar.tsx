import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EmployeeToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddEmployee: () => void;
  onImport: () => void;
  onExportExcel: () => void;
  onExportCSV: () => void;
  employeeCount: number;
}

export function EmployeeToolbar({
  searchTerm,
  onSearchChange,
  onAddEmployee,
  onImport,
  onExportExcel,
  onExportCSV,
  employeeCount
}: EmployeeToolbarProps) {
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
        
        <div className="flex gap-2">
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
        Всего сотрудников: <strong>{employeeCount}</strong>
      </div>
    </div>
  );
}
