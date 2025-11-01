import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface CategoryFilterProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: string[];
}

export const CategoryFilter = ({
  selectedCategory,
  setSelectedCategory,
  categories,
}: CategoryFilterProps) => {
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'all': 'Layers',
      'Оборудование': 'MonitorDot',
      'Программное обеспечение': 'Code',
      'Законодательство': 'Scale',
      'Процедуры': 'ListChecks',
      'Обучение': 'GraduationCap',
    };
    return icons[category] || 'FileText';
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory(category)}
          className="flex items-center gap-2"
        >
          <Icon name={getCategoryIcon(category)} size={16} />
          {category === 'all' ? 'Все категории' : category}
        </Button>
      ))}
    </div>
  );
};
