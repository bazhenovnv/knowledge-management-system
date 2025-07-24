import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";
import { KnowledgeMaterial, Test, getTests } from "@/utils/database";
import { createTestFromMaterial, findBestTestForMaterial } from "@/utils/testGenerator";
import { toast } from "sonner";

interface MaterialPreviewProps {
  material: {
    title: string;
    category: string;
    content: string;
    mediaFiles: Array<{
      id: string;
      name: string;
      type: "image" | "video";
      url: string;
    }>;
  };
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
}

export const MaterialPreview = ({ material, isOpen, onClose, userRole }: MaterialPreviewProps) => {
  if (!material) return null;

  const handleTestAction = () => {
    if (userRole === 'admin' || userRole === 'teacher') {
      // Администратор/преподаватель создает тест
      handleCreateTestFromMaterial();
    } else {
      // Сотрудник запускает прохождение теста
      handleStartTestFromMaterial();
    }
  };

  const handleCreateTestFromMaterial = () => {
    const newTest = createTestFromMaterial(material, 'current-user', userRole || 'admin');
    
    // Сохраняем тест как черновик
    const tests = getTests();
    tests.push(newTest);
    localStorage.setItem('tests_db', JSON.stringify(tests));
    
    toast.success(`Создан черновик теста: ${newTest.title}`);
    toast.info('Тест создан в разделе "Тесты". Заполните вопросы и опубликуйте тест.');
    
    onClose();
  };

  const handleStartTestFromMaterial = () => {
    const tests = getTests();
    const matchingTest = findBestTestForMaterial(tests, material);
    
    if (matchingTest) {
      if (matchingTest.status === 'published') {
        toast.success(`Запускаем тест: ${matchingTest.title}`);
        // Здесь можно добавить логику запуска теста
        onClose();
      } else {
        toast.warning('Тест по данной теме еще не опубликован');
      }
    } else {
      toast.info('Тест по данной теме пока не создан');
    }
  };

  const renderMediaFile = (file: any, index: number) => {
    if (file.type === 'image') {
      return (
        <div key={file.id} className="mb-4">
          <img
            src={file.url}
            alt={file.name}
            className="max-w-full h-auto rounded-lg shadow-md"
          />
          <p className="text-sm text-gray-600 mt-2 text-center">{file.name}</p>
        </div>
      );
    } else if (file.type === 'video') {
      return (
        <div key={file.id} className="mb-4">
          <video
            src={file.url}
            controls
            className="max-w-full h-auto rounded-lg shadow-md"
          >
            Ваш браузер не поддерживает видео.
          </video>
          <p className="text-sm text-gray-600 mt-2 text-center">{file.name}</p>
        </div>
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Icon name="Eye" size={20} className="mr-2" />
            Предпросмотр материала
          </DialogTitle>
        </DialogHeader>
        
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-xl">{material.title}</CardTitle>
              <Badge variant="outline" className="ml-2">
                {material.category}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Медиа файлы */}
            {material.mediaFiles.length > 0 && (
              <div className="space-y-4">
                {material.mediaFiles.map((file, index) => renderMediaFile(file, index))}
              </div>
            )}
            
            {/* Содержание материала */}
            <div className="prose max-w-none">
              <h4 className="font-semibold mb-2">Содержание материала:</h4>
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {material.content}
              </div>
            </div>
            
            {/* Кнопка для прохождения теста */}
            <div className="border-t pt-4 mt-6">
              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                size="lg"
                onClick={handleTestAction}
              >
                <Icon name="FileText" size={20} className="mr-2" />
                {userRole === 'admin' || userRole === 'teacher' ? 'Создать тест по теме' : 'Пройти тест по теме'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};