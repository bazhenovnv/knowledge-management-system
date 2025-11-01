import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Instruction } from "@/utils/databaseService";

interface InstructionsListProps {
  instructions: Instruction[];
  userRole: string;
  subsectionSearchQuery: string;
  selectedInstructionCategory: string | null;
  instructionCategories: Array<{ id: number; name: string; icon_name: string }>;
  onSelectCategory: (categoryName: string | null) => void;
  onEditInstruction: (instruction: Instruction) => void;
  onDeleteInstruction: (id: number) => void;
  onCreateInstruction: () => void;
  onManageCategories: () => void;
  containsSearchQuery: (text: string) => boolean;
  highlightText: (text: string) => string;
}

export const InstructionsList = ({
  instructions,
  userRole,
  subsectionSearchQuery,
  selectedInstructionCategory,
  instructionCategories,
  onSelectCategory,
  onEditInstruction,
  onDeleteInstruction,
  onCreateInstruction,
  onManageCategories,
  containsSearchQuery,
  highlightText,
}: InstructionsListProps) => {
  const filteredInstructions = instructions.filter(instruction => {
    const matchesCategory = !selectedInstructionCategory || instruction.category === selectedInstructionCategory;
    const matchesSearch = !subsectionSearchQuery || 
      instruction.title.toLowerCase().includes(subsectionSearchQuery.toLowerCase()) ||
      instruction.description.toLowerCase().includes(subsectionSearchQuery.toLowerCase()) ||
      instruction.steps.some(step => step.toLowerCase().includes(subsectionSearchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={!selectedInstructionCategory ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSelectCategory(null)}
        >
          <Icon name="Grid" size={16} className="mr-2" />
          Все категории
        </Button>
        {instructionCategories.map(cat => (
          <Button
            key={cat.id}
            variant={selectedInstructionCategory === cat.name ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSelectCategory(cat.name)}
          >
            <Icon name={cat.icon_name} size={16} className="mr-2" />
            {cat.name}
          </Button>
        ))}
        {userRole === 'admin' && (
          <>
            <Button variant="outline" size="sm" onClick={onManageCategories}>
              <Icon name="Settings" size={16} className="mr-2" />
              Управление категориями
            </Button>
            <Button onClick={onCreateInstruction} size="sm">
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить инструкцию
            </Button>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredInstructions.map((instruction) => {
          const categoryInfo = instructionCategories.find(c => c.name === instruction.category);
          const iconColor = instruction.icon_color || 'blue-600';
          
          return (
            <Card key={instruction.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 rounded-lg bg-${iconColor.replace('-600', '-100')} dark:bg-${iconColor.replace('-600', '-950')}`}>
                    <Icon 
                      name={instruction.icon_name || categoryInfo?.icon_name || 'FileText'} 
                      size={24} 
                      className={`text-${iconColor} dark:text-${iconColor.replace('-600', '-400')}`}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 
                      className="font-semibold text-lg mb-2"
                      dangerouslySetInnerHTML={{ __html: highlightText(instruction.title) }}
                    />
                    <p 
                      className="text-sm text-muted-foreground mb-3"
                      dangerouslySetInnerHTML={{ __html: highlightText(instruction.description) }}
                    />
                    {instruction.category && (
                      <div className="inline-flex items-center gap-1 text-xs text-muted-foreground mb-3">
                        <Icon name={categoryInfo?.icon_name || 'Folder'} size={12} />
                        {instruction.category}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {instruction.steps
                    .filter(step => containsSearchQuery(step))
                    .map((step, index) => (
                      <div key={index} className="flex gap-2">
                        <span className="text-sm font-medium text-muted-foreground min-w-6">
                          {index + 1}.
                        </span>
                        <p 
                          className="text-sm"
                          dangerouslySetInnerHTML={{ __html: highlightText(step) }}
                        />
                      </div>
                    ))}
                </div>

                {instruction.media?.images && instruction.media.images.length > 0 && (
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {instruction.media.images.map((img, idx) => (
                      <img 
                        key={idx} 
                        src={img} 
                        alt={`Step ${idx + 1}`} 
                        className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => window.open(img, '_blank')}
                      />
                    ))}
                  </div>
                )}

                {userRole === 'admin' && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      onClick={() => onEditInstruction(instruction)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Icon name="Edit" size={16} className="mr-2" />
                      Редактировать
                    </Button>
                    <Button
                      onClick={() => onDeleteInstruction(instruction.id)}
                      variant="destructive"
                      size="sm"
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredInstructions.length === 0 && (
        <div className="text-center py-12">
          <Icon name="FileSearch" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            {subsectionSearchQuery ? 'Инструкции не найдены' : 'Инструкции отсутствуют'}
          </p>
        </div>
      )}
    </div>
  );
};
