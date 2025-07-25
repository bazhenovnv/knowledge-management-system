import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";

interface MediaFile {
  id: string;
  name: string;
  type: "image" | "video";
  url: string;
  size: number;
}

interface MediaUploadProps {
  files: MediaFile[];
  onFilesChange: (files: MediaFile[]) => void;
}

export const MediaUpload = ({ files, onFilesChange }: MediaUploadProps) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || []);
    
    const newFiles = uploadedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 'video' as 'image' | 'video',
      url: URL.createObjectURL(file),
      size: file.size,
    }));

    onFilesChange([...files, ...newFiles]);
    // Очищаем input для возможности повторной загрузки того же файла
    event.target.value = '';
  };

  const handleFileDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(event.dataTransfer.files);
    const validFiles = droppedFiles.filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );
    
    if (validFiles.length > 0) {
      const newFiles = validFiles.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'video' as 'image' | 'video',
        url: URL.createObjectURL(file),
        size: file.size,
      }));

      onFilesChange([...files, ...newFiles]);
    }
  };

  const handleDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent, dropIndex: number) => {
    event.preventDefault();
    
    if (draggedIndex === null) return;
    
    const newFiles = [...files];
    const draggedFile = newFiles[draggedIndex];
    
    newFiles.splice(draggedIndex, 1);
    newFiles.splice(dropIndex, 0, draggedFile);
    
    onFilesChange(newFiles);
    setDraggedIndex(null);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Область загрузки с drag & drop */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
        onDrop={handleFileDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileUpload}
          className="hidden"
          id="media-upload"
        />
        
        <div className="text-center">
          <Icon 
            name={isDragOver ? "Download" : "Upload"} 
            size={32} 
            className={`mx-auto mb-3 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} 
          />
          <p className={`text-sm mb-2 ${isDragOver ? 'text-blue-600' : 'text-gray-600'}`}>
            {isDragOver 
              ? 'Отпустите файлы для загрузки' 
              : 'Перетащите фото или видео сюда или'
            }
          </p>
          <label htmlFor="media-upload">
            <Button
              variant="outline"
              className="border-blue-300 text-blue-600 hover:bg-blue-50"
              asChild
            >
              <span className="cursor-pointer">
                <Icon name="FolderOpen" size={16} className="mr-2" />
                Выберите файлы
              </span>
            </Button>
          </label>
          <p className="text-xs text-gray-500 mt-2">
            Поддерживаются изображения (JPG, PNG, GIF) и видео (MP4, MOV, AVI)
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Перетащите элементы для изменения порядка отображения
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {files.map((file, index) => (
              <Card
                key={file.id}
                className={`cursor-move transition-all ${
                  draggedIndex === index ? 'opacity-50 scale-95' : 'hover:shadow-md'
                }`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon
                        name={file.type === 'image' ? 'Image' : 'Video'}
                        size={20}
                        className={file.type === 'image' ? 'text-green-600' : 'text-red-600'}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Icon name="X" size={16} />
                    </Button>
                  </div>
                  
                  {/* Предпросмотр изображения */}
                  {file.type === 'image' && (
                    <div className="mt-2 relative group">
                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="cursor-pointer relative overflow-hidden rounded">
                            <img
                              src={file.url}
                              alt={file.name}
                              className="w-full h-32 object-cover transition-transform hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                              <Icon name="Eye" size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                          <div className="flex items-center justify-center p-4">
                            <img
                              src={file.url}
                              alt={file.name}
                              className="max-w-full max-h-[80vh] object-contain"
                            />
                          </div>
                          <div className="p-4 border-t">
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                  
                  {/* Предпросмотр видео */}
                  {file.type === 'video' && (
                    <div className="mt-2 relative group">
                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="cursor-pointer relative overflow-hidden rounded">
                            <video
                              src={file.url}
                              className="w-full h-32 object-cover"
                              muted
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                              <Icon name="Play" size={24} className="text-white" />
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity" />
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                          <div className="flex items-center justify-center p-4">
                            <video
                              src={file.url}
                              className="max-w-full max-h-[70vh] object-contain"
                              controls
                              autoPlay
                            />
                          </div>
                          <div className="p-4 border-t">
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};