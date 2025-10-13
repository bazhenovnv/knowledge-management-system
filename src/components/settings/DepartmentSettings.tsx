import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DepartmentSettingsProps {
  userRole: string;
}

const DepartmentSettings: React.FC<DepartmentSettingsProps> = ({ userRole }) => {
  const [departments, setDepartments] = useState<string[]>(() => {
    const saved = localStorage.getItem('custom_departments');
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      '1С',
      'Партнерка',
      'ЦТО',
      'Сервис',
      'Крупные клиенты',
      'Отдел заявок',
      'Отдел сопровождения',
      'HoReCa',
      'Отдел Тинькофф',
      'Отдел ФН',
      'Логистика',
      'Тех. поддержка',
      'Отдел маркетинга',
      'Отдел маркетплейсы'
    ];
  });

  const [positions, setPositions] = useState<string[]>(() => {
    const saved = localStorage.getItem('custom_positions');
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      'Разработчик',
      'Системный администратор',
      'Аналитик',
      'Менеджер',
      'Специалист',
      'Консультант',
      'Инженер',
      'Бухгалтер',
      'HR-специалист',
      'Маркетолог',
      'Менеджер по продажам',
      'Логист',
      'Охранник',
      'Юрист',
      'Директор',
      'Заместитель директора',
      'Руководитель отдела'
    ];
  });

  const [newDepartment, setNewDepartment] = useState('');
  const [newPosition, setNewPosition] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'department' | 'position'; value: string } | null>(null);
  const [editingDepartment, setEditingDepartment] = useState<string | null>(null);
  const [editingPosition, setEditingPosition] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  if (userRole !== 'admin') {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">
            <Icon name="Lock" size={48} className="mx-auto mb-4 opacity-50" />
            <p>Доступ к этому разделу имеют только администраторы</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const saveDepartments = (newDepts: string[]) => {
    localStorage.setItem('custom_departments', JSON.stringify(newDepts));
    setDepartments(newDepts);
    window.dispatchEvent(new CustomEvent('departmentsUpdated', { detail: newDepts }));
  };

  const savePositions = (newPos: string[]) => {
    localStorage.setItem('custom_positions', JSON.stringify(newPos));
    setPositions(newPos);
    window.dispatchEvent(new CustomEvent('positionsUpdated', { detail: newPos }));
  };

  const handleAddDepartment = () => {
    const trimmed = newDepartment.trim();
    if (!trimmed) {
      toast.error('Введите название отдела');
      return;
    }
    
    if (departments.includes(trimmed)) {
      toast.error('Такой отдел уже существует');
      return;
    }

    const updated = [...departments, trimmed].sort();
    saveDepartments(updated);
    setNewDepartment('');
    toast.success(`Отдел "${trimmed}" добавлен`);
  };

  const handleAddPosition = () => {
    const trimmed = newPosition.trim();
    if (!trimmed) {
      toast.error('Введите название должности');
      return;
    }
    
    if (positions.includes(trimmed)) {
      toast.error('Такая должность уже существует');
      return;
    }

    const updated = [...positions, trimmed].sort();
    savePositions(updated);
    setNewPosition('');
    toast.success(`Должность "${trimmed}" добавлена`);
  };

  const handleDeleteDepartment = (dept: string) => {
    const updated = departments.filter(d => d !== dept);
    saveDepartments(updated);
    setDeleteConfirm(null);
    toast.success(`Отдел "${dept}" удален`);
  };

  const handleDeletePosition = (pos: string) => {
    const updated = positions.filter(p => p !== pos);
    savePositions(updated);
    setDeleteConfirm(null);
    toast.success(`Должность "${pos}" удалена`);
  };

  const handleEditDepartment = (oldName: string) => {
    const trimmed = editValue.trim();
    if (!trimmed) {
      toast.error('Введите название отдела');
      return;
    }
    
    if (trimmed !== oldName && departments.includes(trimmed)) {
      toast.error('Такой отдел уже существует');
      return;
    }

    const updated = departments.map(d => d === oldName ? trimmed : d).sort();
    saveDepartments(updated);
    setEditingDepartment(null);
    setEditValue('');
    toast.success(`Отдел переименован в "${trimmed}"`);
  };

  const handleEditPosition = (oldName: string) => {
    const trimmed = editValue.trim();
    if (!trimmed) {
      toast.error('Введите название должности');
      return;
    }
    
    if (trimmed !== oldName && positions.includes(trimmed)) {
      toast.error('Такая должность уже существует');
      return;
    }

    const updated = positions.map(p => p === oldName ? trimmed : p).sort();
    savePositions(updated);
    setEditingPosition(null);
    setEditValue('');
    toast.success(`Должность переименована в "${trimmed}"`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Building2" size={24} />
            Управление отделами
          </CardTitle>
          <CardDescription>
            Добавляйте, редактируйте и удаляйте отделы компании
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Название нового отдела"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddDepartment()}
              />
            </div>
            <Button onClick={handleAddDepartment}>
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {departments.map((dept) => (
              <div key={dept}>
                {editingDepartment === dept ? (
                  <div className="flex gap-1">
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleEditDepartment(dept);
                        if (e.key === 'Escape') {
                          setEditingDepartment(null);
                          setEditValue('');
                        }
                      }}
                      className="h-8 w-40"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditDepartment(dept)}
                    >
                      <Icon name="Check" size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingDepartment(null);
                        setEditValue('');
                      }}
                    >
                      <Icon name="X" size={14} />
                    </Button>
                  </div>
                ) : (
                  <Badge variant="secondary" className="text-sm py-1 px-3">
                    {dept}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0 ml-2 hover:bg-transparent"
                      onClick={() => {
                        setEditingDepartment(dept);
                        setEditValue(dept);
                      }}
                    >
                      <Icon name="Pencil" size={12} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                      onClick={() => setDeleteConfirm({ type: 'department', value: dept })}
                    >
                      <Icon name="X" size={12} />
                    </Button>
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Briefcase" size={24} />
            Управление должностями
          </CardTitle>
          <CardDescription>
            Добавляйте, редактируйте и удаляйте должности сотрудников
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Название новой должности"
                value={newPosition}
                onChange={(e) => setNewPosition(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddPosition()}
              />
            </div>
            <Button onClick={handleAddPosition}>
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {positions.map((pos) => (
              <div key={pos}>
                {editingPosition === pos ? (
                  <div className="flex gap-1">
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleEditPosition(pos);
                        if (e.key === 'Escape') {
                          setEditingPosition(null);
                          setEditValue('');
                        }
                      }}
                      className="h-8 w-40"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditPosition(pos)}
                    >
                      <Icon name="Check" size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingPosition(null);
                        setEditValue('');
                      }}
                    >
                      <Icon name="X" size={14} />
                    </Button>
                  </div>
                ) : (
                  <Badge variant="secondary" className="text-sm py-1 px-3">
                    {pos}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0 ml-2 hover:bg-transparent"
                      onClick={() => {
                        setEditingPosition(pos);
                        setEditValue(pos);
                      }}
                    >
                      <Icon name="Pencil" size={12} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                      onClick={() => setDeleteConfirm({ type: 'position', value: pos })}
                    >
                      <Icon name="X" size={12} />
                    </Button>
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтвердите удаление</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить {deleteConfirm?.type === 'department' ? 'отдел' : 'должность'} "{deleteConfirm?.value}"?
              <br /><br />
              <strong>Важно:</strong> Сотрудники с этим {deleteConfirm?.type === 'department' ? 'отделом' : 'должностью'} останутся без изменений.
              Вам нужно будет вручную обновить их данные.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirm?.type === 'department') {
                  handleDeleteDepartment(deleteConfirm.value);
                } else if (deleteConfirm?.type === 'position') {
                  handleDeletePosition(deleteConfirm.value);
                }
              }}
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DepartmentSettings;
