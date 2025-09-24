import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEPARTMENTS } from "@/constants/departments";
import { TestFormData } from "./types";

interface TestInfoFormProps {
  newTest: TestFormData;
  setNewTest: (test: TestFormData) => void;
  isEditing?: boolean;
}

export const TestInfoForm: React.FC<TestInfoFormProps> = ({
  newTest,
  setNewTest,
  isEditing = false
}) => {
  const idPrefix = isEditing ? 'edit-' : '';

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Основная информация</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`${idPrefix}title`}>Название теста</Label>
          <Input 
            id={`${idPrefix}title`}
            placeholder="Введите название теста" 
            value={newTest.title}
            onChange={(e) => setNewTest({...newTest, title: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor={`${idPrefix}category`}>Категория</Label>
          <Select value={newTest.category} onValueChange={(value) => setNewTest({...newTest, category: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите категорию" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Безопасность">Безопасность</SelectItem>
              <SelectItem value="Клиентский сервис">Клиентский сервис</SelectItem>
              <SelectItem value="Технические знания">Технические знания</SelectItem>
              <SelectItem value="Соответствие">Соответствие</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor={`${idPrefix}description`}>Описание</Label>
        <Textarea 
          id={`${idPrefix}description`}
          placeholder="Описание теста" 
          value={newTest.description}
          onChange={(e) => setNewTest({...newTest, description: e.target.value})}
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor={`${idPrefix}difficulty`}>Сложность</Label>
          <Select value={newTest.difficulty} onValueChange={(value) => setNewTest({...newTest, difficulty: value as "easy" | "medium" | "hard"})}>
            <SelectTrigger>
              <SelectValue placeholder="Сложность" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Легкий</SelectItem>
              <SelectItem value="medium">Средний</SelectItem>
              <SelectItem value="hard">Сложный</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor={`${idPrefix}timeLimit`}>Общее время (мин)</Label>
          <Input 
            id={`${idPrefix}timeLimit`}
            type="number" 
            placeholder="30" 
            value={newTest.timeLimit}
            onChange={(e) => setNewTest({...newTest, timeLimit: parseInt(e.target.value) || 30})}
          />
        </div>
        <div>
          <Label htmlFor={`${idPrefix}department`}>Отдел</Label>
          <Select value={newTest.department} onValueChange={(value) => setNewTest({...newTest, department: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите отдел" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Все отделы">Все отделы</SelectItem>
              {isEditing ? (
                DEPARTMENTS.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))
              ) : (
                <>
                  <SelectItem value="ЦТО">ЦТО</SelectItem>
                  <SelectItem value="Сервис">Сервис</SelectItem>
                  <SelectItem value="Отдел IT">Отдел IT</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};