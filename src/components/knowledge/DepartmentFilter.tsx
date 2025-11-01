import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

interface DepartmentFilterProps {
  selectedDepartmentFilter: string[];
  setSelectedDepartmentFilter: (departments: string[]) => void;
  departments: string[];
}

export const DepartmentFilter = ({
  selectedDepartmentFilter,
  setSelectedDepartmentFilter,
  departments,
}: DepartmentFilterProps) => {
  const toggleDepartmentFilter = (department: string) => {
    setSelectedDepartmentFilter(
      selectedDepartmentFilter.includes(department)
        ? selectedDepartmentFilter.filter(d => d !== department)
        : [...selectedDepartmentFilter, department]
    );
  };

  const getDepartmentIcon = (department: string) => {
    const icons: Record<string, string> = {
      'Отдел продаж': 'TrendingUp',
      'Технический отдел': 'Wrench',
      'Служба поддержки': 'Headset',
    };
    return icons[department] || 'Users';
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <span className="text-sm text-muted-foreground self-center">Отделы:</span>
      {departments.map((department) => (
        <Button
          key={department}
          variant={selectedDepartmentFilter.includes(department) ? 'default' : 'outline'}
          size="sm"
          onClick={() => toggleDepartmentFilter(department)}
          className="flex items-center gap-2"
        >
          <Icon name={getDepartmentIcon(department)} size={16} />
          {department}
          {selectedDepartmentFilter.includes(department) && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
              <Icon name="Check" size={12} />
            </Badge>
          )}
        </Button>
      ))}
      {selectedDepartmentFilter.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedDepartmentFilter([])}
          className="text-muted-foreground"
        >
          <Icon name="X" size={16} className="mr-1" />
          Сбросить
        </Button>
      )}
    </div>
  );
};
