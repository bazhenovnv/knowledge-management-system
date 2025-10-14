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
}: KnowledgeTabProps) => {
  const [materials, setMaterials] = useState<DatabaseKnowledgeMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewingMaterial, setViewingMaterial] = useState<DatabaseKnowledgeMaterial | null>(null);

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

  // Фильтрация материалов
  const filteredMaterials = materials.filter(material => {
    const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && material.is_published;
  });

  // Получаем уникальные категории
  const categories = ['all', ...new Set(materials.map(m => m.category))];

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
        <Badge variant="secondary">
          Найдено: {filteredMaterials.length}
        </Badge>
      </div>

      {/* Список материалов */}
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
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={() => setViewingMaterial(item)}
                >
                  <Icon name="BookOpen" size={14} className="mr-1" />
                  Изучить
                </Button>
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

      {/* Просмотр материала */}
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
    </div>
  );
};
