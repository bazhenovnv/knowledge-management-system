import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { DatabaseKnowledgeMaterial, FileAttachment } from '@/utils/databaseService';
import { getDifficultyColor, getDifficultyLabel } from './types';

interface MaterialViewModalProps {
  material: DatabaseKnowledgeMaterial | null;
  userRole?: string;
  currentUserId?: number;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onImageClick: (url: string, attachments: FileAttachment[]) => void;
}

export const MaterialViewModal = ({
  material,
  userRole,
  currentUserId,
  onClose,
  onEdit,
  onDelete,
  onImageClick,
}: MaterialViewModalProps) => {
  if (!material) return null;

  const canEdit = userRole === 'admin' || userRole === 'teacher' || material.author_id === currentUserId;

  return (
    <div
      className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <Card
        className="max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{material.title}</CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={getDifficultyColor(material.difficulty)}>
                  {getDifficultyLabel(material.difficulty)}
                </Badge>
                <Badge variant="outline">{material.category}</Badge>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Icon name="Clock" size={14} />
                  {material.duration}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {canEdit && (
                <>
                  <Button variant="outline" size="sm" onClick={onEdit}>
                    <Icon name="Edit" size={16} />
                    Редактировать
                  </Button>
                  <Button variant="destructive" size="sm" onClick={onDelete}>
                    <Icon name="Trash2" size={16} />
                    Удалить
                  </Button>
                </>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <Icon name="X" size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {material.cover_image && (
            <div className="aspect-video overflow-hidden rounded-lg">
              <img
                src={material.cover_image}
                alt={material.title}
                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                onClick={() => onImageClick(material.cover_image!, material.attachments || [])}
              />
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-2">Описание</h3>
            <p className="text-gray-700">{material.description}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Содержание</h3>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: material.content }}
            />
          </div>

          {material.tags && material.tags.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Теги</h3>
              <div className="flex flex-wrap gap-2">
                {material.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {material.attachments && material.attachments.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Вложения</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {material.attachments.map((file: FileAttachment, index: number) => (
                  <div
                    key={index}
                    className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  >
                    {file.type?.startsWith('image/') ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-32 object-cover"
                        onClick={() =>
                          onImageClick(file.url, material.attachments || [])
                        }
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                        <Icon name="File" size={32} className="text-gray-400" />
                      </div>
                    )}
                    <div className="p-2">
                      <p className="text-xs truncate">{file.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {material.departments && material.departments.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Отделения</h3>
              <div className="flex flex-wrap gap-2">
                {material.departments.map((dept: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {dept}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
