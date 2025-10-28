import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { databaseService, DatabaseKnowledgeMaterial, FileAttachment } from "@/utils/databaseService";
import { toast } from "sonner";
import { useDepartments } from "@/hooks/useDepartments";
import { KnowledgeTabProps, getDifficultyColor, getDifficultyLabel, FormData } from "@/components/knowledge/types";
import { useImageHandlers } from "@/components/knowledge/useImageHandlers";
import { ImagePreviewModal } from "@/components/knowledge/ImagePreviewModal";
import { MaterialViewModal } from "@/components/knowledge/MaterialViewModal";
import { MaterialFormModal } from "@/components/knowledge/MaterialFormModal";

export const KnowledgeTab = ({
  searchQuery,
  setSearchQuery,
  userRole,
  currentUserId,
}: KnowledgeTabProps) => {
  const departments = useDepartments();
  const [materials, setMaterials] = useState<DatabaseKnowledgeMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string[]>([]);
  const [selectedSubsection, setSelectedSubsection] = useState<string | null>(null);
  const [viewingMaterial, setViewingMaterial] = useState<DatabaseKnowledgeMaterial | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<DatabaseKnowledgeMaterial | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    content: '',
    category: '',
    difficulty: 'medium',
    duration: '',
    tags: '',
    is_published: true,
    cover_image: '',
    attachments: [],
  });

  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');

  const imageHandlers = useImageHandlers();

  useEffect(() => {
    loadMaterials();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!imageHandlers.previewImage) return;
      
      if (e.key === 'Escape') {
        imageHandlers.closeImagePreview();
      } else if (e.key === 'ArrowLeft') {
        imageHandlers.handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        imageHandlers.handleNextImage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [imageHandlers.previewImage, imageHandlers.currentImageIndex, imageHandlers.imageGallery]);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const data = await databaseService.getKnowledgeMaterials();
      setMaterials(data);
    } catch (error) {
      toast.error("Не удалось загрузить материалы");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMaterial = async () => {
    try {
      await databaseService.createKnowledgeMaterial({
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        departments: selectedDepartments,
      });
      toast.success("Материал создан");
      setIsCreating(false);
      resetForm();
      loadMaterials();
    } catch (error) {
      toast.error("Не удалось создать материал");
    }
  };

  const handleUpdateMaterial = async () => {
    if (!editingMaterial) return;
    
    try {
      await databaseService.updateKnowledgeMaterial(editingMaterial.id, {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        departments: selectedDepartments,
      });
      toast.success("Материал обновлен");
      setEditingMaterial(null);
      resetForm();
      loadMaterials();
    } catch (error) {
      toast.error("Не удалось обновить материал");
    }
  };

  const handleDeleteMaterial = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить этот материал?")) return;
    
    try {
      await databaseService.deleteKnowledgeMaterial(id);
      toast.success("Материал удален");
      setViewingMaterial(null);
      loadMaterials();
    } catch (error) {
      toast.error("Не удалось удалить материал");
    }
  };

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await databaseService.uploadFile(file);
      setFormData(prev => ({ ...prev, cover_image: url }));
      setCoverImagePreview(url);
      toast.success("Обложка загружена");
    } catch (error) {
      toast.error("Не удалось загрузить обложку");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingCount(files.length);
    const uploadedFiles: FileAttachment[] = [];

    for (const file of files) {
      try {
        const url = await databaseService.uploadFile(file);
        uploadedFiles.push({
          name: file.name,
          url,
          type: file.type,
          size: file.size,
        });
      } catch (error) {
        toast.error(`Не удалось загрузить ${file.name}`);
      }
    }

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...uploadedFiles],
    }));
    setUploadingCount(0);
    toast.success(`Загружено файлов: ${uploadedFiles.length}`);
  };

  const handleRemoveAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveCoverImage = () => {
    setFormData(prev => ({ ...prev, cover_image: '' }));
    setCoverImagePreview('');
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDepartmentToggle = (deptId: string) => {
    setSelectedDepartments(prev =>
      prev.includes(deptId)
        ? prev.filter(id => id !== deptId)
        : [...prev, deptId]
    );
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      category: '',
      difficulty: 'medium',
      duration: '',
      tags: '',
      is_published: true,
      cover_image: '',
      attachments: [],
    });
    setSelectedDepartments([]);
    setCoverImagePreview('');
  };

  const handleEditMaterial = (material: DatabaseKnowledgeMaterial) => {
    setEditingMaterial(material);
    setFormData({
      title: material.title,
      description: material.description,
      content: material.content,
      category: material.category,
      difficulty: material.difficulty,
      duration: material.duration,
      tags: Array.isArray(material.tags) ? material.tags.join(', ') : '',
      is_published: material.is_published,
      cover_image: material.cover_image || '',
      attachments: material.attachments || [],
    });
    setSelectedDepartments(material.departments || []);
    setCoverImagePreview(material.cover_image || '');
    setViewingMaterial(null);
  };

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = material.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || material.category === selectedCategory;
    const matchesDepartment =
      selectedDepartmentFilter.length === 0 ||
      material.departments?.some((dept: string) =>
        selectedDepartmentFilter.includes(dept)
      );
    return matchesSearch && matchesCategory && matchesDepartment;
  });

  const categories = Array.from(
    new Set(materials.map((m) => m.category))
  ).filter(Boolean);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Загрузка материалов...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6 border border-blue-100">
        <p className="text-gray-700 leading-relaxed text-indent-8">
          В этом разделе вы найдете все необходимые материалы для освоения специфики и деятельности компании. 
          Изучите торговое оборудование и его применение в бизнесе. Ознакомьтесь с принципами структуры компании, 
          научитесь эффективно общаться с клиентами и проводить успешные продажи. 
          Введите интересующий вас вопрос в поиск, и получите развернутый ответ.
        </p>
      </div>

      {selectedSubsection ? (
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => setSelectedSubsection(null)}
            className="mb-4"
          >
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            Назад к разделам
          </Button>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{selectedSubsection}</h2>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <p className="text-gray-600">Здесь будет отображаться содержимое подраздела "{selectedSubsection}"</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => setSelectedSubsection("Структура компании и личный состав")}
              className="h-auto py-6 px-4 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-all"
            >
              <Icon name="Users" size={24} className="text-blue-600" />
              <span className="text-center font-medium">Структура компании и личный состав</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedSubsection("Виды деятельности компании")}
              className="h-auto py-6 px-4 flex flex-col items-center gap-2 hover:bg-green-50 hover:border-green-300 transition-all"
            >
              <Icon name="Briefcase" size={24} className="text-green-600" />
              <span className="text-center font-medium">Виды деятельности компании</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedSubsection("Торговое оборудование")}
              className="h-auto py-6 px-4 flex flex-col items-center gap-2 hover:bg-purple-50 hover:border-purple-300 transition-all"
            >
              <Icon name="Package" size={24} className="text-purple-600" />
              <span className="text-center font-medium">Торговое оборудование</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedSubsection("Скрипты продаж")}
              className="h-auto py-6 px-4 flex flex-col items-center gap-2 hover:bg-orange-50 hover:border-orange-300 transition-all"
            >
              <Icon name="MessageSquare" size={24} className="text-orange-600" />
              <span className="text-center font-medium">Скрипты продаж</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedSubsection("Программное обеспечение")}
              className="h-auto py-6 px-4 flex flex-col items-center gap-2 hover:bg-indigo-50 hover:border-indigo-300 transition-all"
            >
              <Icon name="Monitor" size={24} className="text-indigo-600" />
              <span className="text-center font-medium">Программное обеспечение</span>
            </Button>
          </div>

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
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
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
          <Button onClick={() => setIsCreating(true)}>
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
            onClick={() => setViewingMaterial(material)}
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
        </>
      )}

      <MaterialViewModal
        material={viewingMaterial}
        userRole={userRole}
        currentUserId={currentUserId}
        onClose={() => setViewingMaterial(null)}
        onEdit={() => handleEditMaterial(viewingMaterial!)}
        onDelete={() => handleDeleteMaterial(viewingMaterial!.id)}
        onImageClick={imageHandlers.openImagePreview}
      />

      <MaterialFormModal
        isOpen={isCreating || !!editingMaterial}
        isEditing={!!editingMaterial}
        formData={formData}
        selectedDepartments={selectedDepartments}
        departments={departments}
        coverImagePreview={coverImagePreview}
        uploadingCount={uploadingCount}
        onClose={() => {
          setIsCreating(false);
          setEditingMaterial(null);
          resetForm();
        }}
        onSubmit={editingMaterial ? handleUpdateMaterial : handleCreateMaterial}
        onFormChange={handleFormChange}
        onDepartmentToggle={handleDepartmentToggle}
        onCoverImageUpload={handleCoverImageUpload}
        onFileUpload={handleFileUpload}
        onRemoveAttachment={handleRemoveAttachment}
        onRemoveCoverImage={handleRemoveCoverImage}
      />

      <ImagePreviewModal
        previewImage={imageHandlers.previewImage}
        imageGallery={imageHandlers.imageGallery}
        currentImageIndex={imageHandlers.currentImageIndex}
        zoomLevel={imageHandlers.zoomLevel}
        imagePosition={imageHandlers.imagePosition}
        isEditing={imageHandlers.isEditing}
        editRotation={imageHandlers.editRotation}
        editFilter={imageHandlers.editFilter}
        onClose={imageHandlers.closeImagePreview}
        onNext={imageHandlers.handleNextImage}
        onPrev={imageHandlers.handlePrevImage}
        onZoomIn={imageHandlers.handleZoomIn}
        onZoomOut={imageHandlers.handleZoomOut}
        onResetZoom={imageHandlers.resetZoom}
        onDownload={imageHandlers.handleDownloadImage}
        onCopy={imageHandlers.handleCopyImage}
        onShare={imageHandlers.handleShareImage}
        onPrint={imageHandlers.handlePrintImage}
        onToggleEdit={() => imageHandlers.setIsEditing(!imageHandlers.isEditing)}
        onRotate={imageHandlers.handleRotate}
        onFilterChange={imageHandlers.setEditFilter}
        onSaveEdit={() => toast.info('Функция сохранения в разработке')}
        onStartCrop={() => toast.info('Функция обрезки в разработке')}
        onStartDraw={() => toast.info('Функция рисования в разработке')}
        onStartBlur={() => toast.info('Функция размытия в разработке')}
        setImagePosition={imageHandlers.setImagePosition}
        setIsDragging={() => {}}
        setDragStart={() => {}}
      />
    </div>
  );
};