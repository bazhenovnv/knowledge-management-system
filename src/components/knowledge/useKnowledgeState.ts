import { useState } from 'react';
import { DatabaseKnowledgeMaterial, FileAttachment } from "@/utils/databaseService";
import { FormData, DrawingElement, BlurArea } from './types';

export const useKnowledgeState = () => {
  const [materials, setMaterials] = useState<DatabaseKnowledgeMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string[]>([]);
  const [viewingMaterial, setViewingMaterial] = useState<DatabaseKnowledgeMaterial | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<DatabaseKnowledgeMaterial | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

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
  const [draggedFileIndex, setDraggedFileIndex] = useState<number | null>(null);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageGallery, setImageGallery] = useState<FileAttachment[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editRotation, setEditRotation] = useState(0);
  const [editFilter, setEditFilter] = useState('none');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [resizingCrop, setResizingCrop] = useState<'tl' | 'tr' | 'bl' | 'br' | 'move' | null>(null);
  const [cropDragStart, setCropDragStart] = useState<{ x: number; y: number; cropX: number; cropY: number; cropWidth: number; cropHeight: number } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState<'pen' | 'arrow' | 'rect' | 'text'>('pen');
  const [drawColor, setDrawColor] = useState('#ff0000');
  const [drawSize, setDrawSize] = useState(3);
  const [drawings, setDrawings] = useState<DrawingElement[]>([]);
  const [currentPath, setCurrentPath] = useState<Array<{ x: number; y: number }>>([]);
  const [isDrawingShape, setIsDrawingShape] = useState(false);
  const [shapeStart, setShapeStart] = useState<{ x: number; y: number } | null>(null);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [blurAreas, setBlurAreas] = useState<BlurArea[]>([]);
  const [isBlurring, setIsBlurring] = useState(false);
  const [blurIntensity, setBlurIntensity] = useState(20);
  const [currentBlurArea, setCurrentBlurArea] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isDrawingBlur, setIsDrawingBlur] = useState(false);
  const [resizingBlur, setResizingBlur] = useState<{ index: number; handle: 'tl' | 'tr' | 'bl' | 'br' | 'move' } | null>(null);
  const [blurDragStart, setBlurDragStart] = useState<{ x: number; y: number; areaX: number; areaY: number; areaWidth: number; areaHeight: number } | null>(null);

  return {
    materials, setMaterials,
    loading, setLoading,
    selectedCategory, setSelectedCategory,
    selectedDepartmentFilter, setSelectedDepartmentFilter,
    viewingMaterial, setViewingMaterial,
    editingMaterial, setEditingMaterial,
    isCreating, setIsCreating,
    showPreview, setShowPreview,
    formData, setFormData,
    selectedDepartments, setSelectedDepartments,
    coverImagePreview, setCoverImagePreview,
    draggedFileIndex, setDraggedFileIndex,
    isDraggingFiles, setIsDraggingFiles,
    isDraggingCover, setIsDraggingCover,
    uploadingCount, setUploadingCount,
    previewImage, setPreviewImage,
    imageGallery, setImageGallery,
    currentImageIndex, setCurrentImageIndex,
    isPreviewMode, setIsPreviewMode,
    zoomLevel, setZoomLevel,
    imagePosition, setImagePosition,
    isDragging, setIsDragging,
    dragStart, setDragStart,
    isDownloading, setIsDownloading,
    isCopying, setIsCopying,
    isSharing, setIsSharing,
    isPrinting, setIsPrinting,
    isEditing, setIsEditing,
    editRotation, setEditRotation,
    editFilter, setEditFilter,
    isSavingEdit, setIsSavingEdit,
    isCropping, setIsCropping,
    cropArea, setCropArea,
    cropStart, setCropStart,
    isDraggingCrop, setIsDraggingCrop,
    resizingCrop, setResizingCrop,
    cropDragStart, setCropDragStart,
    isDrawing, setIsDrawing,
    drawMode, setDrawMode,
    drawColor, setDrawColor,
    drawSize, setDrawSize,
    drawings, setDrawings,
    currentPath, setCurrentPath,
    isDrawingShape, setIsDrawingShape,
    shapeStart, setShapeStart,
    textInput, setTextInput,
    textPosition, setTextPosition,
    showTextInput, setShowTextInput,
    blurAreas, setBlurAreas,
    isBlurring, setIsBlurring,
    blurIntensity, setBlurIntensity,
    currentBlurArea, setCurrentBlurArea,
    isDrawingBlur, setIsDrawingBlur,
    resizingBlur, setResizingBlur,
    blurDragStart, setBlurDragStart,
  };
};
