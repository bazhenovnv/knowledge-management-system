import { useState } from 'react';
import { toast } from 'sonner';
import { database, Employee, Test, KnowledgeMaterial } from '@/utils/database';
import { AssignmentFormData } from './assignmentFormTypes';

interface UseAssignmentFormProps {
  employees: Employee[];
  tests: Test[];
  materials: KnowledgeMaterial[];
  currentUserRole: 'admin' | 'teacher';
  currentUserId: string;
  onClose: () => void;
}

export const useAssignmentForm = ({
  employees,
  tests,
  materials,
  currentUserRole,
  currentUserId,
  onClose
}: UseAssignmentFormProps) => {
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

  return {
    formData,
    setFormData,
    searchQuery,
    setSearchQuery,
    selectedDepartments,
    filteredEmployees,
    filteredTests,
    filteredMaterials,
    handleClose,
    toggleEmployee,
    toggleTest,
    toggleMaterial,
    handleSelectAllEmployees,
    handleSelectAllTests,
    handleSelectAllMaterials,
    toggleDepartmentFilter,
    handleSubmit
  };
};