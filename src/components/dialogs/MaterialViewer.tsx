import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";
import { KnowledgeMaterial, database } from "@/utils/database";
import { getDifficultyColor } from "@/utils/statusUtils";
import { toast } from "sonner";

interface MaterialViewerProps {
  isOpen: boolean;
  onClose: () => void;
  material: KnowledgeMaterial | null;
  userRole?: string;
  onCreateTest?: (material: KnowledgeMaterial) => void;
}

export const MaterialViewer = ({
  isOpen,
  onClose,
  material,
  userRole,
  onCreateTest
}: MaterialViewerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen && material) {
      // Увеличиваем счетчик просмотров при открытии
      database.incrementEnrollments(material.id);
      
      // Имитация прогресса чтения
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 1;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isOpen, material]);

  const handleCreateTest = () => {
    if (material && onCreateTest) {
      onCreateTest(material);
      toast.success('Переход к созданию теста...');
    }
  };

  const handleMarkComplete = () => {
    setIsLoading(true);
    setTimeout(() => {
      toast.success('Материал изучен! Отличная работа!');
      setIsLoading(false);
      onClose();
    }, 1000);
  };

  if (!material) return null;

  const canCreateTest = userRole === 'admin' || userRole === 'teacher';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Icon name="BookOpen" size={24} className="text-blue-600" />
            {material.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Заголовок и метаинформация */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-xl">{material.title}</CardTitle>
                  <p className="text-gray-600">{material.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={getDifficultyColor(material.difficulty)}>
                    {material.difficulty}
                  </Badge>
                  <div className="text-sm text-gray-500 text-right">
                    <div className="flex items-center gap-1">
                      <Icon name="Clock" size={14} />
                      {material.duration}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Icon name="Users" size={14} />
                      {material.enrollments} изучали
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  {material.category}
                </span>
                <div className="flex items-center gap-2">
                  <Icon name="Star" size={16} className="text-yellow-500 fill-current" />
                  <span>{material.rating}/5</span>
                </div>
              </div>
              
              {/* Теги */}
              <div className="flex flex-wrap gap-1">
                {material.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Прогресс чтения */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Прогресс изучения</span>
                <span className="text-sm text-gray-600">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Содержание материала */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="FileText" size={20} />
                Содержание
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {material.content}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Дополнительные материалы */}
          {material.attachments && material.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Paperclip" size={20} />
                  Дополнительные материалы
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {material.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <Icon name="File" size={20} className="text-gray-400" />
                        <div>
                          <p className="font-medium">{attachment.name}</p>
                          <p className="text-sm text-gray-600">{attachment.type}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="hover:scale-105 transition-transform">
                        <Icon name="Download" size={16} className="mr-1" />
                        Скачать
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Действия */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="hover:scale-105 transition-transform"
              >
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Назад к списку
              </Button>
              
              {canCreateTest && (
                <Button
                  onClick={handleCreateTest}
                  variant="outline"
                  className="border-purple-500 text-purple-600 hover:bg-purple-50 hover:scale-105 transition-all"
                >
                  <Icon name="FileText" size={16} className="mr-2" />
                  Создать тест по материалу
                </Button>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleMarkComplete}
                disabled={isLoading || progress < 100}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:scale-105 transition-all"
              >
                {isLoading ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Завершение...
                  </>
                ) : progress < 100 ? (
                  <>
                    <Icon name="BookOpen" size={16} className="mr-2" />
                    Продолжить изучение
                  </>
                ) : (
                  <>
                    <Icon name="CheckCircle" size={16} className="mr-2" />
                    Завершить изучение
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};