import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";

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
}

export const MaterialPreview = ({ material, isOpen, onClose }: MaterialPreviewProps) => {
  if (!material) return null;

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
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                size="lg"
              >
                <Icon name="FileText" size={20} className="mr-2" />
                Пройти тест по данной теме
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};