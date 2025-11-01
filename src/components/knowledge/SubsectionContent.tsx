import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { RussiaMapDetailed } from "@/components/map/RussiaMapDetailed";
import { InstructionsList } from "./InstructionsList";
import { Instruction } from "@/utils/databaseService";

interface SubsectionContentProps {
  selectedSubsection: string;
  subsectionContent: Record<string, string>;
  editableTexts: Record<string, string>;
  isEditingSubsection: boolean;
  userRole: string;
  subsectionSearchQuery: string;
  instructions: Instruction[];
  selectedInstructionCategory: string | null;
  instructionCategories: Array<{ id: number; name: string; icon_name: string }>;
  onSetPreviousSubsection: (subsection: string | null) => void;
  onSelectSubsection: (subsection: string | null) => void;
  onSetIsEditingSubsection: (editing: boolean) => void;
  onSaveSubsectionContent: (subsection: string, content: string) => void;
  onSelectInstructionCategory: (categoryName: string | null) => void;
  onEditInstruction: (instruction: Instruction) => void;
  onDeleteInstruction: (id: number) => void;
  onCreateInstruction: () => void;
  onManageCategories: () => void;
  containsSearchQuery: (text: string) => boolean;
  highlightText: (text: string) => string;
}

export const SubsectionContent = ({
  selectedSubsection,
  subsectionContent,
  editableTexts,
  isEditingSubsection,
  userRole,
  subsectionSearchQuery,
  instructions,
  selectedInstructionCategory,
  instructionCategories,
  onSetPreviousSubsection,
  onSelectSubsection,
  onSetIsEditingSubsection,
  onSaveSubsectionContent,
  onSelectInstructionCategory,
  onEditInstruction,
  onDeleteInstruction,
  onCreateInstruction,
  onManageCategories,
  containsSearchQuery,
  highlightText,
}: SubsectionContentProps) => {
  const [tempContent, setTempContent] = useState<string>('');

  const getDefaultContent = (subsection: string): string => {
    const defaults: Record<string, string> = {
      "О компании": editableTexts.aboutCompany,
      "Отдел продаж": editableTexts.salesDept,
      "Технический отдел": editableTexts.techDept,
      "Служба поддержки": editableTexts.supportDept,
    };
    return defaults[subsection] || '';
  };

  const currentContent = subsectionContent[selectedSubsection] || getDefaultContent(selectedSubsection);

  const handleStartEdit = () => {
    setTempContent(currentContent);
    onSetIsEditingSubsection(true);
  };

  const handleSave = () => {
    onSaveSubsectionContent(selectedSubsection, tempContent);
  };

  const handleCancel = () => {
    onSetIsEditingSubsection(false);
    setTempContent('');
  };

  if (selectedSubsection === "Регионы присутствия") {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Карта регионов присутствия</h3>
            <RussiaMapDetailed />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedSubsection === "Инструкции") {
    return (
      <InstructionsList
        instructions={instructions}
        userRole={userRole}
        subsectionSearchQuery={subsectionSearchQuery}
        selectedInstructionCategory={selectedInstructionCategory}
        instructionCategories={instructionCategories}
        onSelectCategory={onSelectInstructionCategory}
        onEditInstruction={onEditInstruction}
        onDeleteInstruction={onDeleteInstruction}
        onCreateInstruction={onCreateInstruction}
        onManageCategories={onManageCategories}
        containsSearchQuery={containsSearchQuery}
        highlightText={highlightText}
      />
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">{selectedSubsection}</h3>
          {userRole === 'admin' && !isEditingSubsection && (
            <Button variant="outline" size="sm" onClick={handleStartEdit}>
              <Icon name="Edit" size={16} className="mr-2" />
              Редактировать
            </Button>
          )}
        </div>

        {isEditingSubsection ? (
          <div className="space-y-4">
            <textarea
              value={tempContent}
              onChange={(e) => setTempContent(e.target.value)}
              className="w-full h-64 p-4 border rounded-md resize-none"
              placeholder="Введите содержание раздела..."
            />
            <div className="flex gap-2">
              <Button onClick={handleSave}>
                <Icon name="Save" size={16} className="mr-2" />
                Сохранить
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <Icon name="X" size={16} className="mr-2" />
                Отмена
              </Button>
            </div>
          </div>
        ) : (
          <div 
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: highlightText(currentContent.replace(/\n/g, '<br />')) }}
          />
        )}
      </CardContent>
    </Card>
  );
};
