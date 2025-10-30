import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  manager: string;
  latitude: number;
  longitude: number;
  description?: string;
  workingHours?: string;
  employeeCount?: number;
  isActive: boolean;
  createdAt: Date;
}

const STORAGE_KEY = 'branches_db';

interface BranchManagerProps {
  onClose?: () => void;
}

export const BranchManager = ({ onClose }: BranchManagerProps = {}) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Branch>>({
    name: '',
    address: '',
    city: 'Краснодар',
    phone: '',
    email: '',
    manager: '',
    latitude: 45.0355,
    longitude: 38.9753,
    description: '',
    workingHours: '9:00 - 18:00',
    employeeCount: 0,
    isActive: true,
  });

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setBranches(parsed.map((b: any) => ({
        ...b,
        createdAt: new Date(b.createdAt)
      })));
    } else {
      const defaultBranches: Branch[] = [
        {
          id: '1',
          name: 'Главный офис',
          address: 'ул. Красная, 123',
          city: 'Краснодар',
          phone: '+7(938) 523-17-81',
          email: 'n.bazhenov@a-b.ru',
          manager: 'Баженов Н.',
          latitude: 45.0355,
          longitude: 38.9753,
          description: 'Центральный офис компании',
          workingHours: '9:00 - 18:00',
          employeeCount: 25,
          isActive: true,
          createdAt: new Date(),
        }
      ];
      setBranches(defaultBranches);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultBranches));
    }
  };

  const saveBranches = (newBranches: Branch[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newBranches));
    setBranches(newBranches);
  };

  const openDialog = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch);
      setFormData(branch);
    } else {
      setEditingBranch(null);
      setFormData({
        name: '',
        address: '',
        city: 'Краснодар',
        phone: '',
        email: '',
        manager: '',
        latitude: 45.0355,
        longitude: 38.9753,
        description: '',
        workingHours: '9:00 - 18:00',
        employeeCount: 0,
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address || !formData.phone) {
      toast.error('Заполните обязательные поля');
      return;
    }

    if (editingBranch) {
      const updated = branches.map(b => 
        b.id === editingBranch.id 
          ? { ...formData, id: b.id, createdAt: b.createdAt } as Branch
          : b
      );
      saveBranches(updated);
      toast.success('Филиал обновлён');
    } else {
      const newBranch: Branch = {
        ...formData as Branch,
        id: Date.now().toString(),
        createdAt: new Date(),
      };
      saveBranches([...branches, newBranch]);
      toast.success('Филиал добавлен');
    }

    setIsDialogOpen(false);
    setEditingBranch(null);
  };

  const handleDelete = () => {
    if (!deletingBranch) return;
    
    const updated = branches.filter(b => b.id !== deletingBranch.id);
    saveBranches(updated);
    
    if (selectedBranchId === deletingBranch.id) {
      setSelectedBranchId(null);
    }
    
    toast.success('Филиал удалён');
    setIsDeleteDialogOpen(false);
    setDeletingBranch(null);
  };

  const toggleBranchStatus = (id: string) => {
    const updated = branches.map(b => 
      b.id === id ? { ...b, isActive: !b.isActive } : b
    );
    saveBranches(updated);
    toast.success('Статус филиала изменён');
  };

  const handleMapClick = (lat: number, lng: number) => {
    setFormData({ ...formData, latitude: lat, longitude: lng });
    toast.info(`Координаты обновлены: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Назад
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Филиалы компании</h2>
            <p className="text-gray-600">Управление филиалами и их расположением на карте</p>
          </div>
        </div>
        <Button onClick={() => openDialog()}>
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить филиал
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Список филиалов */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Icon name="MapPin" size={20} className="mr-2 text-blue-600" />
                Список филиалов ({branches.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {branches.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Icon name="Building" size={48} className="mx-auto mb-2 opacity-30" />
                  <p>Нет филиалов</p>
                  <p className="text-sm">Добавьте первый филиал</p>
                </div>
              ) : (
                branches.map((branch) => (
                  <Card
                    key={branch.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedBranchId === branch.id ? 'border-blue-500 border-2' : ''
                    }`}
                    onClick={() => setSelectedBranchId(branch.id)}
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
                        <p className="flex items-center gap-1">
                          <Icon name="Phone" size={14} />
                          {branch.phone}
                        </p>
                        <p className="flex items-center gap-1">
                          <Icon name="Mail" size={14} />
                          {branch.email}
                        </p>
                        <p className="flex items-center gap-1">
                          <Icon name="User" size={14} />
                          Менеджер: {branch.manager}
                        </p>
                        {branch.employeeCount && (
                          <p className="flex items-center gap-1">
                            <Icon name="Users" size={14} />
                            Сотрудников: {branch.employeeCount}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDialog(branch);
                          }}
                          className="flex-1"
                        >
                          <Icon name="Edit" size={14} className="mr-1" />
                          Изменить
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBranchStatus(branch.id);
                          }}
                        >
                          <Icon name={branch.isActive ? "EyeOff" : "Eye"} size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingBranch(branch);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Icon name="Trash2" size={14} className="text-red-600" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Карта */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Icon name="Map" size={20} className="mr-2 text-green-600" />
                Карта филиалов
              </CardTitle>
              <CardDescription>
                Нажмите на карту для установки координат нового филиала
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className="relative w-full bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300"
                style={{ height: '500px' }}
              >
                {/* Простая визуализация карты */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100">
                  <div className="absolute top-4 left-4 bg-white p-2 rounded shadow text-xs">
                    <p className="font-semibold">Краснодар</p>
                    <p className="text-gray-600">45.0355°N, 38.9753°E</p>
                  </div>
                  
                  {/* Точки филиалов */}
                  {branches.filter(b => b.isActive).map((branch) => (
                    <div
                      key={branch.id}
                      className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all ${
                        selectedBranchId === branch.id ? 'scale-125' : 'hover:scale-110'
                      }`}
                      style={{
                        left: `${((branch.longitude - 38.9) / 0.2) * 100}%`,
                        top: `${(1 - (branch.latitude - 44.9) / 0.2) * 100}%`,
                      }}
                      onClick={() => setSelectedBranchId(branch.id)}
                      title={branch.name}
                    >
                      <div className="relative">
                        <Icon 
                          name="MapPin" 
                          size={32} 
                          className={selectedBranchId === branch.id ? 'text-red-600' : 'text-blue-600'}
                        />
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-xs whitespace-nowrap">
                          {branch.name}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Легенда */}
                  <div className="absolute bottom-4 right-4 bg-white p-3 rounded shadow">
                    <p className="text-xs font-semibold mb-2">Легенда</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <Icon name="MapPin" size={16} className="text-blue-600" />
                        <span>Филиал</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="MapPin" size={16} className="text-red-600" />
                        <span>Выбранный</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {selectedBranchId && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  {(() => {
                    const selected = branches.find(b => b.id === selectedBranchId);
                    if (!selected) return null;
                    return (
                      <div>
                        <p className="font-semibold text-sm mb-2">{selected.name}</p>
                        <div className="text-xs space-y-1 text-gray-700">
                          <p>{selected.address}</p>
                          <p>Координаты: {selected.latitude.toFixed(4)}, {selected.longitude.toFixed(4)}</p>
                          {selected.description && <p className="italic">{selected.description}</p>}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Диалог добавления/редактирования */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBranch ? 'Редактировать филиал' : 'Добавить филиал'}
            </DialogTitle>
            <DialogDescription>
              Заполните информацию о филиале
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Название филиала *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Главный офис"
                  required
                />
              </div>

              <div>
                <Label htmlFor="city">Город *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Краснодар"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="address">Адрес *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="ул. Красная, 123"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Телефон *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+7(938) 523-17-81"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="office@company.ru"
                />
              </div>

              <div>
                <Label htmlFor="manager">Менеджер</Label>
                <Input
                  id="manager"
                  value={formData.manager}
                  onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  placeholder="Иванов И.И."
                />
              </div>

              <div>
                <Label htmlFor="workingHours">Часы работы</Label>
                <Input
                  id="workingHours"
                  value={formData.workingHours}
                  onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                  placeholder="9:00 - 18:00"
                />
              </div>

              <div>
                <Label htmlFor="employeeCount">Количество сотрудников</Label>
                <Input
                  id="employeeCount"
                  type="number"
                  value={formData.employeeCount || 0}
                  onChange={(e) => setFormData({ ...formData, employeeCount: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="latitude">Широта (Latitude)</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="0.0001"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                  placeholder="45.0355"
                />
              </div>

              <div>
                <Label htmlFor="longitude">Долгота (Longitude)</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="0.0001"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                  placeholder="38.9753"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Дополнительная информация о филиале"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Отмена
              </Button>
              <Button type="submit">
                <Icon name="Save" size={16} className="mr-2" />
                {editingBranch ? 'Сохранить' : 'Добавить'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Диалог удаления */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-red-600">
              <Icon name="AlertTriangle" size={20} className="mr-2" />
              Удалить филиал?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить филиал "{deletingBranch?.name}"?
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};