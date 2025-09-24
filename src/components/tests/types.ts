export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  timeLimit?: number; // время на вопрос в секундах
}

export interface Test {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number; // в минутах
  questions: Question[];
  department?: string;
  createdBy: string;
  createdAt: Date;
  status: "draft" | "published" | "archived";
  totalAttempts: number;
  averageScore: number;
}

export interface TestResult {
  testId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  answers: { questionId: string; selectedAnswer: number; correct: boolean }[];
  completedAt: Date;
}

export interface TestFormData {
  title: string;
  description: string;
  category: string;
  difficulty: "easy" | "medium" | "hard" | "";
  timeLimit: number;
  department: string;
  questions: Question[];
}

export interface TestManagementProps {
  userRole: "admin" | "teacher" | "student";
  userId?: string;
}