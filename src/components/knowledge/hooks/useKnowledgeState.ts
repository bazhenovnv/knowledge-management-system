import { useState, useEffect } from "react";
import { DatabaseKnowledgeMaterial, Instruction } from "@/utils/databaseService";
import { externalDb } from "@/services/externalDbService";
import { toast } from "sonner";
import { FormData } from "@/components/knowledge/types";

export const useKnowledgeState = () => {
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

  useEffect(() => {
    localStorage.setItem('knowledgeCategory', selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    localStorage.setItem('knowledgeDepartmentFilter', JSON.stringify(selectedDepartmentFilter));
  }, [selectedDepartmentFilter]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const data = await externalDb.getKnowledgeMaterials();
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
      const data = await externalDb.getInstructions();
      setInstructions(data);
    } catch (error) {
      console.error('Error loading instructions:', error);
    }
  };

  const loadInstructionCategories = async () => {
    try {
      const categories = await externalDb.getInstructionCategories();
      setInstructionCategories(categories);
    } catch (error) {
      console.error('Error loading instruction categories:', error);
    }
  };

  const loadSubsectionContent = async () => {
    try {
      const content = await externalDb.getSubsectionContent();
      setSubsectionContent(content || {});
    } catch (error) {
      console.error('Error loading subsection content:', error);
    }
  };

  const saveSubsectionContent = async (subsection: string, content: string) => {
    try {
      await externalDb.saveSubsectionContent(subsection, content);
      setSubsectionContent(prev => ({ ...prev, [subsection]: content }));
      toast.success('Раздел сохранен');
      setIsEditingSubsection(false);
    } catch (error) {
      toast.error('Ошибка сохранения');
      console.error('Error saving subsection:', error);
    }
  };

  return {
    materials,
    setMaterials,
    loading,
    selectedCategory,
    setSelectedCategory,
    selectedDepartmentFilter,
    setSelectedDepartmentFilter,
    selectedSubsection,
    setSelectedSubsection,
    previousSubsection,
    setPreviousSubsection,
    isEditingSubsection,
    setIsEditingSubsection,
    subsectionContent,
    editableTexts,
    viewingMaterial,
    setViewingMaterial,
    editingMaterial,
    setEditingMaterial,
    isCreating,
    setIsCreating,
    uploadingCount,
    setUploadingCount,
    instructions,
    setInstructions,
    editingInstruction,
    setEditingInstruction,
    isCreatingInstruction,
    setIsCreatingInstruction,
    instructionForm,
    setInstructionForm,
    selectedInstructionCategory,
    setSelectedInstructionCategory,
    instructionCategories,
    setInstructionCategories,
    isManagingCategories,
    setIsManagingCategories,
    categoryForm,
    setCategoryForm,
    editingCategory,
    setEditingCategory,
    deletingCategory,
    setDeletingCategory,
    transferTargetCategory,
    setTransferTargetCategory,
    subsectionSearchQuery,
    setSubsectionSearchQuery,
    showBranchManager,
    setShowBranchManager,
    formData,
    setFormData,
    selectedDepartments,
    setSelectedDepartments,
    coverImagePreview,
    setCoverImagePreview,
    loadMaterials,
    loadInstructions,
    loadInstructionCategories,
    loadSubsectionContent,
    saveSubsectionContent,
  };
};
