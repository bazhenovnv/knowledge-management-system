import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
          <Dialog>
            <DialogTrigger asChild>
              <div className="cursor-pointer relative group overflow-hidden rounded-lg">
                <img
                  src={file.url}
                  alt={file.name}
                  className="max-w-full h-auto rounded-lg shadow-md transition-transform hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                  <Icon name="ZoomIn" size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[95vh] p-0">
              <div className="flex items-center justify-center p-4">
                <img
                  src={file.url}
                  alt={file.name}
                  className="max-w-full max-h-[85vh] object-contain"
                />
              </div>
              <div className="p-4 border-t bg-gray-50">
                <p className="font-medium text-center">{file.name}</p>
              </div>
            </DialogContent>
          </Dialog>
          <p className="text-sm text-gray-600 mt-2 text-center">{file.name}</p>
        </div>
      );
    } else if (file.type === 'video') {
      return (
        <div key={file.id} className="mb-4">
          <Dialog>
            <DialogTrigger asChild>
              <div className="cursor-pointer relative group overflow-hidden rounded-lg">
                <video
                  src={file.url}
                  className="max-w-full h-auto rounded-lg shadow-md"
                  muted
                >
                  Ваш браузер не поддерживает видео.
                </video>
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <Icon name="Play" size={32} className="text-white" />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity" />
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[95vh] p-0">
              <div className="flex items-center justify-center p-4">
                <video
                  src={file.url}
                  className="max-w-full max-h-[80vh] object-contain"
                  controls
                  autoPlay
                >
                  Ваш браузер не поддерживает видео.
                </video>
              </div>
              <div className="p-4 border-t bg-gray-50">
                <p className="font-medium text-center">{file.name}</p>
              </div>
            </DialogContent>
          </Dialog>
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