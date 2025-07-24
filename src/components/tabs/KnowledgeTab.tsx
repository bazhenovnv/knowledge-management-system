import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { database, KnowledgeMaterial } from "@/utils/database";
import { toast } from "sonner";
import { getDifficultyColor } from "@/utils/statusUtils";
import { MaterialForm } from "@/components/forms/MaterialForm";
import { DeleteConfirmation } from "@/components/ui/delete-confirmation";
import { MaterialViewer } from "@/components/dialogs/MaterialViewer";
import { TestFromMaterialForm } from "@/components/forms/TestFromMaterialForm";

interface KnowledgeTabProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  userRole?: string;
  onSwitchToTests?: () => void;
}

export const KnowledgeTab = ({
  searchQuery,
  setSearchQuery,
  userRole,
}: KnowledgeTabProps) => {
  const [materials, setMaterials] = useState<KnowledgeMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // Состояние для формы материала
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<KnowledgeMaterial | null>(null);
  
  // Состояние для удаления
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<KnowledgeMaterial | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Состояние для просмотра материала
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewingMaterial, setViewingMaterial] = useState<KnowledgeMaterial | null>(null);
  
  // Состояние для создания теста
  const [testFormOpen, setTestFormOpen] = useState(false);
  const [testMaterial, setTestMaterial] = useState<KnowledgeMaterial | null>(null);

  // Загружаем материалы из базы данных
  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = () => {
    try {
      const materialsFromDB = database.getKnowledgeMaterials();
      setMaterials(materialsFromDB);
      setLoading(false);
    } catch (error) {
      console.error('Ошибка загрузки материалов:', error);
      toast.error('Ошибка загрузки материалов');
      setLoading(false);
    }
  };

  // Фильтрация материалов
  const filteredMaterials = materials.filter(material => {
    const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && material.isPublished;
  });

  // Получаем уникальные категории
  const categories = ['all', ...new Set(materials.map(m => m.category))];

  // Обработчики действий
  const handleCreateMaterial = () => {
    setEditingMaterial(null);
    setIsFormOpen(true);
  };

  const handleEditMaterial = (material: KnowledgeMaterial) => {
    setEditingMaterial(material);
    setIsFormOpen(true);
  };

  const handleDeleteMaterial = (material: KnowledgeMaterial) => {
    setMaterialToDelete(material);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!materialToDelete) return;

    setDeleting(true);
    try {
      const success = database.deleteKnowledgeMaterial(materialToDelete.id);
      if (success) {
        toast.success('Материал успешно удален');
        loadMaterials(); // Перезагружаем список
      } else {
        toast.error('Не удалось удалить материал');
      }
    } catch (error) {
      console.error('Ошибка удаления материала:', error);
      toast.error('Ошибка при удалении материала');
    } finally {
      setDeleting(false);
      setDeleteConfirmOpen(false);
      setMaterialToDelete(null);
    }
  };

  const handleFormSave = () => {
    loadMaterials(); // Перезагружаем список после сохранения
  };

  const handleStudyMaterial = (material: KnowledgeMaterial) => {
    setViewingMaterial(material);
    setViewerOpen(true);
  };
  
  const handleCreateTest = (material: KnowledgeMaterial) => {
    setTestMaterial(material);
    setTestFormOpen(true);
  };
  
  const handleTestCreated = () => {
    toast.success('Тест создан! Переходим к разделу тестов...');
    if (onSwitchToTests) {
      onSwitchToTests();
    }
  };

  const canEditMaterial = (userRole === 'admin' || userRole === 'teacher');

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
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">База знаний</h2>
        <div className="flex items-center space-x-4">
          {canEditMaterial && (
            <Button 
              onClick={handleCreateMaterial}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить материал
            </Button>
          )}
        </div>
      </div>

      {/* Поиск и фильтры */}
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
      </div>

      {/* Список материалов */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow card-hover">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={getDifficultyColor(item.difficulty)}>
                    {item.difficulty}
                  </Badge>
                  {canEditMaterial && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        title="Редактировать материал"
                        onClick={() => handleEditMaterial(item)}
                      >
                        <Icon name="Edit" size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Удалить материал"
                        onClick={() => handleDeleteMaterial(item)}
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{item.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{item.category}</span>
                <span>{item.duration}</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-4">
                {item.tags.map((tag, index) => (
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
                  <span className="text-sm">{item.rating}</span>
                  <span className="text-sm text-gray-500">
                    ({item.enrollments})
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 gradient-button"
                    onClick={() => handleStudyMaterial(item)}
                  >
                    Изучить
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-purple-500 text-purple-600 hover:bg-purple-50"
                    onClick={() => canEditMaterial ? handleCreateTest(item) : handleStudyMaterial(item)}
                  >
                    <Icon name="FileText" size={14} className="mr-1" />
                    {canEditMaterial ? 'Создать тест' : 'Пройти тест'}
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
            Попробуйте изменить критерии поиска или добавьте новый материал.
          </p>
          {canEditMaterial && (
            <Button 
              onClick={handleCreateMaterial}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить материал
            </Button>
          )}
        </div>
      )}

      {/* Форма создания/редактирования материала */}
      <MaterialForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingMaterial(null);
        }}
        material={editingMaterial}
        onSave={handleFormSave}
      />

      {/* Диалог подтверждения удаления */}
      <DeleteConfirmation
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setMaterialToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Удалить материал"
        description={`Вы уверены, что хотите удалить материал "${materialToDelete?.title}"? Это действие нельзя отменить.`}
        itemName="материал"
        loading={deleting}
      />
      
      {/* Просмотр материала */}
      <MaterialViewer
        isOpen={viewerOpen}
        onClose={() => {
          setViewerOpen(false);
          setViewingMaterial(null);
        }}
        material={viewingMaterial}
        userRole={userRole}
        onCreateTest={handleCreateTest}
      />
      
      {/* Создание теста из материала */}
      <TestFromMaterialForm
        isOpen={testFormOpen}
        onClose={() => {
          setTestFormOpen(false);
          setTestMaterial(null);
        }}
        material={testMaterial}
        onSuccess={handleTestCreated}
      />
    </div>
  );
};