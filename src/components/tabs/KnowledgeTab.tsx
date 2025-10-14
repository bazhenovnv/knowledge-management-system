import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { databaseService, DatabaseKnowledgeMaterial, FileAttachment } from "@/utils/databaseService";
import { toast } from "sonner";
import { useDepartments } from "@/hooks/useDepartments";

interface KnowledgeTabProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  userRole?: string;
  currentUserId?: number;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'hard':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getDifficultyLabel = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return 'Легкий';
    case 'medium':
      return 'Средний';
    case 'hard':
      return 'Сложный';
    default:
      return difficulty;
  }
};

export const KnowledgeTab = ({
  searchQuery,
  setSearchQuery,
  userRole,
  currentUserId,
}: KnowledgeTabProps) => {
  const departmentsFromHook = useDepartments();
  const [materials, setMaterials] = useState<DatabaseKnowledgeMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string[]>([]);
  const [viewingMaterial, setViewingMaterial] = useState<DatabaseKnowledgeMaterial | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<DatabaseKnowledgeMaterial | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    duration: '',
    tags: '',
    is_published: true,
    cover_image: '',
    attachments: [] as FileAttachment[],
  });

  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');
  
  const departments = departmentsFromHook;

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const materialsFromDB = await databaseService.getKnowledgeMaterials();
      setMaterials(materialsFromDB);
    } catch (error) {
      console.error('Ошибка загрузки материалов:', error);
      toast.error('Ошибка загрузки материалов');
    } finally {
      setLoading(false);
    }
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = !searchQuery || 
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const materialDepartments = material.category ? material.category.split(', ').map(d => d.trim()) : [];
    const matchesDepartment = selectedDepartmentFilter.length === 0 || 
      selectedDepartmentFilter.some(dept => materialDepartments.includes(dept));
    
    return matchesSearch && matchesDepartment && material.is_published;
  });

  const allDepartments = departmentsFromHook.sort();

  const canEditMaterial = (userRole === 'admin' || userRole === 'teacher');

  const handleCreateMaterial = () => {
    setIsCreating(true);
    setFormData({
      title: '',
      description: '',
      content: '',
      category: '',
      difficulty: 'medium',
      duration: '1 час',
      tags: '',
      is_published: true,
      cover_image: '',
      attachments: [],
    });
    setSelectedDepartments([]);
    setCoverImagePreview('');
  };

  const handleEditMaterial = (material: DatabaseKnowledgeMaterial) => {
    setEditingMaterial(material);
    setFormData({
      title: material.title,
      description: material.description,
      content: material.content,
      category: material.category,
      difficulty: material.difficulty,
      duration: material.duration || '1 час',
      tags: material.tags.join(', '),
      is_published: material.is_published,
      cover_image: material.cover_image || '',
      attachments: material.attachments || [],
    });
    setSelectedDepartments(material.category ? material.category.split(', ') : []);
    setCoverImagePreview(material.cover_image || '');
  };

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Размер файла не должен превышать 5 МБ');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setCoverImagePreview(base64);
        setFormData({ ...formData, cover_image: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: FileAttachment[] = [];
    let processedFiles = 0;

    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`Файл ${file.name} превышает 10 МБ`);
        processedFiles++;
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        newAttachments.push({
          name: file.name,
          url: base64,
          type: file.type,
          size: file.size,
        });
        processedFiles++;

        if (processedFiles === files.length) {
          setFormData(prev => ({
            ...prev,
            attachments: [...prev.attachments, ...newAttachments],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveAttachment = (index: number) => {
    const newAttachments = formData.attachments.filter((_, i) => i !== index);
    setFormData({ ...formData, attachments: newAttachments });
  };

  const handleSaveMaterial = async () => {
    try {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      const categoryString = selectedDepartments.join(', ');
      
      if (editingMaterial) {
        await databaseService.updateKnowledgeMaterial(editingMaterial.id, {
          ...formData,
          category: categoryString,
          tags: tagsArray,
        });
        toast.success('Материал обновлен');
      } else {
        await databaseService.createKnowledgeMaterial({
          ...formData,
          category: categoryString,
          tags: tagsArray,
          created_by: `User ${currentUserId}`,
        });
        toast.success('Материал создан');
      }
      
      await loadMaterials();
      setIsCreating(false);
      setEditingMaterial(null);
    } catch (error) {
      console.error('Ошибка сохранения материала:', error);
      toast.error('Ошибка сохранения материала');
    }
  };

  const handleDeleteMaterial = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот материал?')) return;
    
    try {
      await databaseService.deleteKnowledgeMaterial(id);
      toast.success('Материал удален');
      await loadMaterials();
    } catch (error) {
      console.error('Ошибка удаления материала:', error);
      toast.error('Ошибка удаления материала');
    }
  };

  const closeModal = () => {
    setIsCreating(false);
    setEditingMaterial(null);
    setCoverImagePreview('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Icon name="Loader2" size={32} className="animate-spin mx-auto mb-4" />
          <p>Загрузка материалов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">База знаний</h2>
        {canEditMaterial && (
          <Button
            onClick={handleCreateMaterial}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Icon name="Plus" size={20} className="mr-2" />
            Добавить материал
          </Button>
        )}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Search" size={20} />
            Поиск по базе знаний
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="relative">
              <Icon
                name="Search"
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <Input
                type="text"
                placeholder="Поиск материалов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Filter" size={20} />
            Фильтр по отделам
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {allDepartments.map((dept) => (
              <Badge
                key={dept}
                variant={selectedDepartmentFilter.includes(dept) ? "default" : "outline"}
                className="cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={() => {
                  if (selectedDepartmentFilter.includes(dept)) {
                    setSelectedDepartmentFilter(selectedDepartmentFilter.filter(d => d !== dept));
                  } else {
                    setSelectedDepartmentFilter([...selectedDepartmentFilter, dept]);
                  }
                }}
              >
                {dept}
              </Badge>
            ))}
            {selectedDepartmentFilter.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedDepartmentFilter([])}
                className="ml-2"
              >
                <Icon name="X" size={16} className="mr-1" />
                Сбросить
              </Button>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="secondary">
              Найдено: {filteredMaterials.length}
            </Badge>
            {selectedDepartmentFilter.length > 0 && (
              <span className="text-sm text-gray-600">
                (фильтр: {selectedDepartmentFilter.join(', ')})
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            {item.cover_image && (
              <div className="w-full h-48 overflow-hidden rounded-t-lg">
                <img
                  src={item.cover_image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <Badge className={getDifficultyColor(item.difficulty)}>
                  {getDifficultyLabel(item.difficulty)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{item.category}</span>
                <span>{item.duration}</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-4">
                {item.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              {item.attachments && item.attachments.length > 0 && (
                <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                  <Icon name="Paperclip" size={14} />
                  <span>{item.attachments.length} файлов</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon
                    name="Star"
                    size={16}
                    className="text-yellow-500 fill-current"
                  />
                  <span className="text-sm">{Number(item.rating || 0).toFixed(1)}</span>
                  <span className="text-sm text-gray-500">
                    ({item.enrollments || 0})
                  </span>
                </div>
                <div className="flex gap-2">
                  {canEditMaterial && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditMaterial(item)}
                      >
                        <Icon name="Edit" size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteMaterial(item.id)}
                      >
                        <Icon name="Trash2" size={14} />
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={() => setViewingMaterial(item)}
                  >
                    <Icon name="BookOpen" size={14} className="mr-1" />
                    Изучить
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="text-center py-12">
          <Icon name="BookOpen" size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Материалы не найдены
          </h3>
          <p className="text-gray-600 mb-4">
            Попробуйте изменить критерии поиска
          </p>
        </div>
      )}

      {viewingMaterial && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{viewingMaterial.title}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <Badge className={getDifficultyColor(viewingMaterial.difficulty)}>
                    {getDifficultyLabel(viewingMaterial.difficulty)}
                  </Badge>
                  <span className="text-sm text-gray-600">{viewingMaterial.category}</span>
                  <span className="text-sm text-gray-600">{viewingMaterial.duration}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewingMaterial(null)}
              >
                <Icon name="X" size={20} />
              </Button>
            </div>
            <div className="p-6">
              {viewingMaterial.cover_image && (
                <img
                  src={viewingMaterial.cover_image}
                  alt={viewingMaterial.title}
                  className="w-full max-h-96 object-cover rounded-lg mb-6"
                />
              )}
              <div className="prose max-w-none">
                <p className="text-gray-600 mb-6">{viewingMaterial.description}</p>
                <div className="whitespace-pre-wrap mb-6">{viewingMaterial.content}</div>
              </div>
              
              {viewingMaterial.attachments && viewingMaterial.attachments.length > 0 && (
                <div className="mt-6 border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Прикрепленные файлы</h3>
                  <div className="space-y-2">
                    {viewingMaterial.attachments.map((file, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50">
                        <Icon name="File" size={20} className="text-gray-500" />
                        <div className="flex-1">
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {(file.size / 1024).toFixed(1)} КБ
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = file.url;
                            link.download = file.name;
                            link.click();
                          }}
                        >
                          <Icon name="Download" size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {(isCreating || editingMaterial) && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {editingMaterial ? 'Редактировать материал' : 'Создать материал'}
              </h2>
              <Button variant="ghost" size="sm" onClick={closeModal}>
                <Icon name="X" size={20} />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Обложка материала</label>
                <div className="border-2 border-dashed rounded-lg p-4">
                  {coverImagePreview ? (
                    <div className="relative">
                      <img
                        src={coverImagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setCoverImagePreview('');
                          setFormData({ ...formData, cover_image: '' });
                        }}
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Icon name="Image" size={32} className="mx-auto mb-2 text-gray-400" />
                      <label className="cursor-pointer text-blue-600 hover:text-blue-700">
                        Загрузить обложку (до 5 МБ)
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleCoverImageUpload}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Название *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Введите название материала"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Описание *</label>
                <textarea
                  className="w-full border rounded px-3 py-2 min-h-[80px]"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Краткое описание материала"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Содержание *</label>
                <textarea
                  className="w-full border rounded px-3 py-2 min-h-[200px]"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Полное содержание материала"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Отделы * (выберите один или несколько)</label>
                <div className="border rounded px-3 py-2 max-h-48 overflow-y-auto">
                  {departments.map((dept) => (
                    <div key={dept} className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        id={`dept-${dept}`}
                        checked={selectedDepartments.includes(dept)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDepartments([...selectedDepartments, dept]);
                          } else {
                            setSelectedDepartments(selectedDepartments.filter(d => d !== dept));
                          }
                        }}
                      />
                      <label htmlFor={`dept-${dept}`} className="text-sm cursor-pointer">
                        {dept}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedDepartments.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedDepartments.map((dept) => (
                      <Badge key={dept} variant="secondary" className="text-xs">
                        {dept}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Сложность</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                  >
                    <option value="easy">Легкий</option>
                    <option value="medium">Средний</option>
                    <option value="hard">Сложный</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Теги</label>
                  <Input
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="Через запятую: React, TypeScript"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Прикрепленные файлы</label>
                <div className="space-y-2">
                  {formData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded">
                      <Icon name="File" size={20} className="text-gray-500" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(1)} КБ
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveAttachment(index)}
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  ))}
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    <Icon name="Paperclip" size={24} className="mx-auto mb-2 text-gray-400" />
                    <label className="cursor-pointer text-blue-600 hover:text-blue-700">
                      Добавить файлы (до 10 МБ каждый)
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                />
                <label htmlFor="is_published" className="text-sm font-medium">
                  Опубликовать материал
                </label>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={closeModal}>
                  Отмена
                </Button>
                <Button
                  onClick={handleSaveMaterial}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={!formData.title || !formData.description || !formData.content || selectedDepartments.length === 0}
                >
                  {editingMaterial ? 'Сохранить' : 'Создать'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};