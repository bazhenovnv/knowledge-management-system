import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";
import { TestInfoForm } from "./TestInfoForm";
import { QuestionList } from "./QuestionList";
import { QuestionForm } from "./QuestionForm";
import { TestFormData, Question } from "./types";

interface TestDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  newTest: TestFormData;
  setNewTest: (test: TestFormData) => void;
  currentQuestion: Question;
  setCurrentQuestion: (question: Question) => void;
  isAddingQuestion: boolean;
  setIsAddingQuestion: (adding: boolean) => void;
  editingQuestionIndex: number | null;
  onEditQuestion: (index: number) => void;
  onDeleteQuestion: (index: number) => void;
  onAddQuestion: () => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export const TestDialog: React.FC<TestDialogProps> = ({
  isOpen,
  onOpenChange,
  title,
  newTest,
  setNewTest,
  currentQuestion,
  setCurrentQuestion,
  isAddingQuestion,
  setIsAddingQuestion,
  editingQuestionIndex,
  onEditQuestion,
  onDeleteQuestion,
  onAddQuestion,
  onSave,
  onCancel,
  isEditing = false
}) => {
  const handleCancelQuestion = () => {
    setIsAddingQuestion(false);
    setCurrentQuestion({
      id: "",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
      timeLimit: 60
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <TestInfoForm 
            newTest={newTest}
            setNewTest={setNewTest}
            isEditing={isEditing}
          />
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Вопросы ({newTest.questions.length})</h3>
              <Button 
                variant="outline" 
                onClick={() => setIsAddingQuestion(true)}
                disabled={isAddingQuestion}
              >
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить вопрос
              </Button>
            </div>
            
            <QuestionList 
              questions={newTest.questions}
              onEditQuestion={onEditQuestion}
              onDeleteQuestion={onDeleteQuestion}
            />
            
            {isAddingQuestion && (
              <QuestionForm 
                currentQuestion={currentQuestion}
                setCurrentQuestion={setCurrentQuestion}
                onAddQuestion={onAddQuestion}
                onCancel={handleCancelQuestion}
                editingQuestionIndex={editingQuestionIndex}
              />
            )}
            
            {newTest.questions.length === 0 && !isAddingQuestion && (
              <div className="text-center py-8 text-gray-500">
                <Icon name="AlertCircle" size={48} className="mx-auto mb-4" />
                <p>Добавьте вопросы для {isEditing ? 'редактирования' : 'создания'} теста</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onCancel}>
              Отмена
            </Button>
            <Button 
              onClick={onSave}
              disabled={newTest.title.trim() === "" || newTest.questions.length === 0}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {isEditing ? 'Сохранить изменения' : 'Создать тест'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};