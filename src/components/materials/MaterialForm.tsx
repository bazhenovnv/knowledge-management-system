import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Icon from "@/components/ui/icon";
import { MediaUpload } from "./MediaUpload";
import { CategoryManager } from "./CategoryManager";

interface MaterialFormProps {
  categories: string[];
  onSubmit: (material: any) => void;
  onCancel: () => void;
  onPreview: (material: any) => void;
}

export const MaterialForm = ({
  categories,
  onSubmit,
  onCancel,
  onPreview,
}: MaterialFormProps) => {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    content: "",
    mediaFiles: [],
  });
  const [customCategories, setCustomCategories] = useState(categories);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMediaChange = (files: any[]) => {
    setFormData(prev => ({
      ...prev,
      mediaFiles: files
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const handlePreview = () => {
    onPreview(formData);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="title" className="text-right">
            Название
          </Label>
          <Input
            id="title"
            placeholder="Название материала"
            className="col-span-3"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="category" className="text-right">
            Категория
          </Label>
          <div className="col-span-3">
            <CategoryManager
              categories={customCategories}
              selectedCategory={formData.category}
              onCategoryChange={(category) => handleInputChange("category", category)}
              onCategoriesUpdate={setCustomCategories}
            />
          </div>
        </div>

        <div className="grid grid-cols-4 items-start gap-4">
          <Label htmlFor="content" className="text-right">
            Содержание материала
          </Label>
          <Textarea
            id="content"
            placeholder="Введите содержание материала..."
            className="col-span-3"
            rows={8}
            value={formData.content}
            onChange={(e) => handleInputChange("content", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-4 items-start gap-4">
          <Label className="text-right">
            Медиа файлы
          </Label>
          <div className="col-span-3">
            <MediaUpload
              files={formData.mediaFiles}
              onFilesChange={handleMediaChange}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handlePreview}
            className="border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            <Icon name="Eye" size={16} className="mr-2" />
            Предпросмотр
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Отмена
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Создать материал
          </Button>
        </div>
      </div>
    </div>
  );
};