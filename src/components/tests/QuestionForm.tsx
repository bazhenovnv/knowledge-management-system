import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Question } from "./types";

interface QuestionFormProps {
  currentQuestion: Question;
  setCurrentQuestion: (question: Question) => void;
  onAddQuestion: () => void;
  onCancel: () => void;
  editingQuestionIndex: number | null;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({
  currentQuestion,
  setCurrentQuestion,
  onAddQuestion,
  onCancel,
  editingQuestionIndex
}) => {
  return (
    <Card className="p-4 border-dashed">
      <div className="space-y-4">
        <div>
          <Label htmlFor="question">Текст вопроса</Label>
          <Textarea 
            id="question" 
            placeholder="Введите текст вопроса" 
            value={currentQuestion.question}
            onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
          />
        </div>
        
        <div>
          <Label>Варианты ответов</Label>
          <div className="grid grid-cols-2 gap-4">
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={currentQuestion.correctAnswer === index}
                  onChange={() => setCurrentQuestion({...currentQuestion, correctAnswer: index})}
                  className="text-green-500"
                />
                <Input
                  placeholder={`Вариант ${index + 1}`}
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...currentQuestion.options];
                    newOptions[index] = e.target.value;
                    setCurrentQuestion({...currentQuestion, options: newOptions});
                  }}
                />
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">Отметьте правильный ответ</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="questionTimeLimit">Время на вопрос (сек)</Label>
            <Input 
              id="questionTimeLimit" 
              type="number" 
              placeholder="60" 
              value={currentQuestion.timeLimit}
              onChange={(e) => setCurrentQuestion({...currentQuestion, timeLimit: parseInt(e.target.value) || 60})}
            />
          </div>
          <div>
            <Label htmlFor="explanation">Пояснение (опционально)</Label>
            <Input 
              id="explanation" 
              placeholder="Пояснение к ответу" 
              value={currentQuestion.explanation}
              onChange={(e) => setCurrentQuestion({...currentQuestion, explanation: e.target.value})}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Отмена
          </Button>
          <Button onClick={onAddQuestion}>
            {editingQuestionIndex !== null ? 'Сохранить' : 'Добавить'}
          </Button>
        </div>
      </div>
    </Card>
  );
};