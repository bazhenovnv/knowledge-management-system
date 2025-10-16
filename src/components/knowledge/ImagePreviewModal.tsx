import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { FileAttachment } from '@/utils/databaseService';

interface ImagePreviewModalProps {
  previewImage: string | null;
  imageGallery: FileAttachment[];
  currentImageIndex: number;
  zoomLevel: number;
  imagePosition: { x: number; y: number };
  isEditing: boolean;
  editRotation: number;
  editFilter: string;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onDownload: () => void;
  onCopy: () => void;
  onShare: () => void;
  onPrint: () => void;
  onToggleEdit: () => void;
  onRotate: () => void;
  onFilterChange: (filter: string) => void;
  onSaveEdit: () => void;
  onStartCrop: () => void;
  onStartDraw: () => void;
  onStartBlur: () => void;
  setImagePosition: (pos: { x: number; y: number }) => void;
  setIsDragging: (val: boolean) => void;
  setDragStart: (pos: { x: number; y: number }) => void;
}

export const ImagePreviewModal = ({
  previewImage,
  imageGallery,
  currentImageIndex,
  zoomLevel,
  imagePosition,
  isEditing,
  editRotation,
  editFilter,
  onClose,
  onNext,
  onPrev,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onDownload,
  onCopy,
  onShare,
  onPrint,
  onToggleEdit,
  onRotate,
  onFilterChange,
  onSaveEdit,
  onStartCrop,
  onStartDraw,
  onStartBlur,
}: ImagePreviewModalProps) => {
  if (!previewImage) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative max-w-7xl max-h-screen p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={onZoomOut}
            className="bg-black/50 hover:bg-black/70 text-white"
          >
            <Icon name="ZoomOut" size={20} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onZoomIn}
            className="bg-black/50 hover:bg-black/70 text-white"
          >
            <Icon name="ZoomIn" size={20} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onResetZoom}
            className="bg-black/50 hover:bg-black/70 text-white"
          >
            <Icon name="Maximize2" size={20} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDownload}
            className="bg-black/50 hover:bg-black/70 text-white"
          >
            <Icon name="Download" size={20} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleEdit}
            className="bg-black/50 hover:bg-black/70 text-white"
          >
            <Icon name="Edit" size={20} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="bg-black/50 hover:bg-black/70 text-white"
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {imageGallery.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={onPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
            >
              <Icon name="ChevronLeft" size={24} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
            >
              <Icon name="ChevronRight" size={24} />
            </Button>
          </>
        )}

        <div className="overflow-hidden rounded-lg">
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-[80vh] object-contain"
            style={{
              transform: `scale(${zoomLevel}) translate(${imagePosition.x}px, ${imagePosition.y}px) rotate(${editRotation}deg)`,
              filter: editFilter !== 'none' ? editFilter : undefined,
              transition: 'transform 0.2s ease-out',
            }}
          />
        </div>

        {imageGallery.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full text-white text-sm">
            {currentImageIndex + 1} / {imageGallery.length}
          </div>
        )}

        {isEditing && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/80 p-4 rounded-lg flex gap-2">
            <Button size="sm" onClick={onRotate}>
              <Icon name="RotateCw" size={16} />
              Повернуть
            </Button>
            <Button size="sm" onClick={onStartCrop}>
              <Icon name="Crop" size={16} />
              Обрезать
            </Button>
            <Button size="sm" onClick={onStartDraw}>
              <Icon name="Pencil" size={16} />
              Рисовать
            </Button>
            <Button size="sm" onClick={onStartBlur}>
              <Icon name="Blur" size={16} />
              Размытие
            </Button>
            <Button size="sm" variant="default" onClick={onSaveEdit}>
              <Icon name="Save" size={16} />
              Сохранить
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
