import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Question } from "./types";

interface QuestionListProps {
  questions: Question[];
  onEditQuestion: (index: number) => void;
  onDeleteQuestion: (index: number) => void;
}

export const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  onEditQuestion,
  onDeleteQuestion
}) => {
  if (questions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Icon name="AlertCircle" size={48} className="mx-auto mb-4" />
        <p>Добавьте вопросы для создания теста</p>
      </div>
    );
  }

  return (
    <>
      {questions.map((question, index) => (
        <Card key={index} className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-medium mb-2">{index + 1}. {question.question}</h4>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {question.options.map((option, optIndex) => (
                  <div key={optIndex} className={`p-2 rounded text-sm ${
                    optIndex === question.correctAnswer 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100'
                  }`}>
                    {optIndex === question.correctAnswer && '✓ '}{option}
                  </div>
                ))}
              </div>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>Время: {question.timeLimit || 60}с</span>
                {question.explanation && <span>Пояснение: да</span>}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" onClick={() => onEditQuestion(index)}>
                <Icon name="Edit" size={16} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDeleteQuestion(index)}>
                <Icon name="Trash2" size={16} />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </>
  );
};