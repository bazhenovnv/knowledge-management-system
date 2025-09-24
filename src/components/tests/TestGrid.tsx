import React from "react";
import Icon from "@/components/ui/icon";
import { TestCard } from "./TestCard";
import { Test } from "./types";

interface TestGridProps {
  filteredTests: Test[];
  userRole: "admin" | "teacher" | "student";
  canManageTests: boolean;
  onEditTest: (test: Test) => void;
  onDeleteTest: (testId: string) => void;
  onTakeTest: (test: Test) => void;
  searchTerm: string;
}

export const TestGrid: React.FC<TestGridProps> = ({
  filteredTests,
  userRole,
  canManageTests,
  onEditTest,
  onDeleteTest,
  onTakeTest,
  searchTerm
}) => {
  if (filteredTests.length === 0) {
    return (
      <div className="text-center py-12">
        <Icon
          name="AlertCircle"
          size={48}
          className="mx-auto text-gray-400 mb-4"
        />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Тесты не найдены
        </h3>
        <p className="text-gray-600">
          {searchTerm
            ? "Попробуйте изменить поисковый запрос"
            : "Нет доступных тестов"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredTests.map((test) => (
        <TestCard
          key={test.id}
          test={test}
          userRole={userRole}
          canManageTests={canManageTests}
          onEditTest={onEditTest}
          onDeleteTest={onDeleteTest}
          onTakeTest={onTakeTest}
        />
      ))}
    </div>
  );
};