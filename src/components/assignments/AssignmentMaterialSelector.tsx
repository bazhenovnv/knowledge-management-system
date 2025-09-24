import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { KnowledgeMaterial } from '@/utils/database';
import { AssignmentFormData } from './assignmentFormTypes';

interface AssignmentMaterialSelectorProps {
  formData: AssignmentFormData;
  materials: KnowledgeMaterial[];
  toggleMaterial: (materialId: string) => void;
  handleSelectAllMaterials: () => void;
}

const AssignmentMaterialSelector: React.FC<AssignmentMaterialSelectorProps> = ({
  formData,
  materials,
  toggleMaterial,
  handleSelectAllMaterials
}) => {
  const filteredMaterials = materials.filter(material => material.isPublished);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Выберите материалы для изучения</Label>
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSelectAllMaterials}
          >
            {filteredMaterials.every(material => formData.materialIds.includes(material.id)) 
              ? 'Снять все' 
              : 'Выбрать все'
            }
          </Button>
          <Badge variant="secondary">
            {formData.materialIds.length} выбрано
          </Badge>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto border rounded-md">
        {filteredMaterials.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Icon name="BookOpen" size={24} className="mx-auto mb-2 opacity-50" />
            <p>Нет доступных материалов</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {filteredMaterials.map((material) => (
              <div
                key={material.id}
                className={`flex items-center space-x-3 p-3 rounded cursor-pointer hover:bg-gray-50 transition-colors ${
                  formData.materialIds.includes(material.id) 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'border border-transparent'
                }`}
                onClick={() => toggleMaterial(material.id)}
              >
                <input
                  type="checkbox"
                  checked={formData.materialIds.includes(material.id)}
                  onChange={() => toggleMaterial(material.id)}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{material.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {material.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">{material.description}</p>
                  <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                    <Icon name="Clock" size={12} />
                    <span>{material.duration}</span>
                    <span>•</span>
                    <Icon name="Tag" size={12} />
                    <span>{material.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentMaterialSelector;