import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { useViewedTests } from "@/hooks/useViewedTests";
import { Test } from "./types";

interface TestCardProps {
  test: Test;
  userRole: "admin" | "teacher" | "student";
  canManageTests: boolean;
  onEditTest: (test: Test) => void;
  onDeleteTest: (testId: string) => void;
  onTakeTest: (test: Test) => void;
}

export const TestCard: React.FC<TestCardProps> = ({
  test,
  userRole,
  canManageTests,
  onEditTest,
  onDeleteTest,
  onTakeTest
}) => {
  const { isTestNew } = useViewedTests();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "archived":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "published":
        return "Опубликован";
      case "draft":
        return "Черновик";
      case "archived":
        return "Архивирован";
      default:
        return status;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{test.title}</CardTitle>
              {isTestNew(test.id, test.createdAt) && (
                <Badge className="bg-red-500 text-white text-xs px-2 py-1 animate-pulse">
                  NEW
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {test.description}
            </p>
          </div>
          {canManageTests && (
            <div className="flex space-x-1">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onEditTest(test)}
              >
                <Icon name="Edit" size={16} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onDeleteTest(test.id)}
              >
                <Icon name="Trash2" size={16} />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge className={getDifficultyColor(test.difficulty)}>
              {test.difficulty === "easy"
                ? "Легкий"
                : test.difficulty === "medium"
                  ? "Средний"
                  : "Сложный"}
            </Badge>
            <Badge className={getStatusColor(test.status)}>
              {getStatusText(test.status)}
            </Badge>
            <Badge variant="outline">{test.category}</Badge>
          </div>

          <div className="flex justify-between text-sm text-gray-600">
            <span>Вопросов: {test.questions.length}</span>
            <span>Время: {test.timeLimit} мин</span>
          </div>

          <div className="flex justify-between text-sm text-gray-600">
            <span className="flex items-center">
              <Icon name="Users" size={14} className="mr-1" />
              {test.totalAttempts} попыток
            </span>
            <span className="flex items-center">
              <Icon name="CheckCircle" size={14} className="mr-1" />
              {test.averageScore}% средний балл
            </span>
          </div>

          <div className="pt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {test.department}
              </span>
              <Button 
                size="sm" 
                className="flex items-center"
                onClick={() => onTakeTest(test)}
              >
                <Icon name="Play" size={14} className="mr-1" />
                {userRole === "student" ? "Пройти" : "Просмотр"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};