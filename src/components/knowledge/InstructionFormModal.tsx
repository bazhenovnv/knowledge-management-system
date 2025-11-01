import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { Instruction } from "@/utils/databaseService";

interface InstructionFormModalProps {
  isOpen: boolean;
  isEditing: boolean;
  form: {
    title: string;
    description: string;
    category: string;
    icon_name: string;
    icon_color: string;
    steps: string[];
    media: {
      images: string[];
      videos: string[];
    };
  };
  categories: Array<{ id: number; name: string; icon_name: string }>;
  onClose: () => void;
  onFormChange: (form: any) => void;
  onSubmit: () => void;
  onUploadImage: (files: FileList, type: 'step' | 'form') => void;
}

export const InstructionFormModal = ({
  isOpen,
  isEditing,
  form,
  categories,
  onClose,
  onFormChange,
  onSubmit,
  onUploadImage,
}: InstructionFormModalProps) => {
  const iconOptions = [
    'FileText', 'Monitor', 'Settings', 'Wrench', 'Shield', 'Zap',
    'Database', 'Code', 'Terminal', 'Smartphone', 'Wifi', 'Lock'
  ];

  const colorOptions = [
    { name: 'Синий', value: 'blue-600' },
    { name: 'Зеленый', value: 'green-600' },
    { name: 'Красный', value: 'red-600' },
    { name: 'Оранжевый', value: 'orange-600' },
    { name: 'Фиолетовый', value: 'purple-600' },
    { name: 'Индиго', value: 'indigo-600' },
  ];

  const addStep = () => {
    onFormChange({ ...form, steps: [...form.steps, ''] });
  };

  const updateStep = (index: number, value: string) => {
    const newSteps = [...form.steps];
    newSteps[index] = value;
    onFormChange({ ...form, steps: newSteps });
  };

  const removeStep = (index: number) => {
    onFormChange({ ...form, steps: form.steps.filter((_, i) => i !== index) });
  };

  const removeImage = (index: number) => {
    const newImages = form.media.images.filter((_, i) => i !== index);
    onFormChange({ ...form, media: { ...form.media, images: newImages } });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Редактировать' : 'Создать'} инструкцию</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Название</Label>
            <Input
              value={form.title}
              onChange={(e) => onFormChange({ ...form, title: e.target.value })}
              placeholder="Название инструкции"
            />
          </div>

          <div>
            <Label>Описание</Label>
            <Input
              value={form.description}
              onChange={(e) => onFormChange({ ...form, description: e.target.value })}
              placeholder="Краткое описание"
            />
          </div>

          <div>
            <Label>Категория</Label>
            <select
              value={form.category}
              onChange={(e) => onFormChange({ ...form, category: e.target.value })}
              className="w-full p-2 border rounded-md"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Иконка</Label>
              <select
                value={form.icon_name}
                onChange={(e) => onFormChange({ ...form, icon_name: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                {iconOptions.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>

            <div>
              <Label>Цвет иконки</Label>
              <select
                value={form.icon_color}
                onChange={(e) => onFormChange({ ...form, icon_color: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                {colorOptions.map(color => (
                  <option key={color.value} value={color.value}>{color.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Шаги</Label>
              <Button type="button" size="sm" onClick={addStep}>
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить шаг
              </Button>
            </div>
            {form.steps.map((step, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <span className="text-sm font-medium text-muted-foreground min-w-6 pt-2">
                  {index + 1}.
                </span>
                <Input
                  value={step}
                  onChange={(e) => updateStep(index, e.target.value)}
                  placeholder={`Шаг ${index + 1}`}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeStep(index)}
                >
                  <Icon name="Trash2" size={16} />
                </Button>
              </div>
            ))}
          </div>

          <div>
            <Label>Изображения</Label>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => e.target.files && onUploadImage(e.target.files, 'form')}
              className="mb-2"
            />
            {form.media.images.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {form.media.images.map((img, idx) => (
                  <div key={idx} className="relative">
                    <img src={img} alt={`Preview ${idx}`} className="w-20 h-20 object-cover rounded" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0"
                      onClick={() => removeImage(idx)}
                    >
                      <Icon name="X" size={12} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={onSubmit} className="flex-1">
              <Icon name="Save" size={16} className="mr-2" />
              {isEditing ? 'Сохранить' : 'Создать'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
