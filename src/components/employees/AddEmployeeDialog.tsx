import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NewEmployeeFormData } from './employeeTabTypes';

interface AddEmployeeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newEmployee: NewEmployeeFormData;
  setNewEmployee: React.Dispatch<React.SetStateAction<NewEmployeeFormData>>;
  departments: string[];
  onAddEmployee: () => void;
}

const AddEmployeeDialog: React.FC<AddEmployeeDialogProps> = ({
  isOpen,
  onOpenChange,
  newEmployee,
  setNewEmployee,
  departments,
  onAddEmployee
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить нового сотрудника</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Имя</Label>
            <Input
              id="name"
              value={newEmployee.name}
              onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
              placeholder="Введите имя"
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <Input
              id="email"
              type="email"
              value={newEmployee.email}
              onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
              placeholder="Введите email"
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="department" className="text-right">Отдел</Label>
            <Select value={newEmployee.department} onValueChange={(value) => setNewEmployee({...newEmployee, department: value})}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Выберите отдел" />
              </SelectTrigger>
              <SelectContent>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="position" className="text-right">Должность</Label>
            <Input
              id="position"
              value={newEmployee.position}
              onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
              placeholder="Введите должность"
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">Роль</Label>
            <Select value={newEmployee.role} onValueChange={(value) => setNewEmployee({...newEmployee, role: value})}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Выберите роль" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Сотрудник</SelectItem>
                <SelectItem value="teacher">Преподаватель</SelectItem>
                <SelectItem value="admin">Администратор</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">Статус</Label>
            <Select value={newEmployee.status?.toString()} onValueChange={(value) => setNewEmployee({...newEmployee, status: parseInt(value)})}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Выберите статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Критический</SelectItem>
                <SelectItem value="2">2 - Низкий</SelectItem>
                <SelectItem value="3">3 - Средний</SelectItem>
                <SelectItem value="4">4 - Хороший</SelectItem>
                <SelectItem value="5">5 - Отличный</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={onAddEmployee} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
            Добавить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeDialog;