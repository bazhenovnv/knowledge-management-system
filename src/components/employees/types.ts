import { Employee } from '@/utils/database';

export interface AdvancedEmployeeManagementProps {
  employees: Employee[];
  onUpdateEmployees: (employees: Employee[]) => void;
}

export interface EmployeeFormData {
  name: string;
  email: string;
  department: string;
  position: string;
  role: 'admin' | 'teacher' | 'employee';
  status: number;
  password?: string;
  phone?: string;
  notes?: string;
}

export interface EmployeeStats {
  total: number;
  byDepartment: Record<string, number>;
  byRole: Record<string, number>;
  byStatus: Record<string, number>;
  avgScore: number;
}

export type SortField = 'name' | 'department' | 'role' | 'status' | 'createdAt';
export type SortOrder = 'asc' | 'desc';
export type BulkAction = 'department' | 'role' | 'status' | 'delete' | 'export';