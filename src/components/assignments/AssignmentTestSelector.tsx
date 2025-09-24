import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Test } from '@/utils/database';
import { AssignmentFormData } from './assignmentFormTypes';

interface AssignmentTestSelectorProps {
  formData: AssignmentFormData;
  tests: Test[];
  toggleTest: (testId: string) => void;
  handleSelectAllTests: () => void;
}

const AssignmentTestSelector: React.FC<AssignmentTestSelectorProps> = ({
  formData,
  tests,
  toggleTest,
  handleSelectAllTests
}) => {
  const filteredTests = tests.filter(test => test.status === 'published');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Выберите тесты для задания</Label>
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSelectAllTests}
          >
            {filteredTests.every(test => formData.testIds.includes(test.id)) 
              ? 'Снять все' 
              : 'Выбрать все'
            }
          </Button>
          <Badge variant="secondary">
            {formData.testIds.length} выбрано
          </Badge>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto border rounded-md">
        {filteredTests.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Icon name="FileText" size={24} className="mx-auto mb-2 opacity-50" />
            <p>Нет доступных тестов</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {filteredTests.map((test) => (
              <div
                key={test.id}
                className={`flex items-center space-x-3 p-3 rounded cursor-pointer hover:bg-gray-50 transition-colors ${
                  formData.testIds.includes(test.id) 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'border border-transparent'
                }`}
                onClick={() => toggleTest(test.id)}
              >
                <input
                  type="checkbox"
                  checked={formData.testIds.includes(test.id)}
                  onChange={() => toggleTest(test.id)}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{test.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {test.difficulty === 'easy' ? 'Легкий' : 
                       test.difficulty === 'medium' ? 'Средний' : 'Сложный'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">{test.description}</p>
                  <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                    <Icon name="Clock" size={12} />
                    <span>{test.timeLimit} мин</span>
                    <span>•</span>
                    <span>{test.questions.length} вопросов</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentTestSelector;