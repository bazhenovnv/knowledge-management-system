import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

interface CategoryManagementModalProps {
  isOpen: boolean;
  categories: Array<{ id: number; name: string; icon_name: string }>;
  categoryForm: { name: string; icon_name: string };
  editingCategory: { id: number; name: string; icon_name: string } | null;
  deletingCategory: { id: number; name: string } | null;
  transferTargetCategory: string;
  onClose: () => void;
  onCategoryFormChange: (form: { name: string; icon_name: string }) => void;
  onCreateCategory: () => void;
  onStartEditCategory: (category: { id: number; name: string; icon_name: string }) => void;
  onUpdateCategory: () => void;
  onCancelEditCategory: () => void;
  onStartDeleteCategory: (category: { id: number; name: string }) => void;
  onConfirmDeleteCategory: () => void;
  onCancelDeleteCategory: () => void;
  onTransferTargetChange: (categoryId: string) => void;
}

export const CategoryManagementModal = ({
  isOpen,
  categories,
  categoryForm,
  editingCategory,
  deletingCategory,
  transferTargetCategory,
  onClose,
  onCategoryFormChange,
  onCreateCategory,
  onStartEditCategory,
  onUpdateCategory,
  onCancelEditCategory,
  onStartDeleteCategory,
  onConfirmDeleteCategory,
  onCancelDeleteCategory,
  onTransferTargetChange,
}: CategoryManagementModalProps) => {
  const iconOptions = [
    'Folder', 'FolderOpen', 'FileText', 'Settings', 'Monitor',
    'Wrench', 'Shield', 'Database', 'Code', 'Smartphone'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Управление категориями</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-semibold">Добавить категорию</h3>
            <div>
              <Label>Название</Label>
              <Input
                value={categoryForm.name}
                onChange={(e) => onCategoryFormChange({ ...categoryForm, name: e.target.value })}
                placeholder="Название категории"
              />
            </div>
            <div>
              <Label>Иконка</Label>
              <select
                value={categoryForm.icon_name}
                onChange={(e) => onCategoryFormChange({ ...categoryForm, icon_name: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                {iconOptions.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>
            <Button onClick={onCreateCategory}>
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Существующие категории</h3>
            {categories.map(cat => (
              <Card key={cat.id}>
                <CardContent className="p-4">
                  {editingCategory?.id === cat.id ? (
                    <div className="space-y-4">
                      <div>
                        <Label>Название</Label>
                        <Input
                          value={editingCategory.name}
                          onChange={(e) => onCategoryFormChange({ 
                            name: e.target.value, 
                            icon_name: editingCategory.icon_name 
                          })}
                        />
                      </div>
                      <div>
                        <Label>Иконка</Label>
                        <select
                          value={editingCategory.icon_name}
                          onChange={(e) => onCategoryFormChange({ 
                            name: editingCategory.name, 
                            icon_name: e.target.value 
                          })}
                          className="w-full p-2 border rounded-md"
                        >
                          {iconOptions.map(icon => (
                            <option key={icon} value={icon}>{icon}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={onUpdateCategory} size="sm">
                          <Icon name="Save" size={16} className="mr-2" />
                          Сохранить
                        </Button>
                        <Button onClick={onCancelEditCategory} variant="outline" size="sm">
                          Отмена
                        </Button>
                      </div>
                    </div>
                  ) : deletingCategory?.id === cat.id ? (
                    <div className="space-y-4">
                      <p className="text-sm text-destructive">
                        Удалить категорию "{cat.name}"?
                      </p>
                      <div>
                        <Label>Переместить инструкции в категорию:</Label>
                        <select
                          value={transferTargetCategory}
                          onChange={(e) => onTransferTargetChange(e.target.value)}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="">Выберите категорию</option>
                          {categories
                            .filter(c => c.id !== cat.id)
                            .map(c => (
                              <option key={c.id} value={c.id.toString()}>
                                {c.name}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={onConfirmDeleteCategory} 
                          variant="destructive" 
                          size="sm"
                          disabled={!transferTargetCategory}
                        >
                          <Icon name="Trash2" size={16} className="mr-2" />
                          Удалить
                        </Button>
                        <Button onClick={onCancelDeleteCategory} variant="outline" size="sm">
                          Отмена
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon name={cat.icon_name} size={20} />
                        <span className="font-medium">{cat.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => onStartEditCategory(cat)}
                          variant="outline"
                          size="sm"
                        >
                          <Icon name="Edit" size={16} />
                        </Button>
                        <Button
                          onClick={() => onStartDeleteCategory(cat)}
                          variant="destructive"
                          size="sm"
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
