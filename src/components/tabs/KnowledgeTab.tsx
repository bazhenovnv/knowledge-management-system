import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { databaseService, DatabaseKnowledgeMaterial, FileAttachment, Instruction } from "@/utils/databaseService";
import { toast } from "sonner";
import { useDepartments } from "@/hooks/useDepartments";
import { KnowledgeTabProps, getDifficultyColor, getDifficultyLabel, FormData } from "@/components/knowledge/types";
import { useImageHandlers } from "@/components/knowledge/useImageHandlers";
import { ImagePreviewModal } from "@/components/knowledge/ImagePreviewModal";
import { MaterialViewModal } from "@/components/knowledge/MaterialViewModal";
import { MaterialFormModal } from "@/components/knowledge/MaterialFormModal";
import { RussiaMapDetailed } from "@/components/map/RussiaMapDetailed";
import { useScrollPosition } from "@/hooks/useScrollPosition";

export const KnowledgeTab = ({
  searchQuery,
  setSearchQuery,
  userRole,
  currentUserId,
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
  const [editableTexts, setEditableTexts] = useState({
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
    icon_name: 'FileText',
    icon_color: 'blue-600',
    steps: [''],
    media: {
      images: [] as string[],
      videos: [] as string[]
    }
  });
  const [subsectionSearchQuery, setSubsectionSearchQuery] = useState("");

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

  useEffect(() => {
    loadMaterials();
    loadSubsectionContent();
    loadInstructions();
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
  }, [selectedSubsection]);

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
      console.error('Error loading materials:', error);
      setMaterials([
        {
          id: 1,
          title: 'Основы работы с онлайн-кассами',
          description: 'Введение в принципы работы с кассовым оборудованием',
          content: 'Онлайн-касса — это устройство для регистрации расчетов между продавцом и покупателем. Основные требования: подключение к интернету, передача данных в ОФД, наличие фискального накопителя.',
          category: 'Оборудование',
          difficulty: 'easy' as const,
          duration: '15 минут',
          tags: ['касса', 'оборудование', 'основы'],
          is_published: true,
          views_count: 156,
          cover_image: '',
          attachments: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          departments: ['Продажи', 'Техподдержка']
        },
        {
          id: 2,
          title: 'Работа с фискальными накопителями',
          description: 'Подробное руководство по ФН',
          content: 'Фискальный накопитель (ФН) - это криптографическое устройство для хранения фискальных данных. Срок действия: 13, 15 или 36 месяцев в зависимости от системы налогообложения.',
          category: 'Оборудование',
          difficulty: 'medium' as const,
          duration: '25 минут',
          tags: ['ФН', 'оборудование', 'регистрация'],
          is_published: true,
          views_count: 89,
          cover_image: '',
          attachments: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          departments: ['Техподдержка']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadInstructions = async () => {
    try {
      const data = await databaseService.getInstructions();
      
      if (data.length === 0) {
        setInstructions([
          {
            id: 1,
            title: 'Регистрация онлайн-кассы',
            description: 'Пошаговая инструкция по регистрации онлайн-кассы в налоговой',
            icon_name: 'FileText',
            icon_color: 'blue-600',
            steps: [
              'Подготовьте документы: ИНН, ОГРН, паспорт директора',
              'Зайдите в личный кабинет ФНС',
              'Выберите раздел "Учет ККТ"',
              'Заполните форму регистрации кассы',
              'Дождитесь регистрационного номера',
              'Введите РН в кассу и пробейте чек'
            ],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 2,
            title: 'Подключение к ОФД',
            description: 'Как подключить кассу к оператору фискальных данных',
            icon_name: 'Wifi',
            icon_color: 'green-600',
            steps: [
              'Выберите ОФД из реестра ФНС',
              'Заключите договор с ОФД',
              'Получите данные для подключения',
              'Настройте кассу: введите ИНН ОФД и адрес сервера',
              'Проверьте передачу данных тестовым чеком'
            ],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 3,
            title: 'Замена фискального накопителя',
            description: 'Инструкция по замене ФН при окончании срока действия',
            icon_name: 'HardDrive',
            icon_color: 'orange-600',
            steps: [
              'Закройте архив на старом ФН',
              'Снимите кассу с учета в ФНС',
              'Извлеките старый ФН из кассы',
              'Установите новый ФН',
              'Зарегистрируйте кассу заново',
              'Пробейте тестовый чек'
            ],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);
      } else {
        setInstructions(data);
      }
    } catch (error) {
      console.error('Error loading instructions:', error);
    }
  };

  const handleCreateInstruction = async () => {
    try {
      await databaseService.createInstruction({
        ...instructionForm,
        steps: instructionForm.steps.filter(s => s.trim())
      });
      toast.success("Инструкция создана");
      setIsCreatingInstruction(false);
      resetInstructionForm();
      loadInstructions();
    } catch (error) {
      toast.error("Не удалось создать инструкцию");
    }
  };

  const handleUpdateInstruction = async () => {
    if (!editingInstruction) return;
    
    try {
      await databaseService.updateInstruction(editingInstruction.id, {
        ...instructionForm,
        steps: instructionForm.steps.filter(s => s.trim())
      });
      toast.success("Инструкция обновлена");
      setEditingInstruction(null);
      resetInstructionForm();
      loadInstructions();
    } catch (error) {
      toast.error("Не удалось обновить инструкцию");
    }
  };

  const handleDeleteInstruction = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить эту инструкцию?")) return;
    
    try {
      await databaseService.deleteInstruction(id);
      toast.success("Инструкция удалена");
      loadInstructions();
    } catch (error) {
      toast.error("Не удалось удалить инструкцию");
    }
  };

  const resetInstructionForm = () => {
    setInstructionForm({
      title: '',
      description: '',
      icon_name: 'FileText',
      icon_color: 'blue-600',
      steps: [''],
      media: {
        images: [],
        videos: []
      }
    });
  };

  const startEditingInstruction = (instruction: Instruction) => {
    setEditingInstruction(instruction);
    setInstructionForm({
      title: instruction.title,
      description: instruction.description,
      icon_name: instruction.icon_name,
      icon_color: instruction.icon_color,
      steps: instruction.steps.length > 0 ? instruction.steps : [''],
      media: instruction.media || { images: [], videos: [] }
    });
    setIsCreatingInstruction(true);
  };

  const handleInstructionImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingCount(prev => prev + files.length);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const url = await databaseService.uploadFile(file);
        return url;
      });

      const urls = await Promise.all(uploadPromises);
      setInstructionForm(prev => ({
        ...prev,
        media: {
          ...prev.media,
          images: [...(prev.media.images || []), ...urls]
        }
      }));
      toast.success(`Загружено изображений: ${urls.length}`);
    } catch (error) {
      toast.error("Ошибка загрузки изображений");
    } finally {
      setUploadingCount(prev => prev - files.length);
    }
  };

  const handleInstructionVideoAdd = (url: string) => {
    if (!url.trim()) return;
    setInstructionForm(prev => ({
      ...prev,
      media: {
        ...prev.media,
        videos: [...(prev.media.videos || []), url]
      }
    }));
    toast.success("Видео добавлено");
  };

  const removeInstructionMedia = (type: 'images' | 'videos', index: number) => {
    setInstructionForm(prev => ({
      ...prev,
      media: {
        ...prev.media,
        [type]: prev.media[type]?.filter((_, i) => i !== index) || []
      }
    }));
  };

  const copyInstructionText = (instruction: Instruction) => {
    const text = `${instruction.title}\n\n${instruction.description}\n\nШаги:\n${instruction.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    toast.success("Текст инструкции скопирован");
  };

  const downloadInstruction = (instruction: Instruction) => {
    const text = `${instruction.title}\n\n${instruction.description}\n\nШаги:\n${instruction.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}\n\nСоздано: ${new Date(instruction.created_at).toLocaleDateString('ru-RU')}`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${instruction.title}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Инструкция скачана");
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

  const getDefaultContent = (subsection: string): string => {
    const defaults: Record<string, string> = {
      "Структура компании": `<div class="space-y-6">
  <div class="bg-white rounded-lg p-6 border border-gray-200">
    <h3 class="text-xl font-semibold mb-4 text-gray-900">О компании</h3>
    <p class="text-gray-700 leading-relaxed mb-4">
      AB-Онлайн Касса — ведущий поставщик кассового оборудования и решений для автоматизации торговли в Краснодаре и Краснодарском крае.
    </p>
  </div>
</div>`,
      "Виды деятельности компании": `<div class="bg-white rounded-lg p-6 border border-gray-200">
  <h3 class="text-xl font-semibold mb-4 text-gray-900">Основные направления</h3>
  <p class="text-gray-700">Описание видов деятельности компании</p>
</div>`,
      "Торговое оборудование": `<div class="bg-white rounded-lg p-6 border border-gray-200">
  <h3 class="text-xl font-semibold mb-4 text-gray-900">Каталог оборудования</h3>
  <p class="text-gray-700">Описание торгового оборудования</p>
</div>`,
      "Скрипты продаж": `<div class="bg-white rounded-lg p-6 border border-gray-200">
  <h3 class="text-xl font-semibold mb-4 text-gray-900">Скрипты</h3>
  <p class="text-gray-700">Скрипты продаж</p>
</div>`,
      "Программное обеспечение": `<div class="bg-white rounded-lg p-6 border border-gray-200">
  <h3 class="text-xl font-semibold mb-4 text-gray-900">ПО</h3>
  <p class="text-gray-700">Программное обеспечение</p>
</div>`
    };
    return defaults[subsection] || "";
  };

  const renderSubsectionContent = () => {
    if (isEditingSubsection && selectedSubsection) {
      return (
        <div className="space-y-4">
          <textarea
            value={subsectionContent[selectedSubsection] || getDefaultContent(selectedSubsection)}
            onChange={(e) => setSubsectionContent(prev => ({ ...prev, [selectedSubsection]: e.target.value }))}
            className="w-full h-96 p-4 border rounded-lg font-mono text-sm"
            placeholder="Введите содержимое раздела в формате HTML или обычного текста..."
          />
          <div className="flex gap-2">
            <Button onClick={() => saveSubsectionContent(selectedSubsection, subsectionContent[selectedSubsection] || '')}>
              <Icon name="Save" size={16} className="mr-2" />
              Сохранить
            </Button>
            <Button variant="outline" onClick={() => setIsEditingSubsection(false)}>
              Отменить
            </Button>
          </div>
        </div>
      );
    }

    // Если есть сохраненный контент, показываем его
    if (subsectionContent[selectedSubsection]) {
      return (
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: subsectionContent[selectedSubsection] }}
        />
      );
    }

    // Иначе показываем дефолтный контент
    switch (selectedSubsection) {
      case "Структура компании":
        if (isEditingSubsection) {
          return (
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">О компании</h3>
                <textarea
                  value={editableTexts.aboutCompany}
                  onChange={(e) => setEditableTexts(prev => ({ ...prev, aboutCompany: e.target.value }))}
                  className="w-full h-32 p-4 border rounded-lg text-gray-700"
                  placeholder="Описание компании..."
                />
              </div>
              
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Организационная структура</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Отдел продаж</h4>
                    <textarea
                      value={editableTexts.salesDept}
                      onChange={(e) => setEditableTexts(prev => ({ ...prev, salesDept: e.target.value }))}
                      className="w-full p-3 border rounded-lg text-gray-600"
                      rows={2}
                    />
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Технический отдел</h4>
                    <textarea
                      value={editableTexts.techDept}
                      onChange={(e) => setEditableTexts(prev => ({ ...prev, techDept: e.target.value }))}
                      className="w-full p-3 border rounded-lg text-gray-600"
                      rows={2}
                    />
                  </div>
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Служба поддержки</h4>
                    <textarea
                      value={editableTexts.supportDept}
                      onChange={(e) => setEditableTexts(prev => ({ ...prev, supportDept: e.target.value }))}
                      className="w-full p-3 border rounded-lg text-gray-600"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => {
                  toast.success('Изменения сохранены');
                  setIsEditingSubsection(false);
                }}>
                  <Icon name="Save" size={16} className="mr-2" />
                  Сохранить
                </Button>
                <Button variant="outline" onClick={() => setIsEditingSubsection(false)}>
                  Отменить
                </Button>
              </div>
            </div>
          );
        }
        
        return (
          <div className="space-y-6">
            <RussiaMapDetailed userRole={userRole} />
            
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">О компании</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                {editableTexts.aboutCompany}
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Организационная структура</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Отдел продаж</h4>
                  <p className="text-gray-600">{editableTexts.salesDept}</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Технический отдел</h4>
                  <p className="text-gray-600">{editableTexts.techDept}</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Служба поддержки</h4>
                  <p className="text-gray-600">{editableTexts.supportDept}</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case "Виды деятельности компании":
        const activities = [
          {
            title: "Продажа онлайн-касс",
            text: "Широкий ассортимент онлайн-касс от ведущих производителей. Подбор оптимального решения для любого бизнеса: от небольших магазинов до крупных торговых сетей. Цены от 3000 ₽, возможна покупка в кредит или рассрочку."
          },
          {
            title: "Подключение и настройка",
            text: "Полный цикл работ \"под ключ\": регистрация в ФНС, настройка ККТ, подключение к ОФД, обучение персонала работе с кассой, интеграция с учетными системами."
          },
          {
            title: "Техническое обслуживание",
            text: "Гарантийное и постгарантийное обслуживание, замена фискального накопителя, ремонт оборудования, обновление программного обеспечения."
          },
          {
            title: "Дополнительное оборудование",
            text: "Торговое оборудование: сканеры штрих-кодов, весы, принтеры этикеток, денежные ящики, POS-терминалы для приема банковских карт."
          }
        ].filter(item => containsSearchQuery(item.title + " " + item.text));
        
        if (activities.length === 0 && subsectionSearchQuery) {
          return (
            <div className="text-center py-8 text-gray-500">
              <Icon name="Search" size={48} className="mx-auto mb-4 opacity-50" />
              <p>Ничего не найдено по запросу "{subsectionSearchQuery}"</p>
              <Button variant="outline" size="sm" onClick={() => setSubsectionSearchQuery("")} className="mt-4">
                Сбросить поиск
              </Button>
            </div>
          );
        }
        
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Основные направления</h3>
              <div className="space-y-4">
                {activities.map((item, idx) => (
                  <div key={idx}>
                    <h4 className="font-semibold text-gray-900 mb-2" dangerouslySetInnerHTML={{ __html: highlightText(item.title) }} />
                    <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: highlightText(item.text) }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case "Торговое оборудование":
        const equipment = [
          {
            title: "Онлайн-кассы (ККТ)",
            text: "Фискальные регистраторы и автономные кассовые аппараты с передачей данных в ФНС. Подходят для магазинов, кафе, салонов красоты, служб доставки.",
            extra: "Примеры: АТОЛ, Эвотор, Меркурий, Штрих-М"
          },
          {
            title: "Сканеры штрих-кодов",
            text: "Ручные и стационарные сканеры для быстрого считывания штрих-кодов товаров. Проводные и беспроводные модели, 1D и 2D сканеры.",
            extra: ""
          },
          {
            title: "Торговые весы",
            text: "Электронные весы с печатью этикеток для взвешиваемых товаров. Настольные и напольные модели с возможностью интеграции с кассой.",
            extra: ""
          },
          {
            title: "Принтеры этикеток",
            text: "Термопринтеры для печати ценников, этикеток со штрих-кодами, бирок для маркировки товаров.",
            extra: ""
          },
          {
            title: "Денежные ящики",
            text: "Металлические кассовые ящики с автоматическим открыванием, подключаются к онлайн-кассе.",
            extra: ""
          },
          {
            title: "POS-терминалы",
            text: "Эквайринговые терминалы для приема оплаты банковскими картами, поддержка бесконтактных платежей.",
            extra: ""
          }
        ].filter(item => containsSearchQuery(item.title + " " + item.text + " " + item.extra));
        
        if (equipment.length === 0 && subsectionSearchQuery) {
          return (
            <div className="text-center py-8 text-gray-500">
              <Icon name="Search" size={48} className="mx-auto mb-4 opacity-50" />
              <p>Ничего не найдено по запросу "{subsectionSearchQuery}"</p>
              <Button variant="outline" size="sm" onClick={() => setSubsectionSearchQuery("")} className="mt-4">
                Сбросить поиск
              </Button>
            </div>
          );
        }
        
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Каталог оборудования</h3>
              <div className="space-y-6">
                {equipment.map((item, idx) => (
                  <div key={idx} className="border-b pb-4 last:border-0">
                    <h4 className="font-semibold text-lg text-gray-900 mb-2" dangerouslySetInnerHTML={{ __html: highlightText(item.title) }} />
                    <p className="text-gray-700 mb-2" dangerouslySetInnerHTML={{ __html: highlightText(item.text) }} />
                    {item.extra && <p className="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: highlightText(item.extra) }} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case "Скрипты продаж":
        const salesContent = `
          Приветствие и выявление потребностей
          Менеджер: Добрый день! Меня зовут [Имя], компания AB-Онлайн Касса. Помогу подобрать онлайн-кассу для вашего бизнеса. Скажите, какой у вас формат торговли?
          Задачи: установить контакт, узнать тип бизнеса (розница, услуги, доставка), масштаб (один магазин или сеть), текущее оборудование.
          Презентация решения
          Менеджер: Исходя из ваших задач, рекомендую [модель кассы]. Она подходит для вашего формата работы, легко настраивается, цена от [сумма] рублей. Мы подключим ее под ключ: зарегистрируем в налоговой, настроим, обучим персонал.
          Ключевые преимущества: простота использования, быстрое подключение, техподдержка 24/7, гарантия, возможность покупки в рассрочку.
          Работа с возражениями
          "Дорого" → Понимаю ваше беспокойство. У нас есть модели от 3000 ₽, плюс рассрочка без переплат. Касса окупится за счет контроля выручки и отсутствия штрафов от налоговой.
          "Сложно разобраться" → Мы все настроим сами и обучим ваших сотрудников. Касса работает интуитивно — достаточно пробить товар и получить оплату. При любых вопросах наша поддержка на связи.
          "Надо подумать" → Конечно, понимаю. Давайте я отправлю вам коммерческое предложение, чтобы вы могли спокойно изучить. Когда удобно созвониться — завтра или послезавтра?
          Завершение сделки
          Менеджер: Отлично! Оформлю для вас договор. Какой способ оплаты удобен — перевод на карту, счет для ИП/ООО или рассрочка? Когда вам удобно принять кассу и провести настройку?
        `;
        
        if (subsectionSearchQuery && !containsSearchQuery(salesContent)) {
          return (
            <div className="text-center py-8 text-gray-500">
              <Icon name="Search" size={48} className="mx-auto mb-4 opacity-50" />
              <p>Ничего не найдено по запросу "{subsectionSearchQuery}"</p>
              <Button variant="outline" size="sm" onClick={() => setSubsectionSearchQuery("")} className="mt-4">
                Сбросить поиск
              </Button>
            </div>
          );
        }
        
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-900" dangerouslySetInnerHTML={{ __html: highlightText("Приветствие и выявление потребностей") }} />
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-gray-800 mb-2" dangerouslySetInnerHTML={{ __html: highlightText("Менеджер: Добрый день! Меня зовут [Имя], компания AB-Онлайн Касса. Помогу подобрать онлайн-кассу для вашего бизнеса. Скажите, какой у вас формат торговли?") }} />
              </div>
              <p className="text-gray-700 mb-4" dangerouslySetInnerHTML={{ __html: highlightText("Задачи: установить контакт, узнать тип бизнеса (розница, услуги, доставка), масштаб (один магазин или сеть), текущее оборудование.") }} />
            </div>
            
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-900" dangerouslySetInnerHTML={{ __html: highlightText("Презентация решения") }} />
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <p className="text-gray-800 mb-2" dangerouslySetInnerHTML={{ __html: highlightText("Менеджер: Исходя из ваших задач, рекомендую [модель кассы]. Она подходит для вашего формата работы, легко настраивается, цена от [сумма] рублей. Мы подключим ее под ключ: зарегистрируем в налоговой, настроим, обучим персонал.") }} />
              </div>
              <p className="text-gray-700 mb-4" dangerouslySetInnerHTML={{ __html: highlightText("Ключевые преимущества: простота использования, быстрое подключение, техподдержка 24/7, гарантия, возможность покупки в рассрочку.") }} />
            </div>
            
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-900" dangerouslySetInnerHTML={{ __html: highlightText("Работа с возражениями") }} />
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-gray-900" dangerouslySetInnerHTML={{ __html: highlightText('"Дорого"') }} />
                  <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: highlightText("→ Понимаю ваше беспокойство. У нас есть модели от 3000 ₽, плюс рассрочка без переплат. Касса окупится за счет контроля выручки и отсутствия штрафов от налоговой.") }} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900" dangerouslySetInnerHTML={{ __html: highlightText('"Сложно разобраться"') }} />
                  <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: highlightText("→ Мы все настроим сами и обучим ваших сотрудников. Касса работает интуитивно — достаточно пробить товар и получить оплату. При любых вопросах наша поддержка на связи.") }} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900" dangerouslySetInnerHTML={{ __html: highlightText('"Надо подумать"') }} />
                  <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: highlightText("→ Конечно, понимаю. Давайте я отправлю вам коммерческое предложение, чтобы вы могли спокойно изучить. Когда удобно созвониться — завтра или послезавтра?") }} />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-900" dangerouslySetInnerHTML={{ __html: highlightText("Завершение сделки") }} />
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-gray-800 mb-2" dangerouslySetInnerHTML={{ __html: highlightText("Менеджер: Отлично! Оформлю для вас договор. Какой способ оплаты удобен — перевод на карту, счет для ИП/ООО или рассрочка? Когда вам удобно принять кассу и провести настройку?") }} />
              </div>
            </div>
          </div>
        );
      
      case "Программное обеспечение":
        const softwareContent = `
          Операторы фискальных данных ОФД
          Драйверы ККТ кассовое программное обеспечение
          Торговые системы 1С Розница МойСклад
          Интеграции 1С Предприятие интернет-магазины CMS Битрикс WooCommerce
          Системы доставки Яндекс.Еда Delivery Club
        `;
        
        if (subsectionSearchQuery && !containsSearchQuery(softwareContent)) {
          return (
            <div className="text-center py-8 text-gray-500">
              <Icon name="Search" size={48} className="mx-auto mb-4 opacity-50" />
              <p>Ничего не найдено по запросу "{subsectionSearchQuery}"</p>
              <Button variant="outline" size="sm" onClick={() => setSubsectionSearchQuery("")} className="mt-4">
                Сбросить поиск
              </Button>
            </div>
          );
        }
        
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-900" dangerouslySetInnerHTML={{ __html: highlightText("Операторы фискальных данных (ОФД)") }} />
              <p className="text-gray-700 mb-4" dangerouslySetInnerHTML={{ __html: highlightText("ОФД — это организация, которая получает от онлайн-кассы данные о продажах и передает их в налоговую службу. Выбор оператора обязателен при регистрации кассы.") }} />
              <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: highlightText("Популярные ОФД: Платформа ОФД, Такском, Первый ОФД, Контур.ОФД, СБИС") }} />
            </div>
            
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-900" dangerouslySetInnerHTML={{ __html: highlightText("Кассовое ПО") }} />
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2" dangerouslySetInnerHTML={{ __html: highlightText("Драйверы ККТ") }} />
                  <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: highlightText("Программное обеспечение для управления онлайн-кассой с компьютера. Устанавливается на рабочее место кассира, позволяет пробивать чеки, формировать отчеты, работать с товарной базой.") }} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2" dangerouslySetInnerHTML={{ __html: highlightText("Торговые системы") }} />
                  <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: highlightText("Программы для автоматизации розничной торговли: учет товаров, складской учет, работа с поставщиками, формирование прайс-листов. Интеграция с онлайн-кассой.") }} />
                  <p className="text-sm text-gray-600 mt-2" dangerouslySetInnerHTML={{ __html: highlightText("Примеры: 1С:Розница, МойСклад, Класс365, Тирика-Магазин") }} />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-900" dangerouslySetInnerHTML={{ __html: highlightText("Интеграции") }} />
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2" dangerouslySetInnerHTML={{ __html: highlightText("1С:Предприятие") }} />
                  <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: highlightText("Подключение онлайн-кассы к учетным системам 1С для автоматической синхронизации товаров, цен и передачи данных о продажах в бухгалтерию.") }} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2" dangerouslySetInnerHTML={{ __html: highlightText("Интернет-магазины") }} />
                  <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: highlightText("Подключение фискализации для онлайн-продаж через CMS (Битрикс, OpenCart, WooCommerce). Чеки отправляются покупателям автоматически на email.") }} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2" dangerouslySetInnerHTML={{ __html: highlightText("Системы доставки") }} />
                  <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: highlightText("Интеграция с сервисами доставки еды и товаров (Яндекс.Еда, Delivery Club). Автоматическое формирование чеков при получении заказа.") }} />
                </div>
              </div>
            </div>
          </div>
        );
      
      case "Драйверы оборудования":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Драйверы для оборудования</h3>
              <p className="text-gray-700 mb-6">
                Здесь вы можете скачать необходимые драйверы и программное обеспечение для работы с кассовым оборудованием.
              </p>
              
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-gray-900 mb-2 flex items-center gap-2">
                        <Icon name="Printer" size={20} className="text-blue-600" />
                        Драйверы АТОЛ
                      </h4>
                      <p className="text-gray-700 mb-3">
                        Драйверы для онлайн-касс, фискальных регистраторов и принтеров АТОЛ.
                        Поддержка моделей: АТОЛ 91Ф, 92Ф, 30Ф, 25Ф и других.
                      </p>
                      <Button 
                        onClick={() => window.open('https://atoldriver.ru/', '_blank')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Icon name="Download" size={16} className="mr-2" />
                        Скачать драйвер
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border-b pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-gray-900 mb-2 flex items-center gap-2">
                        <Icon name="Monitor" size={20} className="text-green-600" />
                        Драйверы Штрих-М
                      </h4>
                      <p className="text-gray-700 mb-3">
                        Программное обеспечение для ККТ Штрих-М, сканеров штрих-кода и весового оборудования.
                      </p>
                      <Button 
                        onClick={() => window.open('https://www.shtrih-m.ru/support/download/', '_blank')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Icon name="Download" size={16} className="mr-2" />
                        Скачать драйвер
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border-b pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-gray-900 mb-2 flex items-center gap-2">
                        <Icon name="Smartphone" size={20} className="text-purple-600" />
                        Эвотор SDK
                      </h4>
                      <p className="text-gray-700 mb-3">
                        Драйверы и SDK для интеграции с кассами Эвотор, разработка приложений.
                      </p>
                      <Button 
                        onClick={() => window.open('https://developer.evotor.ru/docs/downloads', '_blank')}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Icon name="Download" size={16} className="mr-2" />
                        Скачать драйвер
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-gray-900 mb-2 flex items-center gap-2">
                        <Icon name="Scan" size={20} className="text-orange-600" />
                        Драйверы для сканеров
                      </h4>
                      <p className="text-gray-700 mb-3">
                        Универсальные драйверы для сканеров штрих-кодов различных производителей.
                      </p>
                      <Button 
                        onClick={() => window.open('https://www.honeywell.com/us/en/support/downloads', '_blank')}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        <Icon name="Download" size={16} className="mr-2" />
                        Скачать драйвер
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-start gap-3">
                <Icon name="Info" size={24} className="text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Инструкция по установке</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Скачайте необходимый драйвер по ссылке выше</li>
                    <li>Распакуйте архив, если файл упакован</li>
                    <li>Запустите установщик от имени администратора</li>
                    <li>Следуйте инструкциям мастера установки</li>
                    <li>Перезагрузите компьютер после установки</li>
                    <li>Подключите оборудование и проверьте его работу</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        );
      
      case "Инструкции":
        return (
          <div className="space-y-6">
            {(userRole === 'admin' || userRole === 'teacher') && (
              <div className="flex gap-2">
                <Button onClick={() => {
                  resetInstructionForm();
                  setIsCreatingInstruction(true);
                  setEditingInstruction(null);
                }}>
                  <Icon name="Plus" size={16} className="mr-2" />
                  Создать инструкцию
                </Button>
              </div>
            )}

            {isCreatingInstruction && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingInstruction ? 'Редактирование инструкции' : 'Новая инструкция'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Название</label>
                    <Input
                      value={instructionForm.title}
                      onChange={(e) => setInstructionForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Название инструкции"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Описание</label>
                    <textarea
                      value={instructionForm.description}
                      onChange={(e) => setInstructionForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Краткое описание"
                      className="w-full p-3 border rounded-lg"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Иконка</label>
                      <Input
                        value={instructionForm.icon_name}
                        onChange={(e) => setInstructionForm(prev => ({ ...prev, icon_name: e.target.value }))}
                        placeholder="FileText"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Цвет иконки</label>
                      <Input
                        value={instructionForm.icon_color}
                        onChange={(e) => setInstructionForm(prev => ({ ...prev, icon_color: e.target.value }))}
                        placeholder="blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Шаги</label>
                    {instructionForm.steps.map((step, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <Input
                          value={step}
                          onChange={(e) => {
                            const newSteps = [...instructionForm.steps];
                            newSteps[index] = e.target.value;
                            setInstructionForm(prev => ({ ...prev, steps: newSteps }));
                          }}
                          placeholder={`Шаг ${index + 1}`}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newSteps = instructionForm.steps.filter((_, i) => i !== index);
                            setInstructionForm(prev => ({ ...prev, steps: newSteps.length > 0 ? newSteps : [''] }));
                          }}
                        >
                          <Icon name="X" size={16} />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInstructionForm(prev => ({ ...prev, steps: [...prev.steps, ''] }))}
                    >
                      <Icon name="Plus" size={16} className="mr-2" />
                      Добавить шаг
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Изображения</label>
                      <div className="space-y-3">
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleInstructionImageUpload}
                          disabled={uploadingCount > 0}
                        />
                        {instructionForm.media.images && instructionForm.media.images.length > 0 && (
                          <div className="grid grid-cols-3 gap-2">
                            {instructionForm.media.images.map((url, index) => (
                              <div key={index} className="relative group">
                                <img src={url} alt={`Изображение ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => removeInstructionMedia('images', index)}
                                >
                                  <Icon name="X" size={14} />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Видео (YouTube/Vimeo URL)</label>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Input
                            placeholder="https://youtube.com/watch?v=..."
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleInstructionVideoAdd((e.target as HTMLInputElement).value);
                                (e.target as HTMLInputElement).value = '';
                              }
                            }}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                              handleInstructionVideoAdd(input.value);
                              input.value = '';
                            }}
                          >
                            <Icon name="Plus" size={16} />
                          </Button>
                        </div>
                        {instructionForm.media.videos && instructionForm.media.videos.length > 0 && (
                          <div className="space-y-2">
                            {instructionForm.media.videos.map((url, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                <Icon name="Video" size={16} className="text-gray-500" />
                                <span className="text-sm flex-1 truncate">{url}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeInstructionMedia('videos', index)}
                                >
                                  <Icon name="X" size={14} />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={editingInstruction ? handleUpdateInstruction : handleCreateInstruction}>
                      <Icon name="Save" size={16} className="mr-2" />
                      {editingInstruction ? 'Сохранить' : 'Создать'}
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setIsCreatingInstruction(false);
                      setEditingInstruction(null);
                      resetInstructionForm();
                    }}>
                      Отменить
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Инструкции по работе с оборудованием</h3>
              <p className="text-gray-700 mb-6">
                Подробные руководства по настройке, подключению и эксплуатации кассового оборудования.
              </p>
              
              <div>
                {instructions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Icon name="FileText" size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Инструкции загружаются...</p>
                  </div>
                ) : (() => {
                  const filteredInstructions = instructions.filter(instruction => {
                    if (!subsectionSearchQuery) return true;
                    const query = subsectionSearchQuery.toLowerCase();
                    return instruction.title.toLowerCase().includes(query) ||
                           instruction.description.toLowerCase().includes(query) ||
                           instruction.steps.some(step => step.toLowerCase().includes(query));
                  });
                  
                  if (filteredInstructions.length === 0 && subsectionSearchQuery) {
                    return (
                      <div className="text-center py-8 text-gray-500">
                        <Icon name="Search" size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Ничего не найдено по запросу "{subsectionSearchQuery}"</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSubsectionSearchQuery("")}
                          className="mt-4"
                        >
                          Сбросить поиск
                        </Button>
                      </div>
                    );
                  }
                  
                  return filteredInstructions.map((instruction) => (
                    <div key={instruction.id} className="bg-gray-50 rounded-lg p-5 mb-5 last:mb-0">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                          <Icon name={instruction.icon_name} size={20} className={`text-${instruction.icon_color}`} />
                          <span dangerouslySetInnerHTML={{ __html: highlightText(instruction.title) }} />
                        </h4>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => copyInstructionText(instruction)}
                            title="Копировать текст"
                          >
                            <Icon name="Copy" size={14} />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => downloadInstruction(instruction)}
                            title="Скачать инструкцию"
                          >
                            <Icon name="Download" size={14} />
                          </Button>
                          {(userRole === 'admin' || userRole === 'teacher') && (
                            <>
                              <Button variant="outline" size="sm" onClick={() => startEditingInstruction(instruction)}>
                                <Icon name="Pencil" size={14} />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDeleteInstruction(instruction.id)}>
                                <Icon name="Trash2" size={14} />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3" dangerouslySetInnerHTML={{ __html: highlightText(instruction.description) }} />
                      {instruction.steps.length > 0 && (
                        <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                          {instruction.steps.map((step, stepIndex) => (
                            <li key={stepIndex} dangerouslySetInnerHTML={{ __html: highlightText(step) }} />
                          ))}
                        </ul>
                      )}
                      
                      {instruction.media && (instruction.media.images?.length || instruction.media.videos?.length) ? (
                        <div className="mt-4 space-y-4">
                          {instruction.media.images && instruction.media.images.length > 0 && (
                            <div>
                              <h5 className="text-sm font-medium text-gray-900 mb-2">Изображения:</h5>
                              <div className="grid grid-cols-3 gap-2">
                                {instruction.media.images.map((url, imgIndex) => (
                                  <img 
                                    key={imgIndex} 
                                    src={url} 
                                    alt={`Изображение ${imgIndex + 1}`} 
                                    className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => imageHandlers.openImagePreview(url, instruction.media?.images || [])}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {instruction.media.videos && instruction.media.videos.length > 0 && (
                            <div>
                              <h5 className="text-sm font-medium text-gray-900 mb-2">Видео:</h5>
                              <div className="space-y-2">
                                {instruction.media.videos.map((url, vidIndex) => (
                                  <div key={vidIndex} className="aspect-video">
                                    <iframe
                                      src={url.includes('youtube.com') || url.includes('youtu.be') 
                                        ? url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')
                                        : url}
                                      className="w-full h-full rounded-lg"
                                      allowFullScreen
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : null}
                      
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          Создано: {new Date(instruction.created_at).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-start gap-3">
                <Icon name="Info" size={24} className="text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Нужна помощь?</h4>
                  <p className="text-gray-700">
                    Если у вас возникли сложности с настройкой или возникли вопросы, 
                    обратитесь в службу технической поддержки по телефону или через форму обратной связи.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <p className="text-gray-600">Содержимое раздела в разработке</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Загрузка материалов...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {selectedSubsection && !isEditingSubsection && (
        <Button
          variant="default"
          size="lg"
          onClick={() => {
            if (previousSubsection) {
              setSelectedSubsection(previousSubsection);
              setPreviousSubsection(null);
            } else {
              setSelectedSubsection(null);
            }
            setIsEditingSubsection(false);
          }}
          className="fixed top-32 left-8 z-[100] bg-blue-600 hover:bg-blue-700 text-white shadow-2xl hover:shadow-xl transition-all border-2 border-white"
        >
          <Icon name="ArrowLeft" size={20} className="mr-2" />
          Назад
        </Button>
      )}

      {selectedSubsection ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            {selectedSubsection === "Торговое оборудование" && (
              <Button
                variant="outline"
                onClick={() => {
                  setPreviousSubsection(selectedSubsection);
                  setSelectedSubsection("Драйверы оборудования");
                }}
                className="h-auto py-4 px-6 flex items-center gap-2 hover:bg-cyan-50 hover:border-cyan-300 transition-all"
              >
                <Icon name="Download" size={20} className="text-cyan-600" />
                <span className="font-medium">Драйверы оборудования</span>
              </Button>
            )}
            <div className={selectedSubsection === "Торговое оборудование" ? "" : "ml-auto"}>
              {userRole === "admin" && !isEditingSubsection && selectedSubsection !== "Инструкции" && (
                <Button onClick={() => setIsEditingSubsection(true)}>
                  <Icon name="Edit" size={16} className="mr-2" />
                  Редактировать
                </Button>
              )}
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{selectedSubsection}</h2>
          
          {/* Поиск внутри подраздела */}
          <div className="mb-4">
            <Input
              type="text"
              placeholder={`Поиск в разделе "${selectedSubsection}"...`}
              value={subsectionSearchQuery}
              onChange={(e) => setSubsectionSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          
          {renderSubsectionContent()}
        </div>
      ) : (
        <>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6 border border-blue-100">
            <p className="text-gray-700 leading-relaxed text-indent-8">
              В этом разделе вы найдете все необходимые материалы для освоения специфики и деятельности компании. 
              Изучите торговое оборудование и его применение в бизнесе. Ознакомьтесь с принципами структуры компании, 
              научитесь эффективно общаться с клиентами и проводить успешные продажи. 
              Введите интересующий вас вопрос в поиск, и получите развернутый ответ.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => setSelectedSubsection("Структура компании")}
              className="h-auto py-6 px-4 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-all"
            >
              <Icon name="Users" size={24} className="text-blue-600" />
              <span className="text-center font-medium">Структура компании</span>
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
              onClick={() => setSelectedSubsection("Скрипты продаж")}
              className="h-auto py-6 px-4 flex flex-col items-center gap-2 hover:bg-orange-50 hover:border-orange-300 transition-all"
            >
              <Icon name="MessageSquare" size={24} className="text-orange-600" />
              <span className="text-center font-medium">Скрипты продаж</span>
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
              onClick={() => setSelectedSubsection("Программное обеспечение")}
              className="h-auto py-6 px-4 flex flex-col items-center gap-2 hover:bg-indigo-50 hover:border-indigo-300 transition-all"
            >
              <Icon name="Monitor" size={24} className="text-indigo-600" />
              <span className="text-center font-medium">Программное обеспечение</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedSubsection("Инструкции")}
              className="h-auto py-6 px-4 flex flex-col items-center gap-2 hover:bg-pink-50 hover:border-pink-300 transition-all"
            >
              <Icon name="BookOpen" size={24} className="text-pink-600" />
              <span className="text-center font-medium">Инструкции</span>
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

      <div className="relative">
        {showIndicator && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-fade-in">
            <Icon name="ArrowDown" size={16} className="animate-bounce" />
            <span className="text-sm font-medium">Восстановление позиции...</span>
          </div>
        )}
      <div ref={scrollRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[600px] overflow-y-auto pr-2">
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