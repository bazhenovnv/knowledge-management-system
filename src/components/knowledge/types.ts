import { DatabaseKnowledgeMaterial, FileAttachment } from "@/utils/databaseService";

export interface KnowledgeTabProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  userRole?: string;
  currentUserId?: number;
  setIsEditingMode?: (isEditing: boolean) => void;
}

export interface FormData {
  title: string;
  description: string;
  content: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: string;
  tags: string;
  is_published: boolean;
  cover_image: string;
  attachments: FileAttachment[];
}

export interface DrawingElement {
  type: 'pen' | 'arrow' | 'rect' | 'text';
  points?: Array<{ x: number; y: number }>;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  text?: string;
  color: string;
  size: number;
}

export interface BlurArea {
  x: number;
  y: number;
  width: number;
  height: number;
  intensity: number;
}

export const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'hard':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getDifficultyLabel = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return 'Легкий';
    case 'medium':
      return 'Средний';
    case 'hard':
      return 'Сложный';
    default:
      return difficulty;
  }
};