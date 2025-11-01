import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { DatabaseKnowledgeMaterial } from "@/utils/databaseService";
import { getDifficultyColor, getDifficultyLabel } from "./types";

interface MaterialsListProps {
  materials: DatabaseKnowledgeMaterial[];
  loading: boolean;
  userRole: string;
  onViewMaterial: (material: DatabaseKnowledgeMaterial) => void;
  onEditMaterial: (material: DatabaseKnowledgeMaterial) => void;
  onDeleteMaterial: (id: number) => void;
}

export const MaterialsList = ({
  materials,
  loading,
  userRole,
  onViewMaterial,
  onEditMaterial,
  onDeleteMaterial,
}: MaterialsListProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin">
          <Icon name="Loader2" size={32} />
        </div>
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="text-center py-12">
        <Icon name="FileSearch" size={48} className="mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Материалы не найдены</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {materials.map((material) => (
        <Card key={material.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            {material.cover_image && (
              <img
                src={material.cover_image}
                alt={material.title}
                className="w-full h-40 object-cover rounded-md mb-4"
              />
            )}
            <CardTitle className="text-lg">{material.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {material.description}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {material.category && (
                <Badge variant="secondary">
                  <Icon name="FolderOpen" size={12} className="mr-1" />
                  {material.category}
                </Badge>
              )}
              {material.difficulty && (
                <Badge className={getDifficultyColor(material.difficulty)}>
                  {getDifficultyLabel(material.difficulty)}
                </Badge>
              )}
              {material.duration && (
                <Badge variant="outline">
                  <Icon name="Clock" size={12} className="mr-1" />
                  {material.duration}
                </Badge>
              )}
            </div>
            {material.tags && (
              <div className="flex flex-wrap gap-1 mb-4">
                {material.tags.split(',').map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Button
                onClick={() => onViewMaterial(material)}
                className="flex-1"
                size="sm"
              >
                <Icon name="Eye" size={16} className="mr-2" />
                Открыть
              </Button>
              {userRole === 'admin' && (
                <>
                  <Button
                    onClick={() => onEditMaterial(material)}
                    variant="outline"
                    size="sm"
                  >
                    <Icon name="Edit" size={16} />
                  </Button>
                  <Button
                    onClick={() => onDeleteMaterial(material.id)}
                    variant="destructive"
                    size="sm"
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
