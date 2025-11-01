import { useState, useEffect } from "react";
import { databaseService, DatabaseKnowledgeMaterial, Instruction } from "@/utils/databaseService";
import { toast } from "sonner";
import { useDepartments } from "@/hooks/useDepartments";
import { KnowledgeTabProps, FormData } from "@/components/knowledge/types";
import { useImageHandlers } from "@/components/knowledge/useImageHandlers";
import { ImagePreviewModal } from "@/components/knowledge/ImagePreviewModal";
import { MaterialViewModal } from "@/components/knowledge/MaterialViewModal";
import { MaterialFormModal } from "@/components/knowledge/MaterialFormModal";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { BranchManager } from "@/components/branches/BranchManager";
import { KnowledgeHeader } from "@/components/knowledge/KnowledgeHeader";
import { CategoryFilter } from "@/components/knowledge/CategoryFilter";
import { DepartmentFilter } from "@/components/knowledge/DepartmentFilter";
import { SubsectionGrid } from "@/components/knowledge/SubsectionGrid";
import { MaterialsList } from "@/components/knowledge/MaterialsList";
import { SubsectionContent } from "@/components/knowledge/SubsectionContent";
import { InstructionFormModal } from "@/components/knowledge/InstructionFormModal";
import { CategoryManagementModal } from "@/components/knowledge/CategoryManagementModal";

export const KnowledgeTab = ({
  searchQuery,
  setSearchQuery,
  userRole,
  currentUserId,
  onBackButtonChange,
}: KnowledgeTabProps) => {
  const departments = useDepartments();
  const [materials, setMaterials] = useState<DatabaseKnowledgeMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const saved = localStorage.getItem('knowledgeCategory');
    return saved || "all";
  });
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string[]>(() => {
    const saved = localStorage.getItem('knowledgeDepartmentFilter');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedSubsection, setSelectedSubsection] = useState<string | null>(() => {
    const saved = localStorage.getItem('knowledgeSubsection');
    return saved || null;
  });
  const [previousSubsection, setPreviousSubsection] = useState<string | null>(null);
  const [isEditingSubsection, setIsEditingSubsection] = useState(false);
  const [subsectionContent, setSubsectionContent] = useState<Record<string, string>>({});
  const [editableTexts] = useState({
    aboutCompany: 'AB-Онлайн Касса — ведущий поставщик кассового оборудования и решений для автоматизации торговли в Краснодаре и Краснодарском крае. Компания специализируется на продаже, настройке и обслуживании онлайн-касс, фискальных регистраторов и сопутствующего оборудования.',
    salesDept: 'Консультирование клиентов, подбор оборудования, оформление договоров',
    techDept: 'Настройка, подключение и техническая поддержка оборудования',
    supportDept: 'Решение вопросов клиентов, консультации по эксплуатации'
  });
  const [viewingMaterial, setViewingMaterial] = useState<DatabaseKnowledgeMaterial | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<DatabaseKnowledgeMaterial | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [editingInstruction, setEditingInstruction] = useState<Instruction | null>(null);
  const [isCreatingInstruction, setIsCreatingInstruction] = useState(false);
  const [instructionForm, setInstructionForm] = useState({
    title: '',
    description: '',
    category: 'Онлайн кассы',
    icon_name: 'FileText',
    icon_color: 'blue-600',
    steps: [''],
    media: {
      images: [] as string[],
      videos: [] as string[]
    }
  });
  
  const [selectedInstructionCategory, setSelectedInstructionCategory] = useState<string | null>(null);
  
  const [instructionCategories, setInstructionCategories] = useState<Array<{ id: number; name: string; icon_name: string }>>([]);
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', icon_name: 'Folder' });
  const [editingCategory, setEditingCategory] = useState<{ id: number; name: string; icon_name: string } | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<{ id: number; name: string } | null>(null);
  const [transferTargetCategory, setTransferTargetCategory] = useState<string>('');
  
  const [subsectionSearchQuery, setSubsectionSearchQuery] = useState("");
  const [showBranchManager, setShowBranchManager] = useState(false);

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
  const { scrollRef, showIndicator } = useScrollPosition('knowledgeTab', materials.length);
  
  const highlightText = (text: string) => {
    if (!subsectionSearchQuery) return text;
    const regex = new RegExp(`(${subsectionSearchQuery})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  };
  
  const containsSearchQuery = (text: string) => {
    if (!subsectionSearchQuery) return true;
    return text.toLowerCase().includes(subsectionSearchQuery.toLowerCase());
  };
  
  const getSubsectionResultsCount = () => {
    if (!subsectionSearchQuery || !selectedSubsection) return 0;
    
    if (selectedSubsection === "Инструкции") {
      return instructions.filter(instruction => {
        const query = subsectionSearchQuery.toLowerCase();
        return instruction.title.toLowerCase().includes(query) ||
               instruction.description.toLowerCase().includes(query) ||
               instruction.steps.some(step => step.toLowerCase().includes(query));
      }).length;
    }
    
    return 0;
  };

  useEffect(() => {
    loadMaterials();
    loadSubsectionContent();
    loadInstructions();
    loadInstructionCategories();
  }, []);

  useEffect(() => {
    localStorage.setItem('knowledgeCategory', selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    localStorage.setItem('knowledgeDepartmentFilter', JSON.stringify(selectedDepartmentFilter));
  }, [selectedDepartmentFilter]);

  useEffect(() => {
    if (selectedSubsection) {
      localStorage.setItem('knowledgeSubsection', selectedSubsection);
    } else {
      localStorage.removeItem('knowledgeSubsection');
    }
    setSubsectionSearchQuery("");
    
    if (onBackButtonChange) {
      if (selectedSubsection && !isEditingSubsection) {
        onBackButtonChange(true, () => {
          if (previousSubsection) {
            setSelectedSubsection(previousSubsection);
            setPreviousSubsection(null);
          } else {
            setSelectedSubsection(null);
          }
          setIsEditingSubsection(false);
        });
      } else {
        onBackButtonChange(false);
      }
    }
  }, [selectedSubsection, isEditingSubsection, previousSubsection, onBackButtonChange]);

  useEffect(() => {
    const handleResetSubsection = () => {
      setSelectedSubsection(null);
      setIsEditingSubsection(false);
    };

    window.addEventListener('resetSubsection', handleResetSubsection);

    return () => {
      window.removeEventListener('resetSubsection', handleResetSubsection);
    };
  }, []);

  const loadSubsectionContent = async () => {
    try {
      const content = await databaseService.getSubsectionContent();
      setSubsectionContent(content || {});
    } catch (error) {
      console.error('Error loading subsection content:', error);
    }
  };

  const saveSubsectionContent = async (subsection: string, content: string) => {
    try {
      await databaseService.saveSubsectionContent(subsection, content);
      setSubsectionContent(prev => ({ ...prev, [subsection]: content }));
      toast.success('Раздел сохранен');
      setIsEditingSubsection(false);
    } catch (error) {
      toast.error('Ошибка сохранения');
      console.error('Error saving subsection:', error);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!imageHandlers.previewImage) return;
      
      if (e.key === 'Escape') {
        imageHandlers.closeImagePreview();
      } else if (e.key === 'ArrowLeft') {
        imageHandlers.navigatePrevious();
      } else if (e.key === 'ArrowRight') {
        imageHandlers.navigateNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [imageHandlers]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const data = await databaseService.getKnowledgeMaterials();
      setMaterials(data);
    } catch (error) {
      toast.error('Ошибка загрузки материалов');
      console.error('Error loading materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInstructions = async () => {
    try {
      const data = await databaseService.getInstructions();
      setInstructions(data);
    } catch (error) {
      console.error('Error loading instructions:', error);
    }
  };

  const loadInstructionCategories = async () => {
    try {
      const categories = await databaseService.getInstructionCategories();
      setInstructionCategories(categories);
    } catch (error) {
      console.error('Error loading instruction categories:', error);
    }
  };

  const handleCreateMaterial = () => {
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
    setIsCreating(true);
  };

  const handleEditMaterial = (material: DatabaseKnowledgeMaterial) => {
    setFormData({
      title: material.title,
      description: material.description,
      content: material.content,
      category: material.category || '',
      difficulty: material.difficulty || 'medium',
      duration: material.duration || '',
      tags: material.tags || '',
      is_published: material.is_published,
      cover_image: material.cover_image || '',
      attachments: material.attachments || [],
    });
    setSelectedDepartments(material.departments || []);
    setCoverImagePreview(material.cover_image || '');
    setEditingMaterial(material);
  };

  const handleSaveMaterial = async () => {
    if (!formData.title || !formData.description || !formData.content) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    try {
      const materialData = {
        ...formData,
        departments: selectedDepartments,
        created_by: currentUserId,
      };

      if (editingMaterial) {
        await databaseService.updateKnowledgeMaterial(editingMaterial.id, materialData);
        toast.success('Материал обновлен');
      } else {
        await databaseService.createKnowledgeMaterial(materialData);
        toast.success('Материал создан');
      }

      setIsCreating(false);
      setEditingMaterial(null);
      loadMaterials();
    } catch (error) {
      toast.error('Ошибка сохранения материала');
      console.error('Error saving material:', error);
    }
  };

  const handleDeleteMaterial = async (id: number) => {
    if (!confirm('Удалить материал?')) return;

    try {
      await databaseService.deleteKnowledgeMaterial(id);
      toast.success('Материал удален');
      loadMaterials();
    } catch (error) {
      toast.error('Ошибка удаления материала');
      console.error('Error deleting material:', error);
    }
  };

  const handleUploadCoverImage = async (file: File) => {
    try {
      setUploadingCount(prev => prev + 1);
      const url = await databaseService.uploadFile(file);
      setCoverImagePreview(url);
      setFormData(prev => ({ ...prev, cover_image: url }));
      toast.success('Обложка загружена');
    } catch (error) {
      toast.error('Ошибка загрузки обложки');
      console.error('Error uploading cover:', error);
    } finally {
      setUploadingCount(prev => prev - 1);
    }
  };

  const handleUploadAttachment = async (files: FileList) => {
    try {
      setUploadingCount(prev => prev + files.length);
      const urls = await Promise.all(
        Array.from(files).map(file => databaseService.uploadFile(file))
      );
      const newAttachments = urls.map((url, index) => ({
        filename: files[index].name,
        url,
        type: files[index].type,
      }));
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newAttachments],
      }));
      toast.success('Файлы загружены');
    } catch (error) {
      toast.error('Ошибка загрузки файлов');
      console.error('Error uploading attachments:', error);
    } finally {
      setUploadingCount(prev => prev - files.length);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleCloseModal = () => {
    setIsCreating(false);
    setEditingMaterial(null);
  };

  const handleCreateInstruction = () => {
    setInstructionForm({
      title: '',
      description: '',
      category: instructionCategories[0]?.name || 'Онлайн кассы',
      icon_name: 'FileText',
      icon_color: 'blue-600',
      steps: [''],
      media: { images: [], videos: [] }
    });
    setEditingInstruction(null);
    setIsCreatingInstruction(true);
  };

  const handleEditInstruction = (instruction: Instruction) => {
    setInstructionForm({
      title: instruction.title,
      description: instruction.description,
      category: instruction.category,
      icon_name: instruction.icon_name || 'FileText',
      icon_color: instruction.icon_color || 'blue-600',
      steps: instruction.steps,
      media: instruction.media || { images: [], videos: [] }
    });
    setEditingInstruction(instruction);
    setIsCreatingInstruction(true);
  };

  const handleSaveInstruction = async () => {
    if (!instructionForm.title || !instructionForm.description || instructionForm.steps.length === 0) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    try {
      if (editingInstruction) {
        await databaseService.updateInstruction(editingInstruction.id, instructionForm);
        toast.success('Инструкция обновлена');
      } else {
        await databaseService.createInstruction(instructionForm);
        toast.success('Инструкция создана');
      }

      setIsCreatingInstruction(false);
      setEditingInstruction(null);
      loadInstructions();
    } catch (error) {
      toast.error('Ошибка сохранения инструкции');
      console.error('Error saving instruction:', error);
    }
  };

  const handleDeleteInstruction = async (id: number) => {
    if (!confirm('Удалить инструкцию?')) return;

    try {
      await databaseService.deleteInstruction(id);
      toast.success('Инструкция удалена');
      loadInstructions();
    } catch (error) {
      toast.error('Ошибка удаления инструкции');
      console.error('Error deleting instruction:', error);
    }
  };

  const handleUploadInstructionImage = async (files: FileList, type: 'step' | 'form') => {
    try {
      const urls = await Promise.all(
        Array.from(files).map(file => databaseService.uploadFile(file))
      );
      setInstructionForm(prev => ({
        ...prev,
        media: {
          ...prev.media,
          images: [...prev.media.images, ...urls]
        }
      }));
      toast.success('Изображения загружены');
    } catch (error) {
      toast.error('Ошибка загрузки изображений');
      console.error('Error uploading images:', error);
    }
  };

  const handleCreateCategory = async () => {
    if (!categoryForm.name) {
      toast.error('Введите название категории');
      return;
    }

    try {
      await databaseService.createInstructionCategory(categoryForm);
      toast.success('Категория создана');
      setCategoryForm({ name: '', icon_name: 'Folder' });
      loadInstructionCategories();
    } catch (error) {
      toast.error('Ошибка создания категории');
      console.error('Error creating category:', error);
    }
  };

  const handleStartEditCategory = (category: { id: number; name: string; icon_name: string }) => {
    setEditingCategory(category);
    setCategoryForm({ name: category.name, icon_name: category.icon_name });
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    try {
      await databaseService.updateInstructionCategory(editingCategory.id, categoryForm);
      toast.success('Категория обновлена');
      setEditingCategory(null);
      setCategoryForm({ name: '', icon_name: 'Folder' });
      loadInstructionCategories();
    } catch (error) {
      toast.error('Ошибка обновления категории');
      console.error('Error updating category:', error);
    }
  };

  const handleCancelEditCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', icon_name: 'Folder' });
  };

  const handleStartDeleteCategory = (category: { id: number; name: string }) => {
    setDeletingCategory(category);
    setTransferTargetCategory('');
  };

  const handleConfirmDeleteCategory = async () => {
    if (!deletingCategory || !transferTargetCategory) return;

    try {
      await databaseService.deleteInstructionCategory(deletingCategory.id, parseInt(transferTargetCategory));
      toast.success('Категория удалена');
      setDeletingCategory(null);
      setTransferTargetCategory('');
      loadInstructionCategories();
      loadInstructions();
    } catch (error) {
      toast.error('Ошибка удаления категории');
      console.error('Error deleting category:', error);
    }
  };

  const handleCancelDeleteCategory = () => {
    setDeletingCategory(null);
    setTransferTargetCategory('');
  };

  const filteredMaterials = materials.filter(material => {
    const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (material.tags && material.tags.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDepartment = selectedDepartmentFilter.length === 0 || 
      (material.departments && material.departments.some(dept => selectedDepartmentFilter.includes(dept)));
    return matchesCategory && matchesSearch && matchesDepartment;
  });

  const categories = ['all', ...Array.from(new Set(materials.map(m => m.category).filter(Boolean)))];

  return (
    <div ref={scrollRef} className="space-y-6">
      <KnowledgeHeader
        selectedSubsection={selectedSubsection}
        subsectionSearchQuery={subsectionSearchQuery}
        setSubsectionSearchQuery={setSubsectionSearchQuery}
        getSubsectionResultsCount={getSubsectionResultsCount}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        userRole={userRole}
        onCreateMaterial={handleCreateMaterial}
        onShowBranchManager={() => setShowBranchManager(true)}
      />

      {!selectedSubsection && (
        <>
          <SubsectionGrid onSelectSubsection={setSelectedSubsection} />
          
          <CategoryFilter
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories}
          />

          <DepartmentFilter
            selectedDepartmentFilter={selectedDepartmentFilter}
            setSelectedDepartmentFilter={setSelectedDepartmentFilter}
            departments={departments}
          />

          <MaterialsList
            materials={filteredMaterials}
            loading={loading}
            userRole={userRole}
            onViewMaterial={setViewingMaterial}
            onEditMaterial={handleEditMaterial}
            onDeleteMaterial={handleDeleteMaterial}
          />
        </>
      )}

      {selectedSubsection && (
        <SubsectionContent
          selectedSubsection={selectedSubsection}
          subsectionContent={subsectionContent}
          editableTexts={editableTexts}
          isEditingSubsection={isEditingSubsection}
          userRole={userRole}
          subsectionSearchQuery={subsectionSearchQuery}
          instructions={instructions}
          selectedInstructionCategory={selectedInstructionCategory}
          instructionCategories={instructionCategories}
          onSetPreviousSubsection={setPreviousSubsection}
          onSelectSubsection={setSelectedSubsection}
          onSetIsEditingSubsection={setIsEditingSubsection}
          onSaveSubsectionContent={saveSubsectionContent}
          onSelectInstructionCategory={setSelectedInstructionCategory}
          onEditInstruction={handleEditInstruction}
          onDeleteInstruction={handleDeleteInstruction}
          onCreateInstruction={handleCreateInstruction}
          onManageCategories={() => setIsManagingCategories(true)}
          containsSearchQuery={containsSearchQuery}
          highlightText={highlightText}
        />
      )}

      <ImagePreviewModal
        isOpen={!!imageHandlers.previewImage}
        imageUrl={imageHandlers.previewImage}
        onClose={imageHandlers.closeImagePreview}
        onPrevious={imageHandlers.navigatePrevious}
        onNext={imageHandlers.navigateNext}
        currentIndex={imageHandlers.currentImageIndex}
        totalImages={imageHandlers.totalImages}
      />

      <MaterialViewModal
        isOpen={!!viewingMaterial}
        material={viewingMaterial}
        onClose={() => setViewingMaterial(null)}
        onImageClick={imageHandlers.openImagePreview}
      />

      <MaterialFormModal
        isOpen={isCreating || !!editingMaterial}
        isEditing={!!editingMaterial}
        formData={formData}
        selectedDepartments={selectedDepartments}
        coverImagePreview={coverImagePreview}
        uploadingCount={uploadingCount}
        departments={departments}
        onClose={handleCloseModal}
        onFormDataChange={setFormData}
        onSelectedDepartmentsChange={setSelectedDepartments}
        onUploadCoverImage={handleUploadCoverImage}
        onUploadAttachment={handleUploadAttachment}
        onRemoveAttachment={handleRemoveAttachment}
        onSave={handleSaveMaterial}
      />

      <InstructionFormModal
        isOpen={isCreatingInstruction}
        isEditing={!!editingInstruction}
        form={instructionForm}
        categories={instructionCategories}
        onClose={() => {
          setIsCreatingInstruction(false);
          setEditingInstruction(null);
        }}
        onFormChange={setInstructionForm}
        onSubmit={handleSaveInstruction}
        onUploadImage={handleUploadInstructionImage}
      />

      <CategoryManagementModal
        isOpen={isManagingCategories}
        categories={instructionCategories}
        categoryForm={categoryForm}
        editingCategory={editingCategory}
        deletingCategory={deletingCategory}
        transferTargetCategory={transferTargetCategory}
        onClose={() => setIsManagingCategories(false)}
        onCategoryFormChange={setCategoryForm}
        onCreateCategory={handleCreateCategory}
        onStartEditCategory={handleStartEditCategory}
        onUpdateCategory={handleUpdateCategory}
        onCancelEditCategory={handleCancelEditCategory}
        onStartDeleteCategory={handleStartDeleteCategory}
        onConfirmDeleteCategory={handleConfirmDeleteCategory}
        onCancelDeleteCategory={handleCancelDeleteCategory}
        onTransferTargetChange={setTransferTargetCategory}
      />

      {showBranchManager && (
        <BranchManager onClose={() => setShowBranchManager(false)} />
      )}
    </div>
  );
};
