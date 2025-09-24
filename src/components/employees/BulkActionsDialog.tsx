import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DEPARTMENTS } from '@/constants/departments';
import { getStatusText } from '@/utils/statusUtils';
import { BulkAction } from './types';

interface BulkActionsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  bulkAction: BulkAction;
  setBulkAction: (action: BulkAction) => void;
  bulkValue: string;
  setBulkValue: (value: string) => void;
  selectedEmployeesCount: number;
  onApplyBulkAction: () => void;
}

const BulkActionsDialog: React.FC<BulkActionsDialogProps> = ({
  isOpen,
  onOpenChange,
  bulkAction,
  setBulkAction,
  bulkValue,
  setBulkValue,
  selectedEmployeesCount,
  onApplyBulkAction
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Массовые действия</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Действие</Label>
            <Select
              value={bulkAction}
              onValueChange={(value: BulkAction) => setBulkAction(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="department">Изменить отдел</SelectItem>
                <SelectItem value="role">Изменить роль</SelectItem>
                <SelectItem value="status">Изменить статус</SelectItem>
                <SelectItem value="export">Экспортировать</SelectItem>
                <SelectItem value="delete">Удалить</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {bulkAction === 'department' && (
            <div className="space-y-2">
              <Label>Новый отдел</Label>
              <Select value={bulkValue} onValueChange={setBulkValue}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите отдел" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {bulkAction === 'role' && (
            <div className="space-y-2">
              <Label>Новая роль</Label>
              <Select value={bulkValue} onValueChange={setBulkValue}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите роль" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Сотрудник</SelectItem>
                  <SelectItem value="teacher">Преподаватель</SelectItem>
                  <SelectItem value="admin">Администратор</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {bulkAction === 'status' && (
            <div className="space-y-2">
              <Label>Новый статус</Label>
              <Select value={bulkValue} onValueChange={setBulkValue}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map(status => (
                    <SelectItem key={status} value={status.toString()}>
                      {getStatusText(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">
              Выбрано сотрудников: <strong>{selectedEmployeesCount}</strong>
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={onApplyBulkAction}>
            Применить действие
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkActionsDialog;