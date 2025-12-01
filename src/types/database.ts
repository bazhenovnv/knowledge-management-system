// Централизованные типы для базы данных

export type UserRole = "admin" | "teacher" | "employee" | "student";
export type TestStatus = "draft" | "published" | "archived";
export type TestDifficulty = "easy" | "medium" | "hard";
export type EmployeeStatus = 1 | 2 | 3 | 4 | 5;

export interface BaseEntity {
  id: string | number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Employee extends BaseEntity {
  id: number;
  name: string;
  full_name?: string;
  email: string;
  department: string;
  position: string;
  role: UserRole;
  status: EmployeeStatus;
  tests: number;
  avgScore: number;
  score: number;
  testResults: TestResult[];
  password?: string;
  lastLoginAt?: Date;
  isActive: boolean;
  is_active?: boolean;
  phone?: string;
  notes?: string;
  avatar_url?: string;
  theme?: string;
  created_at?: string;
}

export interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  timeLimit?: number;
}

export interface Test extends BaseEntity {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: TestDifficulty;
  timeLimit: number;
  questions: TestQuestion[];
  department?: string;
  createdBy: string;
  status: TestStatus;
  totalAttempts: number;
  averageScore: number;
  sourceMaterialId?: string;
  isGeneratedFromMaterial?: boolean;
}

export interface TestResult extends BaseEntity {
  id: string;
  testId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  answers: TestAnswer[];
  completedAt: Date;
}

export interface TestAnswer {
  questionId: string;
  selectedAnswer: number;
  correct: boolean;
  timeSpent?: number;
}

export interface KnowledgeMaterial extends BaseEntity {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  department?: string;
  createdBy: string;
  isPublished: boolean;
  viewCount: number;
  lastViewedAt?: Date;
}

export interface Assignment extends BaseEntity {
  id: string;
  title: string;
  description: string;
  testIds: string[];
  assignedTo: string[];
  assignedBy: string;
  dueDate?: Date;
  status: "pending" | "in_progress" | "completed" | "overdue";
  priority: "low" | "medium" | "high";
  department?: string;
}

export interface Notification extends BaseEntity {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  category: "test" | "assignment" | "system" | "achievement";
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
}

// Database операции
export interface DatabaseOperations<T> {
  findById(id: string | number): T | null;
  findAll(): T[];
  create(data: Omit<T, keyof BaseEntity>): T;
  update(id: string | number, data: Partial<T>): T | null;
  delete(id: string | number): boolean;
  findWhere(predicate: (item: T) => boolean): T[];
}

// Типы для API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Типы для форм
export interface EmployeeFormData {
  name: string;
  email: string;
  department: string;
  position: string;
  role: UserRole;
  status: EmployeeStatus;
  password?: string;
  phone?: string;
  notes?: string;
}

export interface TestFormData {
  title: string;
  description: string;
  category: string;
  difficulty: TestDifficulty;
  timeLimit: number;
  questions: TestQuestion[];
  department?: string;
}

// Утилитарные типы
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;