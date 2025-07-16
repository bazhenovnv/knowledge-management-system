import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";
import { database, KnowledgeMaterial, Test, getTests } from "@/utils/database";
import { toast } from "sonner";
import { getDifficultyColor } from "@/utils/statusUtils";
import { AIChat } from "@/components/ai/AIChat";
import { MaterialForm } from "@/components/materials/MaterialForm";
import { MaterialPreview } from "@/components/materials/MaterialPreview";
import { DEPARTMENTS } from "@/constants/departments";
import { createTestFromMaterial, findBestTestForMaterial } from "@/utils/testGenerator";

interface KnowledgeTabProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  userRole?: string;
}

export const KnowledgeTab = ({
  searchQuery,
  setSearchQuery,
  userRole,
}: KnowledgeTabProps) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [previewMaterial, setPreviewMaterial] = useState<KnowledgeMaterial | null>(null);
  const [materials, setMaterials] = useState<KnowledgeMaterial[]>([]);
  const [studyMaterial, setStudyMaterial] = useState<KnowledgeMaterial | null>(null);
  const [testMaterial, setTestMaterial] = useState<KnowledgeMaterial | null>(null);
  const [loading, setLoading] = useState(true);

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

  // Функция создания материала
  const handleCreateMaterial = (materialData: any) => {
    try {
      const newMaterial = database.saveKnowledgeMaterial({
        title: materialData.title,
        description: materialData.description,
        content: materialData.content || '',
        category: materialData.category,
        difficulty: materialData.difficulty || 'Начинающий',
        duration: materialData.duration || '1 час',
        rating: 0,
        enrollments: 0,
        tags: materialData.tags || [],
        createdBy: 'Текущий пользователь', // В реальном приложении - из контекста
        isPublished: true,
        department: materialData.department
      });
      
      loadMaterials(); // Перезагружаем список
      setIsFormOpen(false);
      toast.success('Материал создан успешно!');
    } catch (error) {
      console.error('Ошибка создания материала:', error);
      toast.error('Ошибка создания материала');
    }
  };

  // Функция удаления материала
  const handleDeleteMaterial = (materialId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот материал?')) {
      try {
        const success = database.deleteKnowledgeMaterial(materialId);
        if (success) {
          loadMaterials();
          toast.success('Материал удален');
        } else {
          toast.error('Материал не найден');
        }
      } catch (error) {
        console.error('Ошибка удаления материала:', error);
        toast.error('Ошибка удаления материала');
      }
    }
  };

  // Функция изучения материала
  const handleStudyMaterial = (material: KnowledgeMaterial) => {
    try {
      database.incrementEnrollments(material.id);
      setStudyMaterial(material);
      loadMaterials(); // Обновляем счетчик записей
      toast.success(`Начинаем изучение: ${material.title}`);
    } catch (error) {
      console.error('Ошибка при записи на материал:', error);
      toast.error('Ошибка при записи на материал');
    }
  };

  // Фильтрация материалов
  const filteredMaterials = materials.filter(material => {
    const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      material.createdBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch && material.isPublished;
  });

  // Функция прохождения теста
  const handleTakeMaterialTest = (material: KnowledgeMaterial) => {
    if (userRole === 'admin' || userRole === 'teacher') {
      // Администратор/преподаватель создает тест
      handleCreateTestFromMaterial(material);
    } else {
      // Сотрудник запускает прохождение теста
      handleStartTestFromMaterial(material);
    }
  };

  const handleCreateTestFromMaterial = (material: KnowledgeMaterial) => {
    const newTest = createTestFromMaterial(material, 'current-user', userRole || 'admin');
    
    // Сохраняем тест как черновик
    const tests = getTests();
    tests.push(newTest);
    localStorage.setItem('tests_db', JSON.stringify(tests));
    
    toast.success(`Создан черновик теста: ${newTest.title}`);
    toast.info('Тест создан в разделе "Тесты". Заполните вопросы и опубликуйте тест.');
    
    // Можно добавить переход к разделу тестов
    // setCurrentTab('tests');
  };

  const handleStartTestFromMaterial = (material: KnowledgeMaterial) => {
    const tests = getTests();
    const matchingTest = findBestTestForMaterial(tests, material);
    
    if (matchingTest) {
      if (matchingTest.status === 'published') {
        toast.success(`Запускаем тест: ${matchingTest.title}`);
        setTestMaterial(material);
        // Здесь можно добавить логику запуска теста
      } else {
        toast.warning('Тест по данной теме еще не опубликован');
      }
    } else {
      toast.info('Тест по данной теме пока не создан');
    }
  };

  // Получаем уникальные категории
  const categories = ['all', ...new Set(materials.map(m => m.category))];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Icon name="Loader2" className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Загрузка базы знаний...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">База знаний</h2>
        <div className="flex items-center space-x-4">
          {userRole !== "employee" && (
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Icon name="Plus" size={16} className="mr-2" />
                  Добавить материал
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Добавить новый материал</DialogTitle>
                </DialogHeader>
                <MaterialForm 
                  categories={categories}
                  onSubmit={handleCreateMaterial}
                  onCancel={() => setIsFormOpen(false)}
                  onPreview={(material) => setPreviewMaterial(material)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
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
                placeholder="Поиск по базе знаний..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <AIChat />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex items-center space-x-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Все категории" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все категории</SelectItem>
            {categories.filter(cat => cat !== 'all').map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-sm text-gray-600">
          Найдено: {filteredMaterials.length} материалов
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <Badge className={getDifficultyColor(item.difficulty)}>
                  {item.difficulty}
                </Badge>
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
                    onClick={() => handleStudyMaterial(item)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Изучить
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTakeMaterialTest(item)}
                    className="border-green-500 text-green-600 hover:bg-green-50"
                  >
                    <Icon name="FileText" size={14} className="mr-1" />
                    {userRole === 'admin' || userRole === 'teacher' ? 'Создать тест' : 'Пройти тест'}
                  </Button>
                  {(userRole === 'admin' || userRole === 'teacher') && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditMaterial(item)}
                        className="border-blue-500 text-blue-600 hover:bg-blue-50"
                      >
                        <Icon name="Edit" size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteMaterial(item.id)}
                        className="border-red-500 text-red-600 hover:bg-red-50"
                      >
                        <Icon name="Trash2" size={14} />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Предпросмотр материала */}
      {previewMaterial && (
        <MaterialPreview
          material={previewMaterial}
          isOpen={!!previewMaterial}
          onClose={() => setPreviewMaterial(null)}
          userRole={userRole}
        />
      )}

      {/* Модальное окно для изучения материала */}
      {studyMaterial && (
        <Dialog open={!!studyMaterial} onOpenChange={() => setStudyMaterial(null)}>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Icon name="BookOpen" size={20} />
                {studyMaterial.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Badge className={getDifficultyColor(studyMaterial.difficulty)}>
                  {studyMaterial.difficulty}
                </Badge>
                <span className="text-sm text-gray-600">{studyMaterial.duration}</span>
                <span className="text-sm text-gray-600">{studyMaterial.category}</span>
              </div>
              <p className="text-gray-700">{studyMaterial.description}</p>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Содержание материала:</h4>
                <div className="whitespace-pre-wrap text-sm">
                  {studyMaterial.content || 'Материал содержания не заполнен'}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStudyMaterial(null)}
                >
                  Закрыть
                </Button>
                <Button
                  onClick={() => {
                    setStudyMaterial(null);
                    handleTakeMaterialTest(studyMaterial);
                  }}
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                >
                  <Icon name="FileText" size={16} className="mr-2" />
                  {userRole === 'admin' || userRole === 'teacher' ? 'Создать тест' : 'Пройти тест'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Модальное окно для тестирования */}
      {testMaterial && (
        <Dialog open={!!testMaterial} onOpenChange={() => setTestMaterial(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Icon name="FileText" size={20} />
                Тест по материалу: {testMaterial.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center py-8">
                <Icon name="CheckCircle" size={48} className="mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-medium mb-2">Тест запущен!</h3>
                <p className="text-gray-600">
                  Тест по материалу "{testMaterial.title}" будет доступен в разделе Тесты.
                </p>
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={() => setTestMaterial(null)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Понятно
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};