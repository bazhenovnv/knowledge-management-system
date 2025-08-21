import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import { database, Employee, Test, KnowledgeMaterial } from '@/utils/database';

interface AssignmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  tests: Test[];
  materials: KnowledgeMaterial[];
  currentUserRole: 'admin' | 'teacher';
  currentUserId: string;
}

interface AssignmentFormData {
  title: string;
  description: string;
  type: 'test' | 'material' | 'mixed';
  priority: 'low' | 'medium' | 'high';
  assignees: number[];
  testIds: string[];
  materialIds: string[];
  dueDate: string;
}

const AssignmentForm: React.FC<AssignmentFormProps> = ({
  isOpen,
  onClose,
  employees,
  tests,
  materials,
  currentUserRole,
  currentUserId
}) => {
  const [formData, setFormData] = useState<AssignmentFormData>({
    title: '',
    description: '',
    type: 'mixed',
    priority: 'medium',
    assignees: [],
    testIds: [],
    materialIds: [],
    dueDate: ''
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      type: 'mixed',
      priority: 'medium',
      assignees: [],
      testIds: [],
      materialIds: [],
      dueDate: ''
    });
    setSearchQuery('');
    setSelectedDepartments([]);
    onClose();
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = !searchQuery || 
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = selectedDepartments.length === 0 || 
      selectedDepartments.includes(emp.department);
    
    return matchesSearch && matchesDepartment;
  });

  const filteredTests = tests.filter(test => test.status === 'published');
  const filteredMaterials = materials.filter(material => material.isPublished);

  const departments = [...new Set(employees.map(emp => emp.department))].filter(Boolean);

  const toggleEmployee = (employeeId: number) => {
    setFormData(prev => ({
      ...prev,
      assignees: prev.assignees.includes(employeeId)
        ? prev.assignees.filter(id => id !== employeeId)
        : [...prev.assignees, employeeId]
    }));
  };

  const toggleTest = (testId: string) => {
    setFormData(prev => ({
      ...prev,
      testIds: prev.testIds.includes(testId)
        ? prev.testIds.filter(id => id !== testId)
        : [...prev.testIds, testId]
    }));
  };

  const toggleMaterial = (materialId: string) => {
    setFormData(prev => ({
      ...prev,
      materialIds: prev.materialIds.includes(materialId)
        ? prev.materialIds.filter(id => id !== materialId)
        : [...prev.materialIds, materialId]
    }));
  };

  const handleSelectAllEmployees = () => {
    const allSelected = filteredEmployees.every(emp => formData.assignees.includes(emp.id));
    if (allSelected) {
      const idsToRemove = filteredEmployees.map(emp => emp.id);
      setFormData(prev => ({
        ...prev,
        assignees: prev.assignees.filter(id => !idsToRemove.includes(id))
      }));
    } else {
      const newIds = filteredEmployees.map(emp => emp.id);
      setFormData(prev => ({
        ...prev,
        assignees: [...new Set([...prev.assignees, ...newIds])]
      }));
    }
  };

  const handleSelectAllTests = () => {
    const allSelected = filteredTests.every(test => formData.testIds.includes(test.id));
    if (allSelected) {
      setFormData(prev => ({ ...prev, testIds: [] }));
    } else {
      setFormData(prev => ({ ...prev, testIds: filteredTests.map(test => test.id) }));
    }
  };

  const handleSelectAllMaterials = () => {
    const allSelected = filteredMaterials.every(material => formData.materialIds.includes(material.id));
    if (allSelected) {
      setFormData(prev => ({ ...prev, materialIds: [] }));
    } else {
      setFormData(prev => ({ ...prev, materialIds: filteredMaterials.map(material => material.id) }));
    }
  };

  const toggleDepartmentFilter = (department: string) => {
    setSelectedDepartments(prev => 
      prev.includes(department) 
        ? prev.filter(d => d !== department)
        : [...prev, department]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Введите название задания');
      return;
    }
    
    if (formData.assignees.length === 0) {
      toast.error('Выберите сотрудников для назначения');
      return;
    }

    if (formData.testIds.length === 0 && formData.materialIds.length === 0) {
      toast.error('Выберите тесты или материалы для задания');
      return;
    }

    try {
      database.createAssignment({
        title: formData.title,
        description: formData.description,
        type: formData.type,
        priority: formData.priority,
        status: 'active',
        assignedBy: currentUserId,
        assignedByRole: currentUserRole,
        assignees: formData.assignees,
        testIds: formData.testIds.length > 0 ? formData.testIds : undefined,
        materialIds: formData.materialIds.length > 0 ? formData.materialIds : undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      });

      const assigneeNames = employees
        .filter(emp => formData.assignees.includes(emp.id))
        .map(emp => emp.name)
        .join(', ');

      toast.success(`Задание "${formData.title}" назначено для: ${assigneeNames}`);
      handleClose();
    } catch (error) {
      toast.error('Ошибка при создании задания');
      console.error('Ошибка создания задания:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Icon name="ClipboardList" size={20} />
            <span>Назначить задание</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Основная информация */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название задания *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Введите название задания..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Приоритет</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: 'low' | 'medium' | 'high') => 
                  setFormData(prev => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor('low')}`}></div>
                      <span>Низкий</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor('medium')}`}></div>
                      <span>Средний</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor('high')}`}></div>
                      <span>Высокий</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание задания</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Добавьте описание задания..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Срок выполнения</Label>
            <Input
              id="dueDate"
              type="datetime-local"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <Tabs defaultValue="assignees" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="assignees" className="flex items-center space-x-2">
                <Icon name="Users" size={16} />
                <span>Сотрудники ({formData.assignees.length})</span>
              </TabsTrigger>
              <TabsTrigger value="tests" className="flex items-center space-x-2">
                <Icon name="FileText" size={16} />
                <span>Тесты ({formData.testIds.length})</span>
              </TabsTrigger>
              <TabsTrigger value="materials" className="flex items-center space-x-2">
                <Icon name="BookOpen" size={16} />
                <span>Материалы ({formData.materialIds.length})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="assignees" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Выберите сотрудников для назначения *</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllEmployees}
                  >
                    {filteredEmployees.every(emp => formData.assignees.includes(emp.id)) 
                      ? 'Снять все' 
                      : 'Выбрать всех'
                    }
                  </Button>
                  <Badge variant="secondary">
                    {formData.assignees.length} выбрано
                  </Badge>
                </div>
              </div>

              {/* Фильтры по отделам */}
              <div className="space-y-2">
                <Label className="text-sm">Фильтр по отделам:</Label>
                <div className="flex flex-wrap gap-2">
                  {departments.map(department => (
                    <Button
                      key={department}
                      type="button"
                      variant={selectedDepartments.includes(department) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleDepartmentFilter(department)}
                      className="text-xs"
                    >
                      {department}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Поиск */}
              <div className="relative">
                <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Поиск по имени, email или отделу..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Список сотрудников */}
              <div className="max-h-64 overflow-y-auto border rounded-md">
                {filteredEmployees.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <Icon name="Users" size={24} className="mx-auto mb-2 opacity-50" />
                    <p>Сотрудники не найдены</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {filteredEmployees.map((employee) => (
                      <div
                        key={employee.id}
                        className={`flex items-center space-x-3 p-3 rounded cursor-pointer hover:bg-gray-50 transition-colors ${
                          formData.assignees.includes(employee.id) 
                            ? 'bg-blue-50 border border-blue-200' 
                            : 'border border-transparent'
                        }`}
                        onClick={() => toggleEmployee(employee.id)}
                      >
                        <input
                          type="checkbox"
                          checked={formData.assignees.includes(employee.id)}
                          onChange={() => toggleEmployee(employee.id)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{employee.name}</span>
                            {formData.assignees.includes(employee.id) && (
                              <Icon name="Check" size={14} className="text-blue-600" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center space-x-2">
                            <Icon name="Briefcase" size={12} />
                            <span>{employee.position}</span>
                            <span>•</span>
                            <Icon name="Building2" size={12} />
                            <span>{employee.department}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="tests" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Выберите тесты для задания</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllTests}
                  >
                    {filteredTests.every(test => formData.testIds.includes(test.id)) 
                      ? 'Снять все' 
                      : 'Выбрать все'
                    }
                  </Button>
                  <Badge variant="secondary">
                    {formData.testIds.length} выбрано
                  </Badge>
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto border rounded-md">
                {filteredTests.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <Icon name="FileText" size={24} className="mx-auto mb-2 opacity-50" />
                    <p>Нет доступных тестов</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    {filteredTests.map((test) => (
                      <div
                        key={test.id}
                        className={`flex items-center space-x-3 p-3 rounded cursor-pointer hover:bg-gray-50 transition-colors ${
                          formData.testIds.includes(test.id) 
                            ? 'bg-blue-50 border border-blue-200' 
                            : 'border border-transparent'
                        }`}
                        onClick={() => toggleTest(test.id)}
                      >
                        <input
                          type="checkbox"
                          checked={formData.testIds.includes(test.id)}
                          onChange={() => toggleTest(test.id)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{test.title}</span>
                            <Badge variant="outline" className="text-xs">
                              {test.difficulty === 'easy' ? 'Легкий' : 
                               test.difficulty === 'medium' ? 'Средний' : 'Сложный'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">{test.description}</p>
                          <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                            <Icon name="Clock" size={12} />
                            <span>{test.timeLimit} мин</span>
                            <span>•</span>
                            <span>{test.questions.length} вопросов</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="materials" className="space-y-4">
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
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Отмена
            </Button>
            <Button 
              type="submit" 
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Icon name="Send" size={16} />
              <span>Назначить задание</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentForm;