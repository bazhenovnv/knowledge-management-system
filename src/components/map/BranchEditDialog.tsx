import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Branch } from './RussiaMap';
import Icon from '@/components/ui/icon';

interface BranchEditDialogProps {
  branch: Branch | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (branch: Branch) => void;
  isNew?: boolean;
}

export const BranchEditDialog = ({ branch, isOpen, onClose, onSave, isNew = false }: BranchEditDialogProps) => {
  const [formData, setFormData] = useState<Branch | null>(null);

  useEffect(() => {
    if (branch) {
      setFormData({ ...branch });
    }
  }, [branch]);

  if (!formData) return null;

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Icon name={isNew ? "Plus" : "Edit"} className="text-blue-600" size={24} />
            {isNew ? 'Добавить филиал' : `Редактировать: ${branch?.city}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Город *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Краснодар"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employees">Количество сотрудников *</Label>
              <Input
                id="employees"
                type="number"
                value={formData.employees}
                onChange={(e) => setFormData({ ...formData, employees: parseInt(e.target.value) || 0 })}
                placeholder="10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Адрес *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="ул. Красная, д. 122"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+7 (861) 234-56-78"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="branch@ab-kassa.ru"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Краткое описание филиала..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="x">Координата X на карте (0-100)</Label>
              <Input
                id="x"
                type="number"
                step="0.1"
                value={formData.x}
                onChange={(e) => setFormData({ ...formData, x: parseFloat(e.target.value) || 0 })}
                placeholder="42.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="y">Координата Y на карте (0-100)</Label>
              <Input
                id="y"
                type="number"
                step="0.1"
                value={formData.y}
                onChange={(e) => setFormData({ ...formData, y: parseFloat(e.target.value) || 0 })}
                placeholder="72.5"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-gray-600">
              <Icon name="Info" size={14} className="inline mr-1" />
              Координаты определяют положение филиала на карте России (приблизительно)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Icon name="Save" size={16} className="mr-2" />
            {isNew ? 'Создать' : 'Сохранить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
