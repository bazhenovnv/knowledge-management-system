import { Employee, Test, KnowledgeMaterial } from '@/utils/database';

export interface AssignmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  tests: Test[];
  materials: KnowledgeMaterial[];
  currentUserRole: 'admin' | 'teacher';
  currentUserId: string;
}

export interface AssignmentFormData {
  title: string;
  description: string;
  type: 'test' | 'material' | 'mixed';
  priority: 'low' | 'medium' | 'high';
  assignees: number[];
  testIds: string[];
  materialIds: string[];
  dueDate: string;
}