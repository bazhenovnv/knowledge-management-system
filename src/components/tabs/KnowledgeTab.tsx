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
  const [isEditingSubsection, setIsEditingSubsection] = useState(false);
  const [subsectionContent, setSubsectionContent] = useState<Record<string, string>>({});
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
  const scrollRef = useScrollPosition('knowledgeTab', materials.length);

  useEffect(() => {
    loadMaterials();
    loadSubsectionContent();
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
  }, [selectedSubsection]);

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
        return (
          <div className="space-y-6">
            <RussiaMapDetailed />
            
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">О компании</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                AB-Онлайн Касса — ведущий поставщик кассового оборудования и решений для автоматизации торговли в Краснодаре и Краснодарском крае. 
                Компания специализируется на продаже, настройке и обслуживании онлайн-касс, фискальных регистраторов и сопутствующего оборудования.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Организационная структура</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Отдел продаж</h4>
                  <p className="text-gray-600">Консультирование клиентов, подбор оборудования, оформление договоров</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Технический отдел</h4>
                  <p className="text-gray-600">Настройка, подключение и техническая поддержка оборудования</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Служба поддержки</h4>
                  <p className="text-gray-600">Решение вопросов клиентов, консультации по эксплуатации</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case "Виды деятельности компании":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Основные направления</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Продажа онлайн-касс</h4>
                  <p className="text-gray-700">
                    Широкий ассортимент онлайн-касс от ведущих производителей. Подбор оптимального решения для любого бизнеса: 
                    от небольших магазинов до крупных торговых сетей. Цены от 3000 ₽, возможна покупка в кредит или рассрочку.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Подключение и настройка</h4>
                  <p className="text-gray-700">
                    Полный цикл работ "под ключ": регистрация в ФНС, настройка ККТ, подключение к ОФД, 
                    обучение персонала работе с кассой, интеграция с учетными системами.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Техническое обслуживание</h4>
                  <p className="text-gray-700">
                    Гарантийное и постгарантийное обслуживание, замена фискального накопителя, 
                    ремонт оборудования, обновление программного обеспечения.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Дополнительное оборудование</h4>
                  <p className="text-gray-700">
                    Торговое оборудование: сканеры штрих-кодов, весы, принтеры этикеток, 
                    денежные ящики, POS-терминалы для приема банковских карт.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case "Торговое оборудование":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Каталог оборудования</h3>
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h4 className="font-semibold text-lg text-gray-900 mb-2">Онлайн-кассы (ККТ)</h4>
                  <p className="text-gray-700 mb-2">
                    Фискальные регистраторы и автономные кассовые аппараты с передачей данных в ФНС. 
                    Подходят для магазинов, кафе, салонов красоты, служб доставки.
                  </p>
                  <p className="text-sm text-gray-600">Примеры: АТОЛ, Эвотор, Меркурий, Штрих-М</p>
                </div>
                
                <div className="border-b pb-4">
                  <h4 className="font-semibold text-lg text-gray-900 mb-2">Сканеры штрих-кодов</h4>
                  <p className="text-gray-700 mb-2">
                    Ручные и стационарные сканеры для быстрого считывания штрих-кодов товаров. 
                    Проводные и беспроводные модели, 1D и 2D сканеры.
                  </p>
                </div>
                
                <div className="border-b pb-4">
                  <h4 className="font-semibold text-lg text-gray-900 mb-2">Торговые весы</h4>
                  <p className="text-gray-700 mb-2">
                    Электронные весы с печатью этикеток для взвешиваемых товаров. 
                    Настольные и напольные модели с возможностью интеграции с кассой.
                  </p>
                </div>
                
                <div className="border-b pb-4">
                  <h4 className="font-semibold text-lg text-gray-900 mb-2">Принтеры этикеток</h4>
                  <p className="text-gray-700 mb-2">
                    Термопринтеры для печати ценников, этикеток со штрих-кодами, 
                    бирок для маркировки товаров.
                  </p>
                </div>
                
                <div className="border-b pb-4">
                  <h4 className="font-semibold text-lg text-gray-900 mb-2">Денежные ящики</h4>
                  <p className="text-gray-700 mb-2">
                    Металлические кассовые ящики с автоматическим открыванием, 
                    подключаются к онлайн-кассе.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-lg text-gray-900 mb-2">POS-терминалы</h4>
                  <p className="text-gray-700 mb-2">
                    Эквайринговые терминалы для приема оплаты банковскими картами, 
                    поддержка бесконтактных платежей.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case "Скрипты продаж":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Приветствие и выявление потребностей</h3>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-gray-800 mb-2">
                  <strong>Менеджер:</strong> Добрый день! Меня зовут [Имя], компания AB-Онлайн Касса. 
                  Помогу подобрать онлайн-кассу для вашего бизнеса. Скажите, какой у вас формат торговли?
                </p>
              </div>
              <p className="text-gray-700 mb-4">
                <strong>Задачи:</strong> установить контакт, узнать тип бизнеса (розница, услуги, доставка), 
                масштаб (один магазин или сеть), текущее оборудование.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Презентация решения</h3>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <p className="text-gray-800 mb-2">
                  <strong>Менеджер:</strong> Исходя из ваших задач, рекомендую [модель кассы]. 
                  Она подходит для вашего формата работы, легко настраивается, цена от [сумма] рублей. 
                  Мы подключим ее под ключ: зарегистрируем в налоговой, настроим, обучим персонал.
                </p>
              </div>
              <p className="text-gray-700 mb-4">
                <strong>Ключевые преимущества:</strong> простота использования, быстрое подключение, 
                техподдержка 24/7, гарантия, возможность покупки в рассрочку.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Работа с возражениями</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-gray-900">"Дорого"</p>
                  <p className="text-gray-700">
                    → Понимаю ваше беспокойство. У нас есть модели от 3000 ₽, плюс рассрочка без переплат. 
                    Касса окупится за счет контроля выручки и отсутствия штрафов от налоговой.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">"Сложно разобраться"</p>
                  <p className="text-gray-700">
                    → Мы все настроим сами и обучим ваших сотрудников. Касса работает интуитивно — 
                    достаточно пробить товар и получить оплату. При любых вопросах наша поддержка на связи.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">"Надо подумать"</p>
                  <p className="text-gray-700">
                    → Конечно, понимаю. Давайте я отправлю вам коммерческое предложение, 
                    чтобы вы могли спокойно изучить. Когда удобно созвониться — завтра или послезавтра?
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Завершение сделки</h3>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-gray-800 mb-2">
                  <strong>Менеджер:</strong> Отлично! Оформлю для вас договор. 
                  Какой способ оплаты удобен — перевод на карту, счет для ИП/ООО или рассрочка? 
                  Когда вам удобно принять кассу и провести настройку?
                </p>
              </div>
            </div>
          </div>
        );
      
      case "Программное обеспечение":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Операторы фискальных данных (ОФД)</h3>
              <p className="text-gray-700 mb-4">
                ОФД — это организация, которая получает от онлайн-кассы данные о продажах 
                и передает их в налоговую службу. Выбор оператора обязателен при регистрации кассы.
              </p>
              <p className="text-gray-700">
                <strong>Популярные ОФД:</strong> Платформа ОФД, Такском, Первый ОФД, Контур.ОФД, СБИС
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Кассовое ПО</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Драйверы ККТ</h4>
                  <p className="text-gray-700">
                    Программное обеспечение для управления онлайн-кассой с компьютера. 
                    Устанавливается на рабочее место кассира, позволяет пробивать чеки, 
                    формировать отчеты, работать с товарной базой.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Торговые системы</h4>
                  <p className="text-gray-700">
                    Программы для автоматизации розничной торговли: учет товаров, складской учет, 
                    работа с поставщиками, формирование прайс-листов. Интеграция с онлайн-кассой.
                  </p>
                  <p className="text-sm text-gray-600 mt-2">Примеры: 1С:Розница, МойСклад, Класс365, Тирика-Магазин</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Интеграции</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">1С:Предприятие</h4>
                  <p className="text-gray-700">
                    Подключение онлайн-кассы к учетным системам 1С для автоматической синхронизации 
                    товаров, цен и передачи данных о продажах в бухгалтерию.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Интернет-магазины</h4>
                  <p className="text-gray-700">
                    Подключение фискализации для онлайн-продаж через CMS (Битрикс, OpenCart, WooCommerce). 
                    Чеки отправляются покупателям автоматически на email.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Системы доставки</h4>
                  <p className="text-gray-700">
                    Интеграция с сервисами доставки еды и товаров (Яндекс.Еда, Delivery Club). 
                    Автоматическое формирование чеков при получении заказа.
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
          <div className="flex justify-between items-center mb-4">
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedSubsection(null);
                setIsEditingSubsection(false);
              }}
            >
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Назад к разделам
            </Button>
            {userRole === "admin" && !isEditingSubsection && (
              <Button onClick={() => setIsEditingSubsection(true)}>
                <Icon name="Edit" size={16} className="mr-2" />
                Редактировать
              </Button>
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{selectedSubsection}</h2>
          {renderSubsectionContent()}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
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