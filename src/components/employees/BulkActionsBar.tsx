import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface BulkActionsBarProps {
  selectedEmployeesCount: number;
  onBulkEdit: () => void;
  onClearSelection: () => void;
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedEmployeesCount,
  onBulkEdit,
  onClearSelection
}) => {
  if (selectedEmployeesCount === 0) return null;

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="CheckSquare" size={16} className="text-orange-600" />
            <span className="font-medium">Выбрано сотрудников: {selectedEmployeesCount}</span>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkEdit}
            >
              Массовые действия
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearSelection}
            >
              Отменить выбор
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkActionsBar;