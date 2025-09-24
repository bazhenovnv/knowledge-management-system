import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EditingEmployeeData } from './employeeTabTypes';

interface EditEmployeeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingEmployee: EditingEmployeeData;
  setEditingEmployee: React.Dispatch<React.SetStateAction<EditingEmployeeData>>;
  departments: string[];
  onSaveEdit: () => void;
}

const EditEmployeeDialog: React.FC<EditEmployeeDialogProps> = ({
  isOpen,
  onOpenChange,
  editingEmployee,
  setEditingEmployee,
  departments,
  onSaveEdit
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактировать сотрудника</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-name" className="text-right">Имя</Label>
            <Input
              id="edit-name"
              value={editingEmployee.name}
              onChange={(e) => setEditingEmployee({...editingEmployee, name: e.target.value})}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-email" className="text-right">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={editingEmployee.email}
              onChange={(e) => setEditingEmployee({...editingEmployee, email: e.target.value})}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-department" className="text-right">Отдел</Label>
            <Select value={editingEmployee.department} onValueChange={(value) => setEditingEmployee({...editingEmployee, department: value})}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-position" className="text-right">Должность</Label>
            <Input
              id="edit-position"
              value={editingEmployee.position}
              onChange={(e) => setEditingEmployee({...editingEmployee, position: e.target.value})}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-role" className="text-right">Роль</Label>
            <Select value={editingEmployee.role} onValueChange={(value) => setEditingEmployee({...editingEmployee, role: value})}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Сотрудник</SelectItem>
                <SelectItem value="teacher">Преподаватель</SelectItem>
                <SelectItem value="admin">Администратор</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={onSaveEdit} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
            Сохранить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditEmployeeDialog;