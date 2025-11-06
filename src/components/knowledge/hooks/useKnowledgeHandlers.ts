import { DatabaseKnowledgeMaterial, Instruction } from "@/utils/databaseService";
import { externalDb } from "@/services/externalDbService";
import { toast } from "sonner";
import { FormData } from "@/components/knowledge/types";

interface UseKnowledgeHandlersProps {
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  setSelectedDepartments: React.Dispatch<React.SetStateAction<string[]>>;
  setCoverImagePreview: React.Dispatch<React.SetStateAction<string>>;
  setIsCreating: React.Dispatch<React.SetStateAction<boolean>>;
  setEditingMaterial: React.Dispatch<React.SetStateAction<DatabaseKnowledgeMaterial | null>>;
  setUploadingCount: React.Dispatch<React.SetStateAction<number>>;
  setInstructionForm: React.Dispatch<React.SetStateAction<any>>;
  setEditingInstruction: React.Dispatch<React.SetStateAction<Instruction | null>>;
  setIsCreatingInstruction: React.Dispatch<React.SetStateAction<boolean>>;
  setCategoryForm: React.Dispatch<React.SetStateAction<{ name: string; icon_name: string }>>;
  setEditingCategory: React.Dispatch<React.SetStateAction<{ id: number; name: string; icon_name: string } | null>>;
  setDeletingCategory: React.Dispatch<React.SetStateAction<{ id: number; name: string } | null>>;
  setTransferTargetCategory: React.Dispatch<React.SetStateAction<string>>;
  instructionCategories: Array<{ id: number; name: string; icon_name: string }>;
  editingMaterial: DatabaseKnowledgeMaterial | null;
  editingInstruction: Instruction | null;
  formData: FormData;
  selectedDepartments: string[];
  currentUserId?: number;
  loadMaterials: () => Promise<void>;
  loadInstructions: () => Promise<void>;
  loadInstructionCategories: () => Promise<void>;
  editingCategory: { id: number; name: string; icon_name: string } | null;
  categoryForm: { name: string; icon_name: string };
  deletingCategory: { id: number; name: string } | null;
  transferTargetCategory: string;
}

export const useKnowledgeHandlers = (props: UseKnowledgeHandlersProps) => {
  const {
    setFormData,
    setSelectedDepartments,
    setCoverImagePreview,
    setIsCreating,
    setEditingMaterial,
    setUploadingCount,
    setInstructionForm,
    setEditingInstruction,
    setIsCreatingInstruction,
    setCategoryForm,
    setEditingCategory,
    setDeletingCategory,
    setTransferTargetCategory,
    instructionCategories,
    editingMaterial,
    editingInstruction,
    formData,
    selectedDepartments,
    currentUserId,
    loadMaterials,
    loadInstructions,
    loadInstructionCategories,
    editingCategory,
    categoryForm,
    deletingCategory,
    transferTargetCategory,
  } = props;

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
        await externalDb.updateKnowledgeMaterial(editingMaterial.id, materialData);
        toast.success('Материал обновлен');
      } else {
        await externalDb.createKnowledgeMaterial(materialData);
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
      await externalDb.deleteKnowledgeMaterial(id);
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
      const url = await externalDb.uploadFile(file);
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
        Array.from(files).map(file => externalDb.uploadFile(file))
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
    if (!props.formData.title || !props.formData.description) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    try {
      if (editingInstruction) {
        await externalDb.updateInstruction(editingInstruction.id, props.formData);
        toast.success('Инструкция обновлена');
      } else {
        await externalDb.createInstruction(props.formData);
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
      await externalDb.deleteInstruction(id);
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
        Array.from(files).map(file => externalDb.uploadFile(file))
      );
      setInstructionForm((prev: any) => ({
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
      await externalDb.createInstructionCategory(categoryForm);
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
      await externalDb.updateInstructionCategory(editingCategory.id, categoryForm);
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
      await externalDb.deleteInstructionCategory(deletingCategory.id, parseInt(transferTargetCategory));
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

  return {
    handleCreateMaterial,
    handleEditMaterial,
    handleSaveMaterial,
    handleDeleteMaterial,
    handleUploadCoverImage,
    handleUploadAttachment,
    handleRemoveAttachment,
    handleCloseModal,
    handleCreateInstruction,
    handleEditInstruction,
    handleSaveInstruction,
    handleDeleteInstruction,
    handleUploadInstructionImage,
    handleCreateCategory,
    handleStartEditCategory,
    handleUpdateCategory,
    handleCancelEditCategory,
    handleStartDeleteCategory,
    handleConfirmDeleteCategory,
    handleCancelDeleteCategory,
  };
};
