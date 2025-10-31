import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { DatabaseEmployee } from '@/utils/databaseService';
import { toast } from 'sonner';

interface EmployeeCardProps {
  employee: DatabaseEmployee;
  onEdit: (employee: DatabaseEmployee) => void;
  onDelete: (employee: DatabaseEmployee) => void;
}

export function EmployeeCard({ employee, onEdit, onDelete }: EmployeeCardProps) {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'teacher': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Администратор';
      case 'teacher': return 'Преподаватель';
      default: return 'Сотрудник';
    }
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (employee.zoom_link) {
      try {
        await navigator.clipboard.writeText(employee.zoom_link);
        toast.success('Ссылка на конференцию скопирована');
      } catch {
        toast.error('Не удалось скопировать ссылку');
      }
    }
  };

  return (
    <Card className={!employee.is_active ? 'opacity-60 border-gray-300' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {employee.full_name}
              {!employee.is_active && (
                <Badge variant="outline" className="bg-gray-100 text-gray-600">
                  Неактивен
                </Badge>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{employee.position}</p>
          </div>
          <Badge className={getRoleBadgeColor(employee.role)}>
            {getRoleText(employee.role)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon name="Building" size={16} />
            <span>{employee.department}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon name="Mail" size={16} />
            <span>{employee.email}</span>
          </div>
          {employee.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon name="Phone" size={16} />
              <span>{employee.phone}</span>
            </div>
          )}
          {employee.hire_date && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon name="Calendar" size={16} />
              <span>Принят: {new Date(employee.hire_date).toLocaleDateString('ru-RU')}</span>
            </div>
          )}
        </div>
        {employee.zoom_link && (
          <div className="flex items-center gap-2 mt-3">
            <a
              href={employee.zoom_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline flex-1"
            >
              <Icon name="Video" size={16} />
              Конференция
            </a>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyLink}
              className="h-7 px-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
              title="Скопировать ссылку"
            >
              <Icon name="Copy" size={14} />
            </Button>
          </div>
        )}
        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onEdit(employee)}
          >
            <Icon name="Pencil" size={16} className="mr-1" />
            Редактировать
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => onDelete(employee)}
          >
            <Icon name="Trash2" size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}