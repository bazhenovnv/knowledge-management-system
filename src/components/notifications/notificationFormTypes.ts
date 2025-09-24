export interface Employee {
  id: number;
  name: string;
  email: string;
  position: string;
  department: string;
  role?: 'admin' | 'teacher' | 'student';
  status?: string;
}

export interface NotificationFormProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  selectedEmployee?: Employee | null;
  currentUserRole: 'admin' | 'teacher';
}

export interface NotificationData {
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  type: 'info' | 'warning' | 'urgent' | 'reminder';
  recipients: number[];
  scheduledFor?: string;
}

export interface QuickFilters {
  adminsOnly: boolean;
  teachersOnly: boolean;
  activeOnly: boolean;
  studentsOnly: boolean;
}

export interface NotificationTemplate {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'urgent' | 'reminder';
  priority: 'low' | 'medium' | 'high';
}