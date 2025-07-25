import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";
import { database, KnowledgeMaterial } from "@/utils/database";
import { toast } from "sonner";
import { MediaUpload } from "@/components/materials/MediaUpload";

interface MaterialFormProps {
  isOpen: boolean;
  onClose: () => void;
  material?: KnowledgeMaterial | null;
  onSave: () => void;
}

const difficultyOptions = [
  { value: 'Начальный', label: 'Начальный', color: 'bg-green-100 text-green-800' },
  { value: 'Средний', label: 'Средний', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'Продвинутый', label: 'Продвинутый', color: 'bg-red-100 text-red-800' }
];

const categoryOptions = [
  'Программирование',
  'Дизайн',
  'Маркетинг',
  'Менеджмент',
  'Аналитика',
  'DevOps',
  'Тестирование',
  'UX/UI',
  'Безопасность',
  'Базы данных'
];

export const MaterialForm = ({
  isOpen,
  onClose,
  material,
  onSave
}: MaterialFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: '',
    difficulty: 'Начальный',
    duration: '',
    tags: '',
    isPublished: true,
    mediaFiles: [] as Array<{
      id: string;
      name: string;
      type: "image" | "video";
      url: string;
      size: number;
    }>
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Заполняем форму при редактировании
  useEffect(() => {
    if (material) {
      setFormData({
        title: material.title,
        description: material.description,
        content: material.content,
        category: material.category,
        difficulty: material.difficulty,
        duration: material.duration,
        tags: material.tags.join(', '),
        isPublished: material.isPublished,
        mediaFiles: material.mediaFiles || []
      });
    } else {
      // Сброс формы при создании нового материала
      setFormData({
        title: '',
        description: '',
        content: '',
        category: '',
        difficulty: 'Начальный',
        duration: '',
        tags: '',
        isPublished: true,
        mediaFiles: []
      });
    }
    setErrors({});
  }, [material, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Название обязательно';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Описание обязательно';
    }
    if (!formData.content.trim()) {
      newErrors.content = 'Содержание обязательно';
    }
    if (!formData.category) {
      newErrors.category = 'Выберите категорию';
    }
    if (!formData.duration.trim()) {
      newErrors.duration = 'Укажите продолжительность';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const materialData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        content: formData.content.trim(),
        category: formData.category,
        difficulty: formData.difficulty as 'Начальный' | 'Средний' | 'Продвинутый',
        duration: formData.duration.trim(),
        tags: tagsArray,
        isPublished: formData.isPublished,
        mediaFiles: formData.mediaFiles,
        updatedAt: new Date().toISOString()
      };

      if (material) {
        // Редактирование существующего материала
        database.updateKnowledgeMaterial(material.id, materialData);
        toast.success('Материал успешно обновлен');
      } else {
        // Создание нового материала
        database.addKnowledgeMaterial({
          ...materialData,
          id: Date.now().toString(),
          rating: 0,
          enrollments: 0,
          createdAt: new Date().toISOString()
        });
        toast.success('Материал успешно создан');
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Ошибка сохранения материала:', error);
      toast.error('Ошибка при сохранении материала');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Очищаем ошибку для этого поля
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleMediaChange = (files: any[]) => {
    setFormData(prev => ({
      ...prev,
      mediaFiles: files
    }));
  };

  const isEditing = !!material;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name={isEditing ? "Edit" : "Plus"} size={20} />
            {isEditing ? 'Редактировать материал' : 'Добавить новый материал'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Основная информация */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Основная информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Название материала *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Введите название материала"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
                </div>

                <div>
                  <Label htmlFor="description">Краткое описание *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Краткое описание материала"
                    rows={3}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
                </div>

                <div>
                  <Label htmlFor="category">Категория *</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className={`w-full border rounded px-3 py-2 ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Выберите категорию</option>
                    {categoryOptions.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
                </div>

                <div>
                  <Label htmlFor="difficulty">Уровень сложности</Label>
                  <select
                    id="difficulty"
                    value={formData.difficulty}
                    onChange={(e) => handleInputChange('difficulty', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    {difficultyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="duration">Продолжительность *</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    placeholder="например: 2 часа, 45 минут"
                    className={errors.duration ? 'border-red-500' : ''}
                  />
                  {errors.duration && <p className="text-sm text-red-500 mt-1">{errors.duration}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Дополнительная информация */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Дополнительно</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="tags">Теги</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    placeholder="Теги через запятую: React, JavaScript, Frontend"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Разделяйте теги запятой
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={formData.isPublished}
                    onChange={(e) => handleInputChange('isPublished', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="isPublished">Опубликовать материал</Label>
                </div>

                {/* Предварительный просмотр тегов */}
                {formData.tags && (
                  <div>
                    <Label>Предварительный просмотр тегов:</Label>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.tags
                        .split(',')
                        .map(tag => tag.trim())
                        .filter(tag => tag.length > 0)
                        .map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Медиафайлы */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon name="Image" size={20} />
                Медиафайлы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MediaUpload
                files={formData.mediaFiles}
                onFilesChange={handleMediaChange}
              />
              <p className="text-sm text-gray-500 mt-2">
                Добавьте изображения и видео для лучшего восприятия материала
              </p>
            </CardContent>
          </Card>

          {/* Содержание материала */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Содержание материала</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="content">Полное содержание *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Подробное содержание материала..."
                  rows={8}
                  className={errors.content ? 'border-red-500' : ''}
                />
                {errors.content && <p className="text-sm text-red-500 mt-1">{errors.content}</p>}
                <p className="text-sm text-gray-500 mt-1">
                  Вы можете использовать Markdown для форматирования
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Кнопки действий */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Icon name="Save" size={16} className="mr-2" />
                  {isEditing ? 'Обновить' : 'Создать'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};