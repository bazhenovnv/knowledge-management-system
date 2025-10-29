import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { FormData } from './types';
import { FileAttachment } from '@/utils/databaseService';

interface MaterialFormModalProps {
  isOpen: boolean;
  isEditing: boolean;
  formData: FormData;
  selectedDepartments: string[];
  departments: string[];
  coverImagePreview: string;
  uploadingCount: number;
  onClose: () => void;
  onSubmit: () => void;
  onFormChange: (field: string, value: any) => void;
  onDepartmentToggle: (deptId: string) => void;
  onCoverImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAttachment: (index: number) => void;
  onRemoveCoverImage: () => void;
}

export const MaterialFormModal = ({
  isOpen,
  isEditing,
  formData,
  selectedDepartments,
  departments,
  coverImagePreview,
  uploadingCount,
  onClose,
  onSubmit,
  onFormChange,
  onDepartmentToggle,
  onCoverImageUpload,
  onFileUpload,
  onRemoveAttachment,
  onRemoveCoverImage,
}: MaterialFormModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <Card
        className="max-w-4xl w-full my-8 flex flex-col max-h-[calc(100vh-4rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle>
              {isEditing ? 'Редактировать материал' : 'Создать материал'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <Icon name="X" size={16} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 overflow-y-auto flex-1">
          <div>
            <Label>Название</Label>
            <Input
              value={formData.title}
              onChange={(e) => onFormChange('title', e.target.value)}
              placeholder="Введите название материала"
            />
          </div>

          <div>
            <Label>Описание</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => onFormChange('description', e.target.value)}
              placeholder="Краткое описание материала"
              rows={3}
            />
          </div>

          <div>
            <Label>Содержание</Label>
            <Textarea
              value={formData.content}
              onChange={(e) => onFormChange('content', e.target.value)}
              placeholder="Подробное содержание материала"
              rows={10}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Категория</Label>
              <Input
                value={formData.category}
                onChange={(e) => onFormChange('category', e.target.value)}
                placeholder="Категория"
              />
            </div>

            <div>
              <Label>Сложность</Label>
              <select
                value={formData.difficulty}
                onChange={(e) => onFormChange('difficulty', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="easy">Легкий</option>
                <option value="medium">Средний</option>
                <option value="hard">Сложный</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Длительность</Label>
            <Input
              value={formData.duration}
              onChange={(e) => onFormChange('duration', e.target.value)}
              placeholder="Например: 30 минут"
            />
          </div>

          <div>
            <Label>Теги (через запятую)</Label>
            <Input
              value={formData.tags}
              onChange={(e) => onFormChange('tags', e.target.value)}
              placeholder="html, css, javascript"
            />
          </div>

          <div>
            <Label>Обложка</Label>
            {coverImagePreview ? (
              <div className="relative">
                <img
                  src={coverImagePreview}
                  alt="Cover preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={onRemoveCoverImage}
                >
                  <Icon name="X" size={16} />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={onCoverImageUpload}
                  className="hidden"
                  id="cover-upload"
                />
                <label htmlFor="cover-upload" className="cursor-pointer">
                  <Icon name="Upload" size={32} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Загрузить обложку</p>
                </label>
              </div>
            )}
          </div>

          <div>
            <Label>Вложения</Label>
            <div className="border-2 border-dashed rounded-lg p-4">
              <input
                type="file"
                multiple
                onChange={onFileUpload}
                className="hidden"
                id="files-upload"
              />
              <label htmlFor="files-upload" className="cursor-pointer flex flex-col items-center">
                <Icon name="Paperclip" size={24} className="text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Загрузить файлы</p>
              </label>

              {uploadingCount > 0 && (
                <div className="mt-2 text-sm text-blue-600">
                  Загрузка {uploadingCount} файлов...
                </div>
              )}

              {formData.attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {formData.attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <span className="text-sm truncate">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveAttachment(index)}
                      >
                        <Icon name="X" size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <Label>Отделы</Label>
            <p className="text-sm text-gray-500 mb-2">
              Выберите отделы, которым будет доступен материал
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {departments.map((dept) => (
                <Button
                  key={dept}
                  type="button"
                  variant={selectedDepartments.includes(dept) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onDepartmentToggle(dept)}
                  className={selectedDepartments.includes(dept) 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}
                >
                  {dept}
                </Button>
              ))}
            </div>
            {selectedDepartments.length === 0 && (
              <p className="text-xs text-amber-600 mt-2">
                ⚠️ Не выбран ни один отдел - материал будет доступен всем
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_published"
              checked={formData.is_published}
              onChange={(e) => onFormChange('is_published', e.target.checked)}
            />
            <Label htmlFor="is_published">Опубликовать материал</Label>
          </div>

          <div className="flex gap-2">
            <Button onClick={onSubmit} className="flex-1">
              {isEditing ? 'Сохранить изменения' : 'Создать материал'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};