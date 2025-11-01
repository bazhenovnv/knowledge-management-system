import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Branch } from "./BranchManager";

interface BranchFormDialogProps {
  isOpen: boolean;
  editingBranch: Branch | null;
  formData: Partial<Branch>;
  onFormDataChange: (data: Partial<Branch>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const BranchFormDialog = ({
  isOpen,
  editingBranch,
  formData,
  onFormDataChange,
  onSubmit,
  onClose,
}: BranchFormDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingBranch ? 'Редактировать филиал' : 'Добавить филиал'}
          </DialogTitle>
          <DialogDescription>
            Заполните информацию о филиале. Поля со звёздочкой обязательны для заполнения.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Город *</Label>
              <Input
                id="city"
                value={formData.city || ''}
                onChange={(e) => onFormDataChange({ ...formData, city: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Адрес *</Label>
            <Input
              id="address"
              value={formData.address || ''}
              onChange={(e) => onFormDataChange({ ...formData, address: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => onFormDataChange({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => onFormDataChange({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manager">Управляющий</Label>
              <Input
                id="manager"
                value={formData.manager || ''}
                onChange={(e) => onFormDataChange({ ...formData, manager: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workingHours">Часы работы</Label>
              <Input
                id="workingHours"
                value={formData.workingHours || ''}
                onChange={(e) => onFormDataChange({ ...formData, workingHours: e.target.value })}
                placeholder="9:00 - 18:00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeCount">Количество сотрудников</Label>
              <Input
                id="employeeCount"
                type="number"
                min="0"
                value={formData.employeeCount || 0}
                onChange={(e) => onFormDataChange({ ...formData, employeeCount: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive ?? true}
                  onChange={(e) => onFormDataChange({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                Активен
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Широта</Label>
              <Input
                id="latitude"
                type="number"
                step="0.000001"
                value={formData.latitude || 45.0355}
                onChange={(e) => onFormDataChange({ ...formData, latitude: parseFloat(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude">Долгота</Label>
              <Input
                id="longitude"
                type="number"
                step="0.000001"
                value={formData.longitude || 38.9753}
                onChange={(e) => onFormDataChange({ ...formData, longitude: parseFloat(e.target.value) })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit">
              {editingBranch ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
