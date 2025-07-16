import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

interface CategoryManagerProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onCategoriesUpdate: (categories: string[]) => void;
}

export const CategoryManager = ({
  categories,
  selectedCategory,
  onCategoryChange,
  onCategoriesUpdate,
}: CategoryManagerProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      const updatedCategories = [...categories, newCategory.trim()];
      onCategoriesUpdate(updatedCategories);
      setNewCategory("");
    }
  };

  const handleDeleteCategory = (categoryToDelete: string) => {
    const updatedCategories = categories.filter(cat => cat !== categoryToDelete);
    onCategoriesUpdate(updatedCategories);
    
    if (selectedCategory === categoryToDelete) {
      onCategoryChange("");
    }
  };

  const handleEditCategory = (oldCategory: string, newCategory: string) => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      const updatedCategories = categories.map(cat => 
        cat === oldCategory ? newCategory.trim() : cat
      );
      onCategoriesUpdate(updatedCategories);
      
      if (selectedCategory === oldCategory) {
        onCategoryChange(newCategory.trim());
      }
    }
    setEditingCategory(null);
    setEditValue("");
  };

  const startEditing = (category: string) => {
    setEditingCategory(category);
    setEditValue(category);
  };

  return (
    <div className="flex space-x-2">
      <Select value={selectedCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Выберите категорию" />
        </SelectTrigger>
        <SelectContent>
          {categories.filter(cat => cat !== 'all').map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Icon name="Settings" size={16} />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Управление категориями</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Новая категория"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddCategory();
                  }
                }}
              />
              <Button onClick={handleAddCategory} disabled={!newCategory.trim()}>
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Существующие категории:</h4>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {categories.map((category) => (
                  <div key={category} className="flex items-center justify-between p-2 border rounded">
                    {editingCategory === category ? (
                      <div className="flex space-x-2 flex-1">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleEditCategory(category, editValue);
                            }
                            if (e.key === 'Escape') {
                              setEditingCategory(null);
                              setEditValue("");
                            }
                          }}
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={() => handleEditCategory(category, editValue)}
                        >
                          <Icon name="Check" size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingCategory(null);
                            setEditValue("");
                          }}
                        >
                          <Icon name="X" size={14} />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Badge variant="outline" className="flex-1">
                          {category}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditing(category)}
                          >
                            <Icon name="Edit" size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteCategory(category)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Icon name="Trash2" size={14} />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};