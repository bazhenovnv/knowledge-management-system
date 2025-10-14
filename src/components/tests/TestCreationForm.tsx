import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { testsService } from '@/utils/testsService';

interface Question {
  id: string;
  question_text: string;
  question_type: 'single' | 'multiple' | 'text';
  options: string[];
  correct_answers: string[];
  points: number;
}

interface Course {
  id: number;
  title: string;
}

interface TestCreationFormProps {
  userId: number;
  onCancel: () => void;
  onSuccess: () => void;
}

const TestCreationForm: React.FC<TestCreationFormProps> = ({ userId, onCancel, onSuccess }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState<string>('');
  const [timeLimit, setTimeLimit] = useState<string>('');
  const [passingScore, setPassingScore] = useState<string>('70');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/5ce5a766-35aa-4d9a-9325-babec287d558?action=list&table=courses', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.data) {
        setCourses(data.data);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      question_text: '',
      question_type: 'single',
      options: ['', ''],
      correct_answers: [],
      points: 1
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, options: [...q.options, ''] } : q
    ));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { ...q, options: q.options.map((opt, idx) => idx === optionIndex ? value : opt) }
        : q
    ));
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { ...q, options: q.options.filter((_, idx) => idx !== optionIndex) }
        : q
    ));
  };

  const toggleCorrectAnswer = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id !== questionId) return q;
      
      const optionValue = optionIndex.toString();
      if (q.question_type === 'single') {
        return { ...q, correct_answers: [optionValue] };
      } else {
        const isSelected = q.correct_answers.includes(optionValue);
        return {
          ...q,
          correct_answers: isSelected
            ? q.correct_answers.filter(a => a !== optionValue)
            : [...q.correct_answers, optionValue]
        };
      }
    }));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Укажите название теста');
      return;
    }

    if (questions.length === 0) {
      toast.error('Добавьте хотя бы один вопрос');
      return;
    }

    for (const q of questions) {
      if (!q.question_text.trim()) {
        toast.error('Заполните текст всех вопросов');
        return;
      }
      if (q.question_type !== 'text' && q.options.length < 2) {
        toast.error('У каждого вопроса должно быть минимум 2 варианта ответа');
        return;
      }
      if (q.question_type !== 'text' && q.correct_answers.length === 0) {
        toast.error('Укажите правильные ответы для всех вопросов');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const testData = {
        title: title.trim(),
        description: description.trim() || undefined,
        course_id: courseId ? parseInt(courseId) : undefined,
        creator_id: 1,
        time_limit: timeLimit ? parseInt(timeLimit) : undefined,
        passing_score: parseInt(passingScore),
        max_attempts: 3,
        questions: questions.map(q => {
          if (q.question_type === 'text') {
            return {
              question_text: q.question_text.trim(),
              question_type: 'text' as const,
              points: q.points,
              answers: []
            };
          }

          const answers = q.options
            .map((option, originalIdx) => ({
              answer_text: option.trim(),
              is_correct: q.correct_answers.includes(originalIdx.toString()),
              originalIdx
            }))
            .filter(a => a.answer_text)
            .map(({ answer_text, is_correct }) => ({
              answer_text,
              is_correct
            }));

          return {
            question_text: q.question_text.trim(),
            question_type: q.question_type === 'single' ? 'single_choice' as const : 'multiple_choice' as const,
            points: q.points,
            answers
          };
        })
      };

      console.log('Sending test data:', testData);
      const result = await testsService.createTest(testData);
      console.log('Create test result:', result);

      if (result) {
        toast.success('Тест успешно создан!');
        onSuccess();
      } else {
        toast.error('Ошибка при создании теста - проверьте консоль');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Ошибка: ${errorMessage}`);
      console.error('Error creating test:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Создание нового теста</CardTitle>
              <CardDescription>Заполните информацию о тесте и добавьте вопросы</CardDescription>
            </div>
            <Button type="button" variant="ghost" onClick={onCancel}>
              <Icon name="X" size={20} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Название теста *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите название теста"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание теста"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course">Курс</Label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger id="course">
                  <SelectValue placeholder="Выберите курс" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeLimit">Время (минуты)</Label>
              <Input
                id="timeLimit"
                type="number"
                min="1"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                placeholder="Не ограничено"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passingScore">Проходной балл (%)</Label>
              <Input
                id="passingScore"
                type="number"
                min="0"
                max="100"
                value={passingScore}
                onChange={(e) => setPassingScore(e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {questions.map((question, qIndex) => (
        <Card key={question.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Вопрос {qIndex + 1}</CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeQuestion(question.id)}
              >
                <Icon name="Trash2" size={16} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Текст вопроса *</Label>
              <Textarea
                value={question.question_text}
                onChange={(e) => updateQuestion(question.id, 'question_text', e.target.value)}
                placeholder="Введите текст вопроса"
                rows={2}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Тип вопроса</Label>
                <Select
                  value={question.question_type}
                  onValueChange={(value) => updateQuestion(question.id, 'question_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Один правильный ответ</SelectItem>
                    <SelectItem value="multiple">Несколько правильных ответов</SelectItem>
                    <SelectItem value="text">Текстовый ответ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Баллы</Label>
                <Input
                  type="number"
                  min="1"
                  value={question.points}
                  onChange={(e) => updateQuestion(question.id, 'points', parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            {question.question_type !== 'text' && (
              <div className="space-y-3">
                <Label>Варианты ответов</Label>
                {question.options.map((option, optIndex) => (
                  <div key={optIndex} className="flex items-center space-x-2">
                    {question.question_type === 'single' ? (
                      <RadioGroup
                        value={question.correct_answers[0] || ''}
                        onValueChange={() => toggleCorrectAnswer(question.id, optIndex)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={optIndex.toString()} />
                        </div>
                      </RadioGroup>
                    ) : (
                      <Checkbox
                        checked={question.correct_answers.includes(optIndex.toString())}
                        onCheckedChange={() => toggleCorrectAnswer(question.id, optIndex)}
                      />
                    )}
                    <Input
                      value={option}
                      onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                      placeholder={`Вариант ${optIndex + 1}`}
                    />
                    {question.options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(question.id, optIndex)}
                      >
                        <Icon name="X" size={16} />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addOption(question.id)}
                >
                  <Icon name="Plus" size={16} className="mr-2" />
                  Добавить вариант
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" onClick={addQuestion}>
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить вопрос
        </Button>

        <div className="flex items-center space-x-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                Создание...
              </>
            ) : (
              <>
                <Icon name="Check" size={16} className="mr-2" />
                Создать тест
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default TestCreationForm;