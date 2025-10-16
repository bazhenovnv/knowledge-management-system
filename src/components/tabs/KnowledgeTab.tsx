import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { databaseService, DatabaseKnowledgeMaterial, FileAttachment } from "@/utils/databaseService";
import { toast } from "sonner";
import { useDepartments } from "@/hooks/useDepartments";
import { KnowledgeTabProps, getDifficultyColor, getDifficultyLabel } from "@/components/knowledge/types";
import { useKnowledgeState } from "@/components/knowledge/useKnowledgeState";

export const KnowledgeTab = ({
  searchQuery,
  setSearchQuery,
  userRole,
  currentUserId,
}: KnowledgeTabProps) => {
  const departmentsFromHook = useDepartments();
  const state = useKnowledgeState();
  const imageContainerRef = useRef<HTMLDivElement>(null);
  
  const departments = departmentsFromHook;

  useEffect(() => {
    loadMaterials();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!state.previewImage) return;
      
      if (e.key === 'Escape') {
        closeImagePreview();
      } else if (e.key === 'ArrowLeft' && state.imageGallery.length > 0) {
        const prevIndex = state.currentImageIndex === 0 ? state.imageGallery.length - 1 : state.currentImageIndex - 1;
        state.setCurrentImageIndex(prevIndex);
        state.setPreviewImage(state.imageGallery[prevIndex].url);
        resetZoom();
      } else if (e.key === 'ArrowRight' && state.imageGallery.length > 0) {
        const nextIndex = (state.currentImageIndex + 1) % state.imageGallery.length;
        state.setCurrentImageIndex(nextIndex);
        state.setPreviewImage(state.imageGallery[nextIndex].url);
        resetZoom();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.previewImage, state.currentImageIndex, state.imageGallery]);

  const loadMaterials = async () => {
    state.setLoading(true);
    try {
      const data = await databaseService.getKnowledgeMaterials();
      state.setMaterials(data);
    } catch (error) {
      toast.error("Не удалось загрузить материалы");
    } finally {
      state.setLoading(false);
    }
  };

  const closeImagePreview = () => {
    state.setPreviewImage(null);
    state.setImageGallery([]);
    state.setCurrentImageIndex(0);
    state.setIsPreviewMode(false);
    resetZoom();
    state.setIsEditing(false);
    state.setEditRotation(0);
    state.setEditFilter('none');
  };

  const resetZoom = () => {
    state.setZoomLevel(1);
    state.setImagePosition({ x: 0, y: 0 });
  };

  const filteredMaterials = state.materials.filter((material) => {
    const matchesSearch = material.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      state.selectedCategory === "all" || material.category === state.selectedCategory;
    const matchesDepartment =
      state.selectedDepartmentFilter.length === 0 ||
      material.departments?.some((dept: string) =>
        state.selectedDepartmentFilter.includes(dept)
      );
    return matchesSearch && matchesCategory && matchesDepartment;
  });

  const categories = Array.from(
    new Set(state.materials.map((m) => m.category))
  ).filter(Boolean);

  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Загрузка материалов...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <Input
            type="text"
            placeholder="Поиск материалов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
          <select
            value={state.selectedCategory}
            onChange={(e) => state.setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white"
          >
            <option value="all">Все категории</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        {(userRole === "admin" || userRole === "teacher") && (
          <Button onClick={() => state.setIsCreating(true)}>
            <Icon name="Plus" size={16} />
            Создать материал
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((material) => (
          <Card
            key={material.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => state.setViewingMaterial(material)}
          >
            {material.cover_image && (
              <div className="aspect-video overflow-hidden rounded-t-lg">
                <img
                  src={material.cover_image}
                  alt={material.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg">{material.title}</CardTitle>
                <Badge className={getDifficultyColor(material.difficulty)}>
                  {getDifficultyLabel(material.difficulty)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                {material.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Icon name="Clock" size={14} />
                  {material.duration}
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="Tag" size={14} />
                  {material.category}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Icon name="BookOpen" size={48} className="mx-auto mb-4 opacity-50" />
          <p>Материалы не найдены</p>
        </div>
      )}
    </div>
  );
};
