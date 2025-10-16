import { useState } from 'react';
import { toast } from 'sonner';
import { FileAttachment } from '@/utils/databaseService';

export const useImageHandlers = () => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageGallery, setImageGallery] = useState<FileAttachment[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [editRotation, setEditRotation] = useState(0);
  const [editFilter, setEditFilter] = useState('none');

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

  const closeImagePreview = () => {
    setPreviewImage(null);
    setImageGallery([]);
    setCurrentImageIndex(0);
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

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleRotate = () => {
    setEditRotation(prev => (prev + 90) % 360);
  };

  const handleDownloadImage = async () => {
    if (!previewImage) return;
    
    try {
      const response = await fetch(previewImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Изображение скачано');
    } catch (error) {
      toast.error('Не удалось скачать изображение');
    }
  };

  const handleCopyImage = async () => {
    if (!previewImage) return;
    
    try {
      const response = await fetch(previewImage);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      toast.success('Изображение скопировано в буфер обмена');
    } catch (error) {
      toast.error('Не удалось скопировать изображение');
    }
  };

  const handleShareImage = async () => {
    if (!previewImage) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Изображение',
          url: previewImage,
        });
        toast.success('Изображение отправлено');
      } else {
        await navigator.clipboard.writeText(previewImage);
        toast.success('Ссылка скопирована в буфер обмена');
      }
    } catch (error) {
      toast.error('Не удалось поделиться изображением');
    }
  };

  const handlePrintImage = () => {
    if (!previewImage) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Печать изображения</title></head>
          <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;">
            <img src="${previewImage}" style="max-width:100%;height:auto;" />
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
      toast.success('Подготовка к печати');
    }
  };

  return {
    previewImage,
    imageGallery,
    currentImageIndex,
    zoomLevel,
    imagePosition,
    isEditing,
    editRotation,
    editFilter,
    setPreviewImage,
    setImageGallery,
    setCurrentImageIndex,
    setZoomLevel,
    setImagePosition,
    setIsEditing,
    setEditRotation,
    setEditFilter,
    openImagePreview,
    closeImagePreview,
    handleNextImage,
    handlePrevImage,
    handleZoomIn,
    handleZoomOut,
    resetZoom,
    handleRotate,
    handleDownloadImage,
    handleCopyImage,
    handleShareImage,
    handlePrintImage,
  };
};
