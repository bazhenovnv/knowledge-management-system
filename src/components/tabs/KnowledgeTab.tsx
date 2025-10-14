import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { databaseService, DatabaseKnowledgeMaterial } from "@/utils/databaseService";
import { toast } from "sonner";

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
  const [materials, setMaterials] = useState<DatabaseKnowledgeMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
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
  });

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
    const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && material.is_published;
  });

  const categories = ['all', ...new Set(materials.map(m => m.category))];
  const canEditMaterial = (userRole === 'admin' || userRole === 'teacher');

  const handleCreateMaterial = () => {
    setIsCreating(true);
    setFormData({
      title: '',
      description: '',
      content: '',
      category: '',
      difficulty: 'medium',
      duration: '',
      tags: '',
      is_published: true,
    });
  };

  const handleEditMaterial = (material: DatabaseKnowledgeMaterial) => {
    setEditingMaterial(material);
    setFormData({
      title: material.title,
      description: material.description,
      content: material.content,
      category: material.category,
      difficulty: material.difficulty,
      duration: material.duration,
      tags: material.tags.join(', '),
      is_published: material.is_published,
    });
  };

  const handleSaveMaterial = async () => {
    try {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      if (editingMaterial) {
        await databaseService.updateKnowledgeMaterial(editingMaterial.id, {
          ...formData,
          tags: tagsArray,
        });
        toast.success('Материал обновлен');
      } else {
        await databaseService.createKnowledgeMaterial({
          ...formData,
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
      
      <div className="flex items-center space-x-4 mb-6">
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="all">Все категории</option>
          {categories.filter(cat => cat !== 'all').map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <Badge variant="secondary">
          Найдено: {filteredMaterials.length}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
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
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon
                    name="Star"
                    size={16}
                    className="text-yellow-500 fill-current"
                  />
                  <span className="text-sm">{item.rating.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">
                    ({item.enrollments})
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
              <div className="prose max-w-none">
                <p className="text-gray-600 mb-6">{viewingMaterial.description}</p>
                <div className="whitespace-pre-wrap">{viewingMaterial.content}</div>
              </div>
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
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Категория *</label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Например: Разработка"
                  />
                </div>
                
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
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Длительность *</label>
                  <Input
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="Например: 2 часа"
                  />
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
                  disabled={!formData.title || !formData.description || !formData.content || !formData.category || !formData.duration}
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
