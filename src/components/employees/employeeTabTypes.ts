import { Employee } from '@/utils/database';

export interface EmployeesTabProps {
  userRole: string;
}

export interface NewEmployeeFormData {
  name: string;
  email: string;
  department: string;
  position: string;
  role: string;
  status: number;
}

export interface EditingEmployeeData {
  id: number | null;
  name: string;
  email: string;
  department: string;
  position: string;
  role: string;
  status: number;
}

export interface EmployeeStats {
  totalEmployees: number;
  excellentEmployees: number;
  averageScore: number;
  totalTests: number;
}