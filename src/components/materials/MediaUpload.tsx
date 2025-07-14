import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
      <div className="flex items-center space-x-2">
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileUpload}
          className="hidden"
          id="media-upload"
        />
        <label htmlFor="media-upload">
          <Button
            variant="outline"
            className="border-dashed border-2 border-blue-300 text-blue-600 hover:bg-blue-50"
            asChild
          >
            <span className="cursor-pointer">
              <Icon name="Upload" size={16} className="mr-2" />
              Добавить фото/видео
            </span>
          </Button>
        </label>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Перетащите элементы для изменения порядка отображения
          </p>
          <div className="grid grid-cols-2 gap-2">
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
                  
                  {file.type === 'image' && (
                    <div className="mt-2">
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-20 object-cover rounded"
                      />
                    </div>
                  )}
                  
                  {file.type === 'video' && (
                    <div className="mt-2">
                      <video
                        src={file.url}
                        className="w-full h-20 object-cover rounded"
                        controls={false}
                      />
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