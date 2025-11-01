import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Branch } from "./BranchManager";

interface BranchCardProps {
  branch: Branch;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}

export const BranchCard = ({
  branch,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onToggleStatus,
}: BranchCardProps) => {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'border-blue-500 border-2' : ''
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg">{branch.name}</h3>
              <Badge variant={branch.isActive ? "default" : "secondary"}>
                {branch.isActive ? 'Активен' : 'Неактивен'}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Icon name="MapPin" size={14} />
              {branch.city}, {branch.address}
            </p>
          </div>
        </div>

        <div className="space-y-1 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-2">
            <Icon name="Phone" size={14} />
            <span>{branch.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Mail" size={14} />
            <span>{branch.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="User" size={14} />
            <span>Управляющий: {branch.manager}</span>
          </div>
          {branch.employeeCount !== undefined && (
            <div className="flex items-center gap-2">
              <Icon name="Users" size={14} />
              <span>Сотрудников: {branch.employeeCount}</span>
            </div>
          )}
          {branch.workingHours && (
            <div className="flex items-center gap-2">
              <Icon name="Clock" size={14} />
              <span>{branch.workingHours}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex-1"
          >
            <Icon name="Edit" size={14} className="mr-1" />
            Изменить
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleStatus}
            className="flex-1"
          >
            <Icon name={branch.isActive ? "EyeOff" : "Eye"} size={14} className="mr-1" />
            {branch.isActive ? 'Деактивировать' : 'Активировать'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700"
          >
            <Icon name="Trash2" size={14} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
