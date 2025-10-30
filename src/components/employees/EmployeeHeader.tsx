import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { DatabaseEmployee } from '@/utils/databaseService';

interface EmployeeHeaderProps {
  employees: DatabaseEmployee[];
  filteredEmployees: DatabaseEmployee[];
  onRefresh: () => void;
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
}

export const EmployeeHeader: React.FC<EmployeeHeaderProps> = ({
  employees,
  filteredEmployees,
  onRefresh,
  isAddDialogOpen,
  setIsAddDialogOpen
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">Управление сотрудниками</h2>
        <p className="text-gray-600">Данные из PostgreSQL базы данных</p>
      </div>
      <div className="flex items-center space-x-4">
        <Badge variant="outline" className="flex items-center space-x-1">
          <Icon name="Database" size={14} />
          <span>{employees.length} всего</span>
        </Badge>
        <Badge variant="default" className="flex items-center space-x-1">
          <Icon name="Users" size={14} />
          <span>{filteredEmployees.length} активных</span>
        </Badge>
        <Button onClick={onRefresh} variant="outline" size="sm" className="border-[0.25px] border-black">
          <Icon name="RefreshCw" size={16} className="mr-1" />
          Обновить
        </Button>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-[0.25px] border-black">
              <Icon name="UserPlus" size={16} className="mr-2" />
              Добавить сотрудника
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>
    </div>
  );
};