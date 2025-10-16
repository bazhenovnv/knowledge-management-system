import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { databaseService, DatabaseKnowledgeMaterial, FileAttachment } from "@/utils/databaseService";
import { toast } from "sonner";
import { useDepartments } from "@/hooks/useDepartments";

interface KnowledgeTabProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  userRole?: string;
  currentUserId?: number;
}

const getDifficultyColor = (difficulty: string) => {
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

const getDifficultyLabel = (difficulty: string) => {
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

export const KnowledgeTab = ({
  searchQuery,
  setSearchQuery,
  userRole,
  currentUserId,
}: KnowledgeTabProps) => {
  const departmentsFromHook = useDepartments();
  const [materials, setMaterials] = useState<DatabaseKnowledgeMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string[]>([]);
  const [viewingMaterial, setViewingMaterial] = useState<DatabaseKnowledgeMaterial | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<DatabaseKnowledgeMaterial | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    duration: '',
    tags: '',
    is_published: true,
    cover_image: '',
    attachments: [] as FileAttachment[],
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
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState<'pen' | 'arrow' | 'rect' | 'text'>('pen');
  const [drawColor, setDrawColor] = useState('#ff0000');
  const [drawSize, setDrawSize] = useState(3);
  const [drawings, setDrawings] = useState<Array<{
    type: 'pen' | 'arrow' | 'rect' | 'text';
    points?: Array<{ x: number; y: number }>;
    start?: { x: number; y: number };
    end?: { x: number; y: number };
    text?: string;
    color: string;
    size: number;
  }>>([]);
  const [currentPath, setCurrentPath] = useState<Array<{ x: number; y: number }>>([]);
  const [isDrawingShape, setIsDrawingShape] = useState(false);
  const [shapeStart, setShapeStart] = useState<{ x: number; y: number } | null>(null);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  
  const departments = departmentsFromHook;

  useEffect(() => {
    loadMaterials();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!previewImage) return;
      
      if (e.key === 'Escape') {
        closeImagePreview();
      } else if (e.key === 'ArrowLeft' && imageGallery.length > 0) {
        const prevIndex = currentImageIndex === 0 ? imageGallery.length - 1 : currentImageIndex - 1;
        setCurrentImageIndex(prevIndex);
        setPreviewImage(imageGallery[prevIndex].url);
        resetZoom();
      } else if (e.key === 'ArrowRight' && imageGallery.length > 0) {
        const nextIndex = (currentImageIndex + 1) % imageGallery.length;
        setCurrentImageIndex(nextIndex);
        setPreviewImage(imageGallery[nextIndex].url);
        resetZoom();
      } else if ((e.key === 's' || e.key === 'S' || e.key === 'ы' || e.key === 'Ы') && imageGallery.length > 0) {
        e.preventDefault();
        handleDownloadImage();
      } else if ((e.key === 'c' || e.key === 'C' || e.key === 'с' || e.key === 'С') && imageGallery.length > 0) {
        e.preventDefault();
        handleCopyImage();
      } else if ((e.key === 'h' || e.key === 'H' || e.key === 'р' || e.key === 'Р') && imageGallery.length > 0) {
        e.preventDefault();
        handleShareImage();
      } else if ((e.key === 'p' || e.key === 'P' || e.key === 'з' || e.key === 'З') && imageGallery.length > 0) {
        e.preventDefault();
        handlePrintImage();
      } else if ((e.key === 'e' || e.key === 'E' || e.key === 'у' || e.key === 'У') && imageGallery.length > 0) {
        e.preventDefault();
        setIsEditing(!isEditing);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewImage, currentImageIndex, imageGallery]);

  const openImagePreview = (imageUrl: string, allImages: FileAttachment[]) => {
    const images = allImages.filter(file => file.type?.startsWith('image/'));
    const index = images.findIndex(img => img.url === imageUrl);
    setImageGallery(images);
    setCurrentImageIndex(index >= 0 ? index : 0);
    setPreviewImage(imageUrl);
    resetZoom();
    setIsEditing(false);
    setEditRotation(0);
    setEditFilter('none');
  };

  const handleNextImage = () => {
    if (imageGallery.length === 0) return;
    const nextIndex = (currentImageIndex + 1) % imageGallery.length;
    setCurrentImageIndex(nextIndex);
    setPreviewImage(imageGallery[nextIndex].url);
    resetZoom();
    setIsEditing(false);
    setEditRotation(0);
    setEditFilter('none');
  };

  const handlePrevImage = () => {
    if (imageGallery.length === 0) return;
    const prevIndex = currentImageIndex === 0 ? imageGallery.length - 1 : currentImageIndex - 1;
    setCurrentImageIndex(prevIndex);
    setPreviewImage(imageGallery[prevIndex].url);
    resetZoom();
    setIsEditing(false);
    setEditRotation(0);
    setEditFilter('none');
  };

  const closeImagePreview = () => {
    setPreviewImage(null);
    setImageGallery([]);
    setCurrentImageIndex(0);
    resetZoom();
    setIsEditing(false);
    setEditRotation(0);
    setEditFilter('none');
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 5));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) {
        setImagePosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  };

  const handleDoubleClick = () => {
    if (zoomLevel === 1) {
      setZoomLevel(2);
    } else {
      resetZoom();
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDownloadImage = () => {
    if (imageGallery.length > 0 && imageGallery[currentImageIndex]) {
      setIsDownloading(true);
      const currentImage = imageGallery[currentImageIndex];
      const link = document.createElement('a');
      link.href = currentImage.url;
      link.download = currentImage.name;
      link.click();
      
      setTimeout(() => {
        setIsDownloading(false);
        toast.success(`Скачан: ${currentImage.name}`);
      }, 500);
    }
  };

  const handleCopyImage = async () => {
    if (imageGallery.length > 0 && imageGallery[currentImageIndex]) {
      setIsCopying(true);
      const currentImage = imageGallery[currentImageIndex];
      
      if (!navigator.clipboard || !window.ClipboardItem) {
        setIsCopying(false);
        toast.error('Ваш браузер не поддерживает копирование изображений');
        return;
      }
      
      try {
        const response = await fetch(currentImage.url);
        const blob = await response.blob();
        
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob
          })
        ]);
        
        setTimeout(() => {
          setIsCopying(false);
          toast.success('Изображение скопировано! Можно вставлять (Ctrl+V)');
        }, 500);
      } catch (error) {
        console.error('Ошибка копирования:', error);
        setIsCopying(false);
        toast.error('Не удалось скопировать. Попробуйте скачать (S)');
      }
    }
  };

  const handleShareImage = async () => {
    if (imageGallery.length > 0 && imageGallery[currentImageIndex]) {
      setIsSharing(true);
      const currentImage = imageGallery[currentImageIndex];
      
      if (!navigator.share) {
        setIsSharing(false);
        toast.error('Ваш браузер не поддерживает функцию "Поделиться"');
        return;
      }
      
      try {
        const response = await fetch(currentImage.url);
        const blob = await response.blob();
        
        const fileName = currentImage.name || `image-${Date.now()}.${blob.type.split('/')[1] || 'png'}`;
        const file = new File([blob], fileName, { type: blob.type });
        
        const shareData: ShareData = {
          title: 'Изображение из базы знаний',
          text: 'Смотрите это изображение',
          files: [file]
        };
        
        if (navigator.canShare && !navigator.canShare(shareData)) {
          throw new Error('Sharing files is not supported');
        }
        
        await navigator.share(shareData);
        
        setTimeout(() => {
          setIsSharing(false);
          toast.success('Изображение отправлено!');
        }, 500);
      } catch (error: unknown) {
        console.error('Ошибка отправки:', error);
        setIsSharing(false);
        
        if ((error as Error).name === 'AbortError') {
          return;
        }
        
        toast.error('Не удалось отправить. Попробуйте копировать (C) или скачать (S)');
      }
    }
  };

  const handlePrintImage = async () => {
    if (imageGallery.length > 0 && imageGallery[currentImageIndex]) {
      setIsPrinting(true);
      const currentImage = imageGallery[currentImageIndex];
      
      try {
        const printWindow = window.open('', '_blank');
        
        if (!printWindow) {
          throw new Error('Popup blocked');
        }
        
        const img = new Image();
        img.src = currentImage.url;
        
        img.onload = () => {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Печать: ${currentImage.name || 'Изображение'}</title>
                <style>
                  * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                  }
                  body {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background: white;
                  }
                  img {
                    max-width: 100%;
                    max-height: 100vh;
                    width: auto;
                    height: auto;
                    object-fit: contain;
                  }
                  @media print {
                    body {
                      margin: 0;
                    }
                    img {
                      max-width: 100%;
                      max-height: 100%;
                      page-break-inside: avoid;
                    }
                  }
                </style>
              </head>
              <body>
                <img src="${currentImage.url}" alt="${currentImage.name || 'Изображение'}" />
                <script>
                  window.onload = function() {
                    setTimeout(function() {
                      window.print();
                      setTimeout(function() {
                        window.close();
                      }, 100);
                    }, 250);
                  };
                </script>
              </body>
            </html>
          `);
          printWindow.document.close();
          
          setTimeout(() => {
            setIsPrinting(false);
            toast.success('Отправлено на печать!');
          }, 500);
        };
        
        img.onerror = () => {
          printWindow.close();
          throw new Error('Image load failed');
        };
        
      } catch (error) {
        console.error('Ошибка печати:', error);
        setIsPrinting(false);
        toast.error('Не удалось открыть окно печати. Попробуйте скачать (S)');
      }
    }
  };

  const handleRotateImage = () => {
    setEditRotation((prev) => (prev + 90) % 360);
  };

  const handleApplyFilter = (filter: string) => {
    setEditFilter(filter);
  };

  const handleStartCrop = () => {
    setIsCropping(true);
    setCropArea({ x: 0, y: 0, width: 0, height: 0 });
  };

  const handleCancelCrop = () => {
    setIsCropping(false);
    setCropArea({ x: 0, y: 0, width: 0, height: 0 });
    setCropStart(null);
    setIsDraggingCrop(false);
  };

  const handleCropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCropping) return;
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCropStart({ x, y });
    setIsDraggingCrop(true);
    setCropArea({ x, y, width: 0, height: 0 });
  };

  const handleCropMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCropping || !isDraggingCrop || !cropStart) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    const width = currentX - cropStart.x;
    const height = currentY - cropStart.y;
    
    setCropArea({
      x: width < 0 ? currentX : cropStart.x,
      y: height < 0 ? currentY : cropStart.y,
      width: Math.abs(width),
      height: Math.abs(height)
    });
  };

  const handleCropMouseUp = () => {
    if (isDraggingCrop) {
      setIsDraggingCrop(false);
      setCropStart(null);
    }
  };

  const handleApplyCrop = async () => {
    if (cropArea.width === 0 || cropArea.height === 0) {
      toast.error('Выделите область для обрезки');
      return;
    }

    setIsSavingEdit(true);
    const currentImage = imageGallery[currentImageIndex];
    
    try {
      const response = await fetch(currentImage.url);
      const blob = await response.blob();
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = URL.createObjectURL(blob);
      });

      const imgElement = document.querySelector('.preview-image') as HTMLImageElement;
      if (!imgElement) return;

      const displayRect = imgElement.getBoundingClientRect();
      const scaleX = img.naturalWidth / displayRect.width;
      const scaleY = img.naturalHeight / displayRect.height;

      const cropX = cropArea.x * scaleX;
      const cropY = cropArea.y * scaleY;
      const cropWidth = cropArea.width * scaleX;
      const cropHeight = cropArea.height * scaleY;

      const canvas = document.createElement('canvas');
      canvas.width = cropWidth;
      canvas.height = cropHeight;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(
          img,
          cropX,
          cropY,
          cropWidth,
          cropHeight,
          0,
          0,
          cropWidth,
          cropHeight
        );
      }

      canvas.toBlob((croppedBlob) => {
        if (croppedBlob) {
          const url = URL.createObjectURL(croppedBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `cropped-${currentImage.name || 'image.png'}`;
          link.click();
          URL.revokeObjectURL(url);
          
          setTimeout(() => {
            setIsSavingEdit(false);
            handleCancelCrop();
            toast.success('Изображение обрезано!');
          }, 500);
        }
      }, 'image/png');
      
    } catch (error) {
      console.error('Ошибка обрезки:', error);
      setIsSavingEdit(false);
      toast.error('Не удалось обрезать изображение');
    }
  };

  const handleSaveEdit = async () => {
    if (imageGallery.length > 0 && imageGallery[currentImageIndex]) {
      setIsSavingEdit(true);
      const currentImage = imageGallery[currentImageIndex];
      
      try {
        const response = await fetch(currentImage.url);
        const blob = await response.blob();
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = URL.createObjectURL(blob);
        });
        
        const rotation = editRotation;
        if (rotation === 90 || rotation === 270) {
          canvas.width = img.height;
          canvas.height = img.width;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }
        
        if (ctx) {
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.translate(-img.width / 2, -img.height / 2);
          
          if (editFilter !== 'none') {
            ctx.filter = getFilterCSS(editFilter);
          }
          
          ctx.drawImage(img, 0, 0);
          ctx.restore();
        }
        
        canvas.toBlob((editedBlob) => {
          if (editedBlob) {
            const url = URL.createObjectURL(editedBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `edited-${currentImage.name || 'image.png'}`;
            link.click();
            URL.revokeObjectURL(url);
            
            setTimeout(() => {
              setIsSavingEdit(false);
              setIsEditing(false);
              setEditRotation(0);
              setEditFilter('none');
              toast.success('Изображение сохранено!');
            }, 500);
          }
        }, 'image/png');
        
      } catch (error) {
        console.error('Ошибка редактирования:', error);
        setIsSavingEdit(false);
        toast.error('Не удалось сохранить изменения');
      }
    }
  };

  const handleStartDrawing = () => {
    setIsDrawing(true);
    setDrawings([]);
    setCurrentPath([]);
  };

  const handleCancelDrawing = () => {
    setIsDrawing(false);
    setDrawings([]);
    setCurrentPath([]);
    setIsDrawingShape(false);
    setShapeStart(null);
    setShowTextInput(false);
    setTextInput('');
    setTextPosition(null);
  };

  const handleDrawMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing) return;
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (drawMode === 'pen') {
      setCurrentPath([{ x, y }]);
    } else if (drawMode === 'text') {
      setTextPosition({ x, y });
      setShowTextInput(true);
    } else {
      setShapeStart({ x, y });
      setIsDrawingShape(true);
    }
  };

  const handleDrawMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (drawMode === 'pen' && currentPath.length > 0) {
      setCurrentPath([...currentPath, { x, y }]);
    } else if (isDrawingShape && shapeStart) {
      // Обновляем конечную точку для preview
    }
  };

  const handleDrawMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (drawMode === 'pen' && currentPath.length > 0) {
      setDrawings([...drawings, {
        type: 'pen',
        points: currentPath,
        color: drawColor,
        size: drawSize
      }]);
      setCurrentPath([]);
    } else if (isDrawingShape && shapeStart) {
      setDrawings([...drawings, {
        type: drawMode,
        start: shapeStart,
        end: { x, y },
        color: drawColor,
        size: drawSize
      }]);
      setIsDrawingShape(false);
      setShapeStart(null);
    }
  };

  const handleAddText = () => {
    if (textInput.trim() && textPosition) {
      setDrawings([...drawings, {
        type: 'text',
        start: textPosition,
        text: textInput,
        color: drawColor,
        size: drawSize * 8
      }]);
      setTextInput('');
      setShowTextInput(false);
      setTextPosition(null);
    }
  };

  const handleSaveDrawing = async () => {
    if (drawings.length === 0) {
      toast.error('Нарисуйте что-нибудь перед сохранением');
      return;
    }

    setIsSavingEdit(true);
    const currentImage = imageGallery[currentImageIndex];
    
    try {
      const response = await fetch(currentImage.url);
      const blob = await response.blob();
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = URL.createObjectURL(blob);
      });

      const imgElement = document.querySelector('.preview-image') as HTMLImageElement;
      if (!imgElement) return;

      const displayRect = imgElement.getBoundingClientRect();
      const scaleX = img.naturalWidth / displayRect.width;
      const scaleY = img.naturalHeight / displayRect.height;

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(img, 0, 0);
        
        drawings.forEach(drawing => {
          ctx.strokeStyle = drawing.color;
          ctx.fillStyle = drawing.color;
          ctx.lineWidth = drawing.size * scaleX;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          
          if (drawing.type === 'pen' && drawing.points) {
            ctx.beginPath();
            drawing.points.forEach((point, index) => {
              const scaledX = point.x * scaleX;
              const scaledY = point.y * scaleY;
              if (index === 0) {
                ctx.moveTo(scaledX, scaledY);
              } else {
                ctx.lineTo(scaledX, scaledY);
              }
            });
            ctx.stroke();
          } else if (drawing.type === 'arrow' && drawing.start && drawing.end) {
            const startX = drawing.start.x * scaleX;
            const startY = drawing.start.y * scaleY;
            const endX = drawing.end.x * scaleX;
            const endY = drawing.end.y * scaleY;
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            
            const angle = Math.atan2(endY - startY, endX - startX);
            const arrowLength = 20 * scaleX;
            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(
              endX - arrowLength * Math.cos(angle - Math.PI / 6),
              endY - arrowLength * Math.sin(angle - Math.PI / 6)
            );
            ctx.moveTo(endX, endY);
            ctx.lineTo(
              endX - arrowLength * Math.cos(angle + Math.PI / 6),
              endY - arrowLength * Math.sin(angle + Math.PI / 6)
            );
            ctx.stroke();
          } else if (drawing.type === 'rect' && drawing.start && drawing.end) {
            const startX = drawing.start.x * scaleX;
            const startY = drawing.start.y * scaleY;
            const width = (drawing.end.x - drawing.start.x) * scaleX;
            const height = (drawing.end.y - drawing.start.y) * scaleY;
            ctx.strokeRect(startX, startY, width, height);
          } else if (drawing.type === 'text' && drawing.start && drawing.text) {
            const textX = drawing.start.x * scaleX;
            const textY = drawing.start.y * scaleY;
            ctx.font = `${drawing.size * scaleX}px Arial`;
            ctx.fillText(drawing.text, textX, textY);
          }
        });
      }

      canvas.toBlob((annotatedBlob) => {
        if (annotatedBlob) {
          const url = URL.createObjectURL(annotatedBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `annotated-${currentImage.name || 'image.png'}`;
          link.click();
          URL.revokeObjectURL(url);
          
          setTimeout(() => {
            setIsSavingEdit(false);
            handleCancelDrawing();
            toast.success('Изображение с аннотациями сохранено!');
          }, 500);
        }
      }, 'image/png');
      
    } catch (error) {
      console.error('Ошибка сохранения аннотаций:', error);
      setIsSavingEdit(false);
      toast.error('Не удалось сохранить аннотации');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditRotation(0);
    setEditFilter('none');
    handleCancelCrop();
    handleCancelDrawing();
  };

  const getFilterCSS = (filter: string): string => {
    switch (filter) {
      case 'grayscale':
        return 'grayscale(100%)';
      case 'sepia':
        return 'sepia(100%)';
      case 'blur':
        return 'blur(3px)';
      case 'brightness':
        return 'brightness(150%)';
      case 'contrast':
        return 'contrast(150%)';
      case 'invert':
        return 'invert(100%)';
      default:
        return 'none';
    }
  };

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const materialsFromDB = await databaseService.getKnowledgeMaterials();
      setMaterials(materialsFromDB);
    } catch (error) {
      console.error('Ошибка загрузки материалов:', error);
      toast.error('Ошибка загрузки материалов');
    } finally {
      setLoading(false);
    }
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = !searchQuery || 
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const materialDepartments = material.category ? material.category.split(', ').map(d => d.trim()) : [];
    const matchesDepartment = selectedDepartmentFilter.length === 0 || 
      selectedDepartmentFilter.some(dept => materialDepartments.includes(dept));
    
    return matchesSearch && matchesDepartment && material.is_published;
  });

  const allDepartments = departmentsFromHook.sort();

  const canEditMaterial = (userRole === 'admin' || userRole === 'teacher');

  const handleCreateMaterial = () => {
    setIsCreating(true);
    setFormData({
      title: '',
      description: '',
      content: '',
      category: '',
      difficulty: 'medium',
      duration: '1 час',
      tags: '',
      is_published: true,
      cover_image: '',
      attachments: [],
    });
    setSelectedDepartments([]);
    setCoverImagePreview('');
  };

  const handleEditMaterial = (material: DatabaseKnowledgeMaterial) => {
    setEditingMaterial(material);
    setFormData({
      title: material.title,
      description: material.description,
      content: material.content,
      category: material.category,
      difficulty: material.difficulty,
      duration: material.duration || '1 час',
      tags: material.tags.join(', '),
      is_published: material.is_published,
      cover_image: material.cover_image || '',
      attachments: material.attachments || [],
    });
    setSelectedDepartments(material.category ? material.category.split(', ') : []);
    setCoverImagePreview(material.cover_image || '');
  };

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Размер файла не должен превышать 5 МБ');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setCoverImagePreview(base64);
        setFormData({ ...formData, cover_image: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploadingCount(files.length);
    const newAttachments: FileAttachment[] = [];
    let processedFiles = 0;
    const errorFiles: string[] = [];

    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        errorFiles.push(`${file.name} (превышает 10 МБ)`);
        processedFiles++;
        if (processedFiles === files.length) {
          setUploadingCount(0);
          if (newAttachments.length > 0) {
            toast.success(`Загружено файлов: ${newAttachments.length}`);
          }
          if (errorFiles.length > 0) {
            toast.error(`Не удалось загрузить: ${errorFiles.join(', ')}`);
          }
        }
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        newAttachments.push({
          name: file.name,
          url: base64,
          type: file.type,
          size: file.size,
        });
        processedFiles++;

        if (processedFiles === files.length) {
          setFormData(prev => ({
            ...prev,
            attachments: [...prev.attachments, ...newAttachments],
          }));
          setUploadingCount(0);
          if (newAttachments.length > 0) {
            toast.success(`Загружено файлов: ${newAttachments.length}`);
          }
          if (errorFiles.length > 0) {
            toast.error(`Не удалось загрузить: ${errorFiles.join(', ')}`);
          }
        }
      };
      reader.onerror = () => {
        errorFiles.push(`${file.name} (ошибка загрузки)`);
        processedFiles++;
        if (processedFiles === files.length) {
          setUploadingCount(0);
          if (newAttachments.length > 0) {
            toast.success(`Загружено файлов: ${newAttachments.length}`);
          }
          if (errorFiles.length > 0) {
            toast.error(`Не удалось загрузить: ${errorFiles.join(', ')}`);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveAttachment = (index: number) => {
    const newAttachments = formData.attachments.filter((_, i) => i !== index);
    setFormData({ ...formData, attachments: newAttachments });
  };

  const handleMoveAttachment = (fromIndex: number, toIndex: number) => {
    const newAttachments = [...formData.attachments];
    const [movedFile] = newAttachments.splice(fromIndex, 1);
    newAttachments.splice(toIndex, 0, movedFile);
    setFormData({ ...formData, attachments: newAttachments });
  };

  const handleDragStart = (index: number) => {
    setDraggedFileIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedFileIndex === null || draggedFileIndex === dropIndex) return;
    
    const newAttachments = [...formData.attachments];
    const [draggedFile] = newAttachments.splice(draggedFileIndex, 1);
    newAttachments.splice(dropIndex, 0, draggedFile);
    
    setFormData({ ...formData, attachments: newAttachments });
    setDraggedFileIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedFileIndex(null);
  };

  const handleFileDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFiles(true);
  };

  const handleFileDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDraggingFiles(false);
    }
  };

  const handleFileDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFiles(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    setUploadingCount(files.length);
    let successCount = 0;
    const errorFiles: string[] = [];

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        errorFiles.push(`${file.name} (превышает 10 МБ)`);
        continue;
      }

      try {
        const base64 = await fileToBase64(file);
        const newFile: AttachmentFile = {
          name: file.name,
          size: file.size,
          type: file.type,
          url: base64,
        };
        setFormData((prev) => ({
          ...prev,
          attachments: [...prev.attachments, newFile],
        }));
        successCount++;
      } catch (error) {
        errorFiles.push(`${file.name} (ошибка загрузки)`);
      }
    }

    setUploadingCount(0);

    if (successCount > 0) {
      toast.success(`Загружено файлов: ${successCount}`);
    }
    if (errorFiles.length > 0) {
      toast.error(`Не удалось загрузить: ${errorFiles.join(', ')}`);
    }
  };

  const handleCoverDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingCover(true);
  };

  const handleCoverDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDraggingCover(false);
    }
  };

  const handleCoverDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleCoverDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingCover(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, загрузите изображение');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Размер изображения не должен превышать 5 МБ');
      return;
    }

    const base64 = await fileToBase64(file);
    setCoverImagePreview(base64);
    setFormData({ ...formData, cover_image: base64 });
  };

  const handlePreviewMaterial = () => {
    setShowPreview(true);
  };

  const handleSaveMaterial = async () => {
    try {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      const categoryString = selectedDepartments.join(', ');
      
      if (editingMaterial) {
        await databaseService.updateKnowledgeMaterial(editingMaterial.id, {
          ...formData,
          category: categoryString,
          tags: tagsArray,
        });
        toast.success('Материал обновлен');
      } else {
        await databaseService.createKnowledgeMaterial({
          ...formData,
          category: categoryString,
          tags: tagsArray,
          created_by: `User ${currentUserId}`,
        });
        toast.success('Материал создан');
      }
      
      await loadMaterials();
      setIsCreating(false);
      setEditingMaterial(null);
    } catch (error) {
      console.error('Ошибка сохранения материала:', error);
      toast.error('Ошибка сохранения материала');
    }
  };

  const handleDeleteMaterial = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот материал?')) return;
    
    try {
      await databaseService.deleteKnowledgeMaterial(id);
      toast.success('Материал удален');
      await loadMaterials();
    } catch (error) {
      console.error('Ошибка удаления материала:', error);
      toast.error('Ошибка удаления материала');
    }
  };

  const closeModal = () => {
    setIsCreating(false);
    setEditingMaterial(null);
    setCoverImagePreview('');
    setShowPreview(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Icon name="Loader2" size={32} className="animate-spin mx-auto mb-4" />
          <p>Загрузка материалов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">База знаний</h2>
        {canEditMaterial && (
          <Button
            onClick={handleCreateMaterial}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Icon name="Plus" size={20} className="mr-2" />
            Добавить материал
          </Button>
        )}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Search" size={20} />
            Поиск по базе знаний
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="relative">
              <Icon
                name="Search"
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <Input
                type="text"
                placeholder="Поиск материалов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Filter" size={20} />
            Фильтр по отделам
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {allDepartments.map((dept) => (
              <Badge
                key={dept}
                variant={selectedDepartmentFilter.includes(dept) ? "default" : "outline"}
                className="cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={() => {
                  if (selectedDepartmentFilter.includes(dept)) {
                    setSelectedDepartmentFilter(selectedDepartmentFilter.filter(d => d !== dept));
                  } else {
                    setSelectedDepartmentFilter([...selectedDepartmentFilter, dept]);
                  }
                }}
              >
                {dept}
              </Badge>
            ))}
            {selectedDepartmentFilter.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedDepartmentFilter([])}
                className="ml-2"
              >
                <Icon name="X" size={16} className="mr-1" />
                Сбросить
              </Button>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="secondary">
              Найдено: {filteredMaterials.length}
            </Badge>
            {selectedDepartmentFilter.length > 0 && (
              <span className="text-sm text-gray-600">
                (фильтр: {selectedDepartmentFilter.join(', ')})
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            {item.cover_image && (
              <div className="w-full h-48 overflow-hidden rounded-t-lg">
                <img
                  src={item.cover_image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <Badge className={getDifficultyColor(item.difficulty)}>
                  {getDifficultyLabel(item.difficulty)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{item.category}</span>
                <span>{item.duration}</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-4">
                {item.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              {item.attachments && item.attachments.length > 0 && (
                <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                  <Icon name="Paperclip" size={14} />
                  <span>{item.attachments.length} файлов</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon
                    name="Star"
                    size={16}
                    className="text-yellow-500 fill-current"
                  />
                  <span className="text-sm">{Number(item.rating || 0).toFixed(1)}</span>
                  <span className="text-sm text-gray-500">
                    ({item.enrollments || 0})
                  </span>
                </div>
                <div className="flex gap-2">
                  {canEditMaterial && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditMaterial(item)}
                      >
                        <Icon name="Edit" size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteMaterial(item.id)}
                      >
                        <Icon name="Trash2" size={14} />
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={() => setViewingMaterial(item)}
                  >
                    <Icon name="BookOpen" size={14} className="mr-1" />
                    Изучить
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="text-center py-12">
          <Icon name="BookOpen" size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Материалы не найдены
          </h3>
          <p className="text-gray-600 mb-4">
            Попробуйте изменить критерии поиска
          </p>
        </div>
      )}

      {viewingMaterial && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{viewingMaterial.title}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <Badge className={getDifficultyColor(viewingMaterial.difficulty)}>
                    {getDifficultyLabel(viewingMaterial.difficulty)}
                  </Badge>
                  <span className="text-sm text-gray-600">{viewingMaterial.category}</span>
                  <span className="text-sm text-gray-600">{viewingMaterial.duration}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewingMaterial(null)}
              >
                <Icon name="X" size={20} />
              </Button>
            </div>
            <div className="p-6">
              {viewingMaterial.cover_image && (
                <img
                  src={viewingMaterial.cover_image}
                  alt={viewingMaterial.title}
                  className="w-full max-h-96 object-cover rounded-lg mb-6"
                />
              )}
              <div className="prose max-w-none">
                <p className="text-gray-600 mb-6">{viewingMaterial.description}</p>
                <div className="whitespace-pre-wrap mb-6">{viewingMaterial.content}</div>
              </div>
              
              {viewingMaterial.attachments && viewingMaterial.attachments.length > 0 && (
                <div className="mt-6 border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Прикрепленные файлы ({viewingMaterial.attachments.length})</h3>
                  <div className="space-y-4">
                    {viewingMaterial.attachments.map((file, index) => (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        {file.type?.startsWith('image/') ? (
                          <div>
                            <div 
                              className="relative group cursor-pointer"
                              onClick={() => openImagePreview(file.url, viewingMaterial.attachments || [])}
                            >
                              <img
                                src={file.url}
                                alt={file.name}
                                className="w-full max-h-96 object-contain bg-gray-50 transition-transform group-hover:scale-105"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="text-white text-center">
                                  <Icon name="Eye" size={40} className="mx-auto mb-2" />
                                  <p className="text-sm font-medium">Увеличить</p>
                                </div>
                              </div>
                            </div>
                            <div className="p-3 bg-white border-t flex items-center justify-between">
                              <div>
                                <p className="font-medium text-sm">{file.name}</p>
                                <p className="text-xs text-gray-500">
                                  {(file.size / 1024).toFixed(1)} КБ
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = file.url;
                                  link.download = file.name;
                                  link.click();
                                }}
                              >
                                <Icon name="Download" size={16} />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 p-4">
                            <Icon name="File" size={24} className="text-gray-500" />
                            <div className="flex-1">
                              <p className="font-medium">{file.name}</p>
                              <p className="text-sm text-gray-500">
                                {(file.size / 1024).toFixed(1)} КБ
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = file.url;
                                link.download = file.name;
                                link.click();
                              }}
                            >
                              <Icon name="Download" size={16} />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{formData.title || 'Предпросмотр материала'}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <Badge className={getDifficultyColor(formData.difficulty)}>
                    {getDifficultyLabel(formData.difficulty)}
                  </Badge>
                  <span className="text-sm text-gray-600">{selectedDepartments.join(', ') || 'Не указан отдел'}</span>
                  <span className="text-sm text-gray-600">{formData.duration}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(false)}
              >
                <Icon name="X" size={20} />
              </Button>
            </div>
            <div className="p-6">
              {coverImagePreview && (
                <img
                  src={coverImagePreview}
                  alt={formData.title}
                  className="w-full max-h-96 object-cover rounded-lg mb-6"
                />
              )}
              <div className="prose max-w-none">
                <p className="text-gray-600 mb-6 text-lg">{formData.description || 'Описание отсутствует'}</p>
                <div className="whitespace-pre-wrap mb-6 text-base leading-relaxed">{formData.content || 'Содержание отсутствует'}</div>
              </div>
              
              {formData.attachments && formData.attachments.length > 0 && (
                <div className="mt-6 border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Прикрепленные файлы ({formData.attachments.length})</h3>
                  <div className="space-y-4">
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        {file.type?.startsWith('image/') ? (
                          <div>
                            <div 
                              className="relative group cursor-pointer"
                              onClick={() => openImagePreview(file.url, formData.attachments)}
                            >
                              <img
                                src={file.url}
                                alt={file.name}
                                className="w-full max-h-96 object-contain bg-gray-50 transition-transform group-hover:scale-105"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="text-white text-center">
                                  <Icon name="Eye" size={40} className="mx-auto mb-2" />
                                  <p className="text-sm font-medium">Увеличить</p>
                                </div>
                              </div>
                            </div>
                            <div className="p-3 bg-white border-t">
                              <p className="font-medium text-sm">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {(file.size / 1024).toFixed(1)} КБ
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 p-4">
                            <Icon name="File" size={24} className="text-gray-500" />
                            <div className="flex-1">
                              <p className="font-medium">{file.name}</p>
                              <p className="text-sm text-gray-500">
                                {(file.size / 1024).toFixed(1)} КБ
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formData.tags && formData.tags.trim() && (
                <div className="mt-6 border-t pt-6">
                  <h3 className="text-sm font-semibold mb-3">Теги</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.split(',').map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Закрыть предпросмотр
              </Button>
              <Button
                onClick={() => {
                  setShowPreview(false);
                  handleSaveMaterial();
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={!formData.title || !formData.description || !formData.content || selectedDepartments.length === 0}
              >
                {editingMaterial ? 'Сохранить материал' : 'Создать материал'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {(isCreating || editingMaterial) && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {editingMaterial ? 'Редактировать материал' : 'Создать материал'}
              </h2>
              <Button variant="ghost" size="sm" onClick={closeModal}>
                <Icon name="X" size={20} />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Обложка материала</label>
                <div
                  className={`border-2 border-dashed rounded-lg p-4 transition-all ${
                    isDraggingCover
                      ? 'border-blue-500 bg-blue-50 scale-105'
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                  onDragEnter={handleCoverDragEnter}
                  onDragLeave={handleCoverDragLeave}
                  onDragOver={handleCoverDragOver}
                  onDrop={handleCoverDrop}
                >
                  {coverImagePreview ? (
                    <div className="relative">
                      <img
                        src={coverImagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setCoverImagePreview('');
                          setFormData({ ...formData, cover_image: '' });
                        }}
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Icon
                        name={isDraggingCover ? 'Upload' : 'Image'}
                        size={32}
                        className={`mx-auto mb-2 ${
                          isDraggingCover ? 'text-blue-500 animate-bounce' : 'text-gray-400'
                        }`}
                      />
                      <p className={`mb-2 font-medium ${
                        isDraggingCover ? 'text-blue-600' : 'text-gray-700'
                      }`}>
                        {isDraggingCover ? 'Отпустите изображение здесь' : 'Перетащите изображение сюда'}
                      </p>
                      <p className="text-sm text-gray-500 mb-2">или</p>
                      <label className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
                        Выберите файл
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleCoverImageUpload}
                        />
                      </label>
                      <p className="text-xs text-gray-400 mt-2">До 5 МБ</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Название *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Введите название материала"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Описание *</label>
                <textarea
                  className="w-full border rounded px-3 py-2 min-h-[80px]"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Краткое описание материала"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Содержание *</label>
                <textarea
                  className="w-full border rounded px-3 py-2 min-h-[200px]"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Полное содержание материала"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Отделы * (выберите один или несколько)</label>
                <div className="border rounded px-3 py-2 max-h-48 overflow-y-auto">
                  {departments.map((dept) => (
                    <div key={dept} className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        id={`dept-${dept}`}
                        checked={selectedDepartments.includes(dept)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDepartments([...selectedDepartments, dept]);
                          } else {
                            setSelectedDepartments(selectedDepartments.filter(d => d !== dept));
                          }
                        }}
                      />
                      <label htmlFor={`dept-${dept}`} className="text-sm cursor-pointer">
                        {dept}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedDepartments.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedDepartments.map((dept) => (
                      <Badge key={dept} variant="secondary" className="text-xs">
                        {dept}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Сложность</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                  >
                    <option value="easy">Легкий</option>
                    <option value="medium">Средний</option>
                    <option value="hard">Сложный</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Теги</label>
                  <Input
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="Через запятую: React, TypeScript"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Прикрепленные файлы</label>
                {uploadingCount > 0 && (
                  <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-sm text-green-700">
                    <Icon name="Loader" size={16} className="animate-spin" />
                    <span>Загрузка {uploadingCount} файл(ов)...</span>
                  </div>
                )}
                {formData.attachments.length > 0 && uploadingCount === 0 && (
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-sm text-blue-700">
                    <Icon name="Info" size={16} />
                    <span>Перетаскивайте файлы мышкой для изменения порядка или используйте кнопки ▲▼</span>
                  </div>
                )}
                <div className="space-y-2">
                  {formData.attachments.map((file, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-move transition-all ${
                        draggedFileIndex === index ? 'opacity-40 scale-95' : ''
                      } ${draggedFileIndex !== null && draggedFileIndex !== index ? 'border-blue-300 bg-blue-50' : ''}`}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="flex items-center gap-2">
                        <Icon name="GripVertical" size={16} className="text-gray-400" />
                        {file.type?.startsWith('image/') ? (
                          <div 
                            className="relative group cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              openImagePreview(file.url, formData.attachments);
                            }}
                          >
                            <img 
                              src={file.url} 
                              alt={file.name} 
                              className="w-12 h-12 object-cover rounded transition-transform group-hover:scale-110" 
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              <Icon name="Eye" size={20} className="text-white" />
                            </div>
                          </div>
                        ) : (
                          <Icon name="File" size={20} className="text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(1)} КБ
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {file.type?.startsWith('image/') && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openImagePreview(file.url, formData.attachments)}
                            title="Посмотреть изображение"
                          >
                            <Icon name="Eye" size={16} />
                          </Button>
                        )}
                        {index > 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMoveAttachment(index, index - 1)}
                            title="Переместить вверх"
                          >
                            <Icon name="ChevronUp" size={16} />
                          </Button>
                        )}
                        {index < formData.attachments.length - 1 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMoveAttachment(index, index + 1)}
                            title="Переместить вниз"
                          >
                            <Icon name="ChevronDown" size={16} />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveAttachment(index)}
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                      isDraggingFiles
                        ? 'border-blue-500 bg-blue-50 scale-105'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                    onDragEnter={handleFileDragEnter}
                    onDragLeave={handleFileDragLeave}
                    onDragOver={handleFileDragOver}
                    onDrop={handleFileDrop}
                  >
                    <Icon
                      name={isDraggingFiles ? 'Upload' : 'Paperclip'}
                      size={32}
                      className={`mx-auto mb-3 ${
                        isDraggingFiles ? 'text-blue-500 animate-bounce' : 'text-gray-400'
                      }`}
                    />
                    <p className={`mb-2 font-medium ${
                      isDraggingFiles ? 'text-blue-600' : 'text-gray-700'
                    }`}>
                      {isDraggingFiles ? 'Отпустите файлы здесь' : 'Перетащите файлы сюда'}
                    </p>
                    <p className="text-sm text-gray-500 mb-3">или</p>
                    <label className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
                      Выберите файлы
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                    <p className="text-xs text-gray-400 mt-2">До 10 МБ каждый</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                />
                <label htmlFor="is_published" className="text-sm font-medium">
                  Опубликовать материал
                </label>
              </div>
              
              <div className="flex justify-between gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handlePreviewMaterial}
                  className="border-purple-500 text-purple-600 hover:bg-purple-50"
                  disabled={!formData.title || !formData.content}
                >
                  <Icon name="Eye" size={16} className="mr-2" />
                  Предпросмотр
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={closeModal}>
                    Отмена
                  </Button>
                  <Button
                    onClick={handleSaveMaterial}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={!formData.title || !formData.description || !formData.content || selectedDepartments.length === 0}
                  >
                    {editingMaterial ? 'Сохранить' : 'Создать'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={closeImagePreview}
        >
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
              {imageGallery.length > 0 && imageGallery[currentImageIndex] && (
                <div className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg max-w-md">
                  <p className="font-medium truncate">{imageGallery[currentImageIndex].name}</p>
                  <p className="text-xs text-white/80">
                    {(imageGallery[currentImageIndex].size / 1024).toFixed(1)} КБ
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all ${
                    isCopying ? 'scale-90 bg-blue-500/30' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyImage();
                  }}
                  disabled={isCopying}
                  title="Копировать в буфер обмена (C)"
                >
                  {isCopying ? (
                    <Icon name="Check" size={20} className="animate-pulse" />
                  ) : (
                    <Icon name="Copy" size={20} />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all ${
                    isSharing ? 'scale-90 bg-purple-500/30' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShareImage();
                  }}
                  disabled={isSharing}
                  title="Поделиться (H)"
                >
                  {isSharing ? (
                    <Icon name="Check" size={20} className="animate-pulse" />
                  ) : (
                    <Icon name="Share2" size={20} />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all ${
                    isPrinting ? 'scale-90 bg-orange-500/30' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrintImage();
                  }}
                  disabled={isPrinting}
                  title="Печать (P)"
                >
                  {isPrinting ? (
                    <Icon name="Check" size={20} className="animate-pulse" />
                  ) : (
                    <Icon name="Printer" size={20} />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all ${
                    isDownloading ? 'scale-90 bg-green-500/30' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadImage();
                  }}
                  disabled={isDownloading}
                  title="Скачать изображение (S)"
                >
                  {isDownloading ? (
                    <Icon name="Check" size={20} className="animate-pulse" />
                  ) : (
                    <Icon name="Download" size={20} />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(!isEditing);
                  }}
                  title="Редактировать (E)"
                >
                  <Icon name="Edit" size={20} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
                  onClick={closeImagePreview}
                  title="Закрыть (Esc)"
                >
                  <Icon name="X" size={24} />
                </Button>
              </div>
            </div>

            {isEditing && (
              <div 
                className="absolute top-20 right-4 bg-white/10 backdrop-blur-md text-white p-4 rounded-xl z-20 w-64 animate-in slide-in-from-right duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm">Редактирование</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-white/20"
                    onClick={handleCancelEdit}
                  >
                    <Icon name="X" size={16} />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-white/70 mb-2">Обрезка</p>
                    {!isCropping ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-white/5 hover:bg-white/20 text-white border-white/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartCrop();
                        }}
                      >
                        <Icon name="Crop" size={16} className="mr-2" />
                        Обрезать
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-white/90">Выделите область мышью</p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-white/5 hover:bg-white/20 text-white border-white/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelCrop();
                            }}
                          >
                            Отмена
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApplyCrop();
                            }}
                            disabled={isSavingEdit || cropArea.width === 0}
                          >
                            {isSavingEdit ? (
                              <>
                                <Icon name="Loader2" size={14} className="mr-1 animate-spin" />
                                ...
                              </>
                            ) : (
                              <>
                                <Icon name="Check" size={14} className="mr-1" />
                                Готово
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-white/70 mb-2">Рисование</p>
                    {!isDrawing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-white/5 hover:bg-white/20 text-white border-white/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartDrawing();
                        }}
                        disabled={isCropping}
                      >
                        <Icon name="Pencil" size={16} className="mr-2" />
                        Аннотации
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-4 gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className={`p-2 bg-white/5 hover:bg-white/20 text-white border-white/20 ${
                              drawMode === 'pen' ? 'bg-white/20' : ''
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setDrawMode('pen');
                            }}
                            title="Карандаш"
                          >
                            <Icon name="Pencil" size={14} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className={`p-2 bg-white/5 hover:bg-white/20 text-white border-white/20 ${
                              drawMode === 'arrow' ? 'bg-white/20' : ''
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setDrawMode('arrow');
                            }}
                            title="Стрелка"
                          >
                            <Icon name="ArrowRight" size={14} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className={`p-2 bg-white/5 hover:bg-white/20 text-white border-white/20 ${
                              drawMode === 'rect' ? 'bg-white/20' : ''
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setDrawMode('rect');
                            }}
                            title="Прямоугольник"
                          >
                            <Icon name="Square" size={14} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className={`p-2 bg-white/5 hover:bg-white/20 text-white border-white/20 ${
                              drawMode === 'text' ? 'bg-white/20' : ''
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setDrawMode('text');
                            }}
                            title="Текст"
                          >
                            <Icon name="Type" size={14} />
                          </Button>
                        </div>

                        <div>
                          <p className="text-xs text-white/70 mb-1">Цвет</p>
                          <div className="grid grid-cols-6 gap-1">
                            {['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#ffffff'].map(color => (
                              <button
                                key={color}
                                className={`w-8 h-8 rounded border-2 ${
                                  drawColor === color ? 'border-white' : 'border-white/20'
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDrawColor(color);
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-white/70 mb-1">Толщина: {drawSize}px</p>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={drawSize}
                            onChange={(e) => {
                              e.stopPropagation();
                              setDrawSize(Number(e.target.value));
                            }}
                            className="w-full"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-white/5 hover:bg-white/20 text-white border-white/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelDrawing();
                            }}
                          >
                            Отмена
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveDrawing();
                            }}
                            disabled={isSavingEdit || drawings.length === 0}
                          >
                            {isSavingEdit ? (
                              <>
                                <Icon name="Loader2" size={14} className="mr-1 animate-spin" />
                                ...
                              </>
                            ) : (
                              <>
                                <Icon name="Check" size={14} className="mr-1" />
                                Готово
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-white/70 mb-2">Поворот</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-white/5 hover:bg-white/20 text-white border-white/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRotateImage();
                      }}
                      disabled={isCropping}
                    >
                      <Icon name="RotateCw" size={16} className="mr-2" />
                      Повернуть 90°
                    </Button>
                  </div>

                  <div>
                    <p className="text-xs text-white/70 mb-2">Фильтры</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className={`text-xs bg-white/5 hover:bg-white/20 text-white border-white/20 ${
                          editFilter === 'none' ? 'bg-white/20' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyFilter('none');
                        }}
                      >
                        Оригинал
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`text-xs bg-white/5 hover:bg-white/20 text-white border-white/20 ${
                          editFilter === 'grayscale' ? 'bg-white/20' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyFilter('grayscale');
                        }}
                      >
                        Ч/Б
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`text-xs bg-white/5 hover:bg-white/20 text-white border-white/20 ${
                          editFilter === 'sepia' ? 'bg-white/20' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyFilter('sepia');
                        }}
                      >
                        Сепия
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`text-xs bg-white/5 hover:bg-white/20 text-white border-white/20 ${
                          editFilter === 'brightness' ? 'bg-white/20' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyFilter('brightness');
                        }}
                      >
                        Яркость
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`text-xs bg-white/5 hover:bg-white/20 text-white border-white/20 ${
                          editFilter === 'contrast' ? 'bg-white/20' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyFilter('contrast');
                        }}
                      >
                        Контраст
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`text-xs bg-white/5 hover:bg-white/20 text-white border-white/20 ${
                          editFilter === 'invert' ? 'bg-white/20' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyFilter('invert');
                        }}
                      >
                        Негатив
                      </Button>
                    </div>
                  </div>

                  {!isCropping && (
                    <div className="pt-2 border-t border-white/20 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-white/5 hover:bg-white/20 text-white border-white/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelEdit();
                        }}
                      >
                        Отмена
                      </Button>
                      <Button
                        size="sm"
                        className={`flex-1 bg-blue-500 hover:bg-blue-600 text-white ${
                          isSavingEdit ? 'opacity-50' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveEdit();
                        }}
                        disabled={isSavingEdit}
                      >
                        {isSavingEdit ? (
                          <>
                            <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                            Сохранение...
                        </>
                      ) : (
                        <>
                          <Icon name="Check" size={16} className="mr-2" />
                          Сохранить
                        </>
                      )}
                    </Button>
                  </div>
                  )}
                </div>
              </div>
            )}

            {isCropping && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-blue-500/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm border border-blue-400/50 animate-pulse">
                🖱️ Выделите область для обрезки мышью
              </div>
            )}

            {!isCropping && !isDrawing && imageGallery.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="lg"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm z-10 h-16 w-16 transition-all hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevImage();
                  }}
                  title="Предыдущее изображение (←)"
                >
                  <Icon name="ChevronLeft" size={32} />
                </Button>

                <Button
                  variant="ghost"
                  size="lg"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm z-10 h-16 w-16 transition-all hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextImage();
                  }}
                  title="Следующее изображение (→)"
                >
                  <Icon name="ChevronRight" size={32} />
                </Button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                  <div className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                    {currentImageIndex + 1} / {imageGallery.length}
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm text-white/70 px-3 py-1 rounded-full text-xs flex items-center gap-2">
                    <span>← →</span>
                    <span>листать</span>
                    <span className="mx-1">•</span>
                    <span>2× клик</span>
                    <span>зум</span>
                    <span className="mx-1">•</span>
                    <span>C</span>
                    <span>копия</span>
                    <span className="mx-1">•</span>
                    <span>H</span>
                    <span>поделиться</span>
                    <span className="mx-1">•</span>
                    <span>P</span>
                    <span>печать</span>
                    <span className="mx-1">•</span>
                    <span>E</span>
                    <span>редактор</span>
                    <span className="mx-1">•</span>
                    <span>S</span>
                    <span>скачать</span>
                    <span className="mx-1">•</span>
                    <span>Esc</span>
                    <span>закрыть</span>
                  </div>
                </div>
              </>
            )}

            {!isCropping && !isDrawing && imageGallery.length === 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/5 backdrop-blur-sm text-white/70 px-3 py-1 rounded-full text-xs flex items-center gap-2">
                <span>2× клик</span>
                <span>зум</span>
                <span className="mx-1">•</span>
                <span>C</span>
                <span>копия</span>
                <span className="mx-1">•</span>
                <span>H</span>
                <span>поделиться</span>
                <span className="mx-1">•</span>
                <span>P</span>
                <span>печать</span>
                <span className="mx-1">•</span>
                <span>E</span>
                <span>редактор</span>
                <span className="mx-1">•</span>
                <span>S</span>
                <span>скачать</span>
                <span className="mx-1">•</span>
                <span>Esc</span>
                <span>закрыть</span>
              </div>
            )}

            <div className="absolute bottom-4 right-4 flex gap-2 z-10">
              <Button
                variant="ghost"
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomOut();
                }}
                disabled={zoomLevel <= 1}
                title="Уменьшить (колесо мыши)"
              >
                <Icon name="ZoomOut" size={20} />
              </Button>
              <div className="bg-white/10 backdrop-blur-sm text-white px-3 py-1 rounded text-sm min-w-[60px] text-center">
                {Math.round(zoomLevel * 100)}%
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomIn();
                }}
                disabled={zoomLevel >= 5}
                title="Увеличить (колесо мыши)"
              >
                <Icon name="ZoomIn" size={20} />
              </Button>
              {zoomLevel > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetZoom();
                  }}
                  title="Сбросить зум"
                >
                  <Icon name="Minimize2" size={20} />
                </Button>
              )}
            </div>
            
            <div 
              className={`overflow-hidden relative ${
                isDrawing ? 'cursor-crosshair' : 
                (zoomLevel > 1 && !isCropping ? 'cursor-move' : 'cursor-default')
              }`}
              onWheel={!isCropping && !isDrawing ? handleWheel : undefined}
              onMouseDown={
                isCropping ? handleCropMouseDown : 
                isDrawing ? handleDrawMouseDown : 
                handleMouseDown
              }
              onMouseMove={
                isCropping ? handleCropMouseMove : 
                isDrawing ? handleDrawMouseMove : 
                handleMouseMove
              }
              onMouseUp={
                isCropping ? handleCropMouseUp : 
                isDrawing ? handleDrawMouseUp : 
                handleMouseUp
              }
              onMouseLeave={
                isCropping ? handleCropMouseUp : 
                isDrawing ? handleDrawMouseUp : 
                handleMouseUp
              }
            >
              <img 
                src={previewImage} 
                alt="Предпросмотр" 
                className="preview-image max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-all duration-300"
                style={{
                  transform: `scale(${zoomLevel}) translate(${imagePosition.x / zoomLevel}px, ${imagePosition.y / zoomLevel}px) rotate(${editRotation}deg)`,
                  filter: getFilterCSS(editFilter),
                  cursor: isCropping ? 'crosshair' : (zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default')
                }}
                onDoubleClick={!isCropping ? handleDoubleClick : undefined}
                onClick={(e) => e.stopPropagation()}
                draggable={false}
              />
              
              {isCropping && cropArea.width > 0 && cropArea.height > 0 && (
                <>
                  <div 
                    className="absolute inset-0 bg-black/50 pointer-events-none"
                    style={{
                      clipPath: `polygon(
                        0% 0%,
                        0% 100%,
                        ${cropArea.x}px 100%,
                        ${cropArea.x}px ${cropArea.y}px,
                        ${cropArea.x + cropArea.width}px ${cropArea.y}px,
                        ${cropArea.x + cropArea.width}px ${cropArea.y + cropArea.height}px,
                        ${cropArea.x}px ${cropArea.y + cropArea.height}px,
                        ${cropArea.x}px 100%,
                        100% 100%,
                        100% 0%
                      )`
                    }}
                  />
                  <div
                    className="absolute border-2 border-white border-dashed pointer-events-none"
                    style={{
                      left: cropArea.x,
                      top: cropArea.y,
                      width: cropArea.width,
                      height: cropArea.height
                    }}
                  >
                    <div className="absolute top-0 left-0 w-full h-full grid grid-cols-3 grid-rows-3">
                      {[...Array(9)].map((_, i) => (
                        <div key={i} className="border border-white/30" />
                      ))}
                    </div>
                  </div>
                  <div 
                    className="absolute bg-white/10 backdrop-blur-sm text-white px-2 py-1 rounded text-xs pointer-events-none"
                    style={{
                      left: cropArea.x + cropArea.width + 8,
                      top: cropArea.y
                    }}
                  >
                    {Math.round(cropArea.width)} × {Math.round(cropArea.height)}
                  </div>
                </>
              )}

              {isDrawing && (
                <>
                  <svg
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    style={{ zIndex: 10 }}
                  >
                    {drawings.map((drawing, index) => {
                      if (drawing.type === 'pen' && drawing.points) {
                        const pathData = drawing.points
                          .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
                          .join(' ');
                        return (
                          <path
                            key={index}
                            d={pathData}
                            stroke={drawing.color}
                            strokeWidth={drawing.size}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        );
                      } else if (drawing.type === 'arrow' && drawing.start && drawing.end) {
                        const angle = Math.atan2(
                          drawing.end.y - drawing.start.y,
                          drawing.end.x - drawing.start.x
                        );
                        const arrowLength = 15;
                        return (
                          <g key={index}>
                            <line
                              x1={drawing.start.x}
                              y1={drawing.start.y}
                              x2={drawing.end.x}
                              y2={drawing.end.y}
                              stroke={drawing.color}
                              strokeWidth={drawing.size}
                              strokeLinecap="round"
                            />
                            <line
                              x1={drawing.end.x}
                              y1={drawing.end.y}
                              x2={drawing.end.x - arrowLength * Math.cos(angle - Math.PI / 6)}
                              y2={drawing.end.y - arrowLength * Math.sin(angle - Math.PI / 6)}
                              stroke={drawing.color}
                              strokeWidth={drawing.size}
                              strokeLinecap="round"
                            />
                            <line
                              x1={drawing.end.x}
                              y1={drawing.end.y}
                              x2={drawing.end.x - arrowLength * Math.cos(angle + Math.PI / 6)}
                              y2={drawing.end.y - arrowLength * Math.sin(angle + Math.PI / 6)}
                              stroke={drawing.color}
                              strokeWidth={drawing.size}
                              strokeLinecap="round"
                            />
                          </g>
                        );
                      } else if (drawing.type === 'rect' && drawing.start && drawing.end) {
                        return (
                          <rect
                            key={index}
                            x={drawing.start.x}
                            y={drawing.start.y}
                            width={drawing.end.x - drawing.start.x}
                            height={drawing.end.y - drawing.start.y}
                            stroke={drawing.color}
                            strokeWidth={drawing.size}
                            fill="none"
                          />
                        );
                      } else if (drawing.type === 'text' && drawing.start && drawing.text) {
                        return (
                          <text
                            key={index}
                            x={drawing.start.x}
                            y={drawing.start.y}
                            fill={drawing.color}
                            fontSize={drawing.size}
                            fontFamily="Arial"
                          >
                            {drawing.text}
                          </text>
                        );
                      }
                      return null;
                    })}

                    {currentPath.length > 0 && drawMode === 'pen' && (
                      <path
                        d={currentPath
                          .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
                          .join(' ')}
                        stroke={drawColor}
                        strokeWidth={drawSize}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                  </svg>

                  {showTextInput && textPosition && (
                    <div
                      className="absolute bg-white p-2 rounded shadow-lg z-20"
                      style={{
                        left: textPosition.x,
                        top: textPosition.y
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Input
                        type="text"
                        value={textInput}
                        onChange={(e) => {
                          e.stopPropagation();
                          setTextInput(e.target.value);
                        }}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === 'Enter') {
                            handleAddText();
                          } else if (e.key === 'Escape') {
                            setShowTextInput(false);
                            setTextInput('');
                            setTextPosition(null);
                          }
                        }}
                        placeholder="Введите текст..."
                        className="w-48 text-black"
                        autoFocus
                      />
                      <div className="flex gap-1 mt-1">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddText();
                          }}
                          className="flex-1"
                        >
                          OK
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowTextInput(false);
                            setTextInput('');
                            setTextPosition(null);
                          }}
                          className="flex-1"
                        >
                          Отмена
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-500/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm border border-blue-400/50 z-20">
                    ✏️ {drawMode === 'pen' ? 'Рисуйте' : drawMode === 'arrow' ? 'Нарисуйте стрелку' : drawMode === 'rect' ? 'Нарисуйте прямоугольник' : 'Кликните для текста'}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};