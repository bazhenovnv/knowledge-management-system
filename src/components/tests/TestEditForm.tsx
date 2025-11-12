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
import { testsService, DatabaseTest, TestWithQuestions } from '@/utils/testsService';
import funcUrls from '../../../backend/func2url.json';
import { API_CONFIG } from '@/config/apiConfig';

interface Question {
  id?: number;
  question_text: string;
  question_type: 'single_choice' | 'multiple_choice' | 'text';
  points: number;
  answers: Array<{
    id?: number;
    answer_text: string;
    is_correct: boolean;
  }>;
}

interface Course {
  id: number;
  title: string;
}

interface TestEditFormProps {
  testId: number;
  onCancel: () => void;
  onSuccess: () => void;
}

const TestEditForm: React.FC<TestEditFormProps> = ({ testId, onCancel, onSuccess }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState<string>('');
  const [timeLimit, setTimeLimit] = useState<string>('');
  const [passingScore, setPassingScore] = useState<string>('70');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Отключена автозагрузка - только при наличии backend
    if (funcUrls['database'] && testId) {
      loadTest();
      loadCourses();
    }
  }, [testId]);

  const loadTest = async () => {
    try {
      const testData = await testsService.getTestWithQuestions(testId);
      if (testData) {
        setTitle(testData.title);
        setDescription(testData.description || '');
        setCourseId(testData.course_id?.toString() || '');
        setTimeLimit(testData.time_limit?.toString() || '');
        setPassingScore(testData.passing_score.toString());
        
        const mappedQuestions: Question[] = testData.questions.map(q => ({
          id: q.id,
          question_text: q.question_text,
          question_type: q.question_type,
          points: q.points,
          answers: (q.answers || []).map(a => ({
            id: a.id,
            answer_text: a.answer_text,
            is_correct: a.is_correct
          }))
        }));
        
        setQuestions(mappedQuestions);
      }
    } catch (error) {
      toast.error('Ошибка загрузки теста');
      console.error('Error loading test:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const response = await fetch(`${funcUrls['database'] || API_CONFIG.LEGACY_DATABASE}?action=list&table=courses`, {
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
      question_text: '',
      question_type: 'single_choice',
      points: 1,
      answers: [
        { answer_text: '', is_correct: false },
        { answer_text: '', is_correct: false }
      ]
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const addAnswer = (questionIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].answers.push({ answer_text: '', is_correct: false });
    setQuestions(updated);
  };

  const updateAnswer = (questionIndex: number, answerIndex: number, field: string, value: any) => {
    const updated = [...questions];
    updated[questionIndex].answers[answerIndex] = {
      ...updated[questionIndex].answers[answerIndex],
      [field]: value
    };
    setQuestions(updated);
  };

  const removeAnswer = (questionIndex: number, answerIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].answers = updated[questionIndex].answers.filter((_, idx) => idx !== answerIndex);
    setQuestions(updated);
  };

  const toggleCorrectAnswer = (questionIndex: number, answerIndex: number) => {
    const updated = [...questions];
    const question = updated[questionIndex];
    
    if (question.question_type === 'single_choice') {
      question.answers.forEach((a, idx) => {
        a.is_correct = idx === answerIndex;
      });
    } else {
      question.answers[answerIndex].is_correct = !question.answers[answerIndex].is_correct;
    }
    
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, idx) => idx !== index));
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
      if (q.question_type !== 'text' && (q.answers || []).length < 2) {
        toast.error('У каждого вопроса должно быть минимум 2 варианта ответа');
        return;
      }
      if (q.question_type !== 'text' && !(q.answers || []).some(a => a.is_correct)) {
        toast.error('Укажите правильные ответы для всех вопросов');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${funcUrls['database'] || 'https://functions.poehali.dev/5ce5a766-35aa-4d9a-9325-babec287d558'}?action=update_test_full&id=${testId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          course_id: courseId ? parseInt(courseId) : null,
          time_limit: timeLimit ? parseInt(timeLimit) : null,
          passing_score: parseInt(passingScore),
          questions: questions.map(q => ({
            id: q.id,
            question_text: q.question_text.trim(),
            question_type: q.question_type,
            points: q.points,
            answers: (q.answers || [])
              .filter(a => a.answer_text.trim())
              .map(a => ({
                id: a.id,
                answer_text: a.answer_text.trim(),
                is_correct: a.is_correct
              }))
          }))
        })
      });

      const result = await response.json();

      if (result.data || result.message) {
        toast.success('Тест успешно обновлён!');
        onSuccess();
      } else {
        toast.error(result.error || 'Ошибка при обновлении теста');
      }
    } catch (error) {
      toast.error('Ошибка при обновлении теста');
      console.error('Error updating test:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Icon name="Loader2" size={24} className="animate-spin" />
          <span>Загрузка теста...</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Редактирование теста</CardTitle>
              <CardDescription>Внесите изменения в тест и сохраните</CardDescription>
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
        <Card key={qIndex}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Вопрос {qIndex + 1}</CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeQuestion(qIndex)}
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
                onChange={(e) => updateQuestion(qIndex, 'question_text', e.target.value)}
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
                  onValueChange={(value) => updateQuestion(qIndex, 'question_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single_choice">Один правильный ответ</SelectItem>
                    <SelectItem value="multiple_choice">Несколько правильных ответов</SelectItem>
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
                  onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            {question.question_type !== 'text' && (
              <div className="space-y-3">
                <Label>Варианты ответов</Label>
                {question.answers.map((answer, aIndex) => (
                  <div key={aIndex} className="flex items-center space-x-2">
                    {question.question_type === 'single_choice' ? (
                      <RadioGroup
                        value={question.answers.findIndex(a => a.is_correct).toString()}
                        onValueChange={() => toggleCorrectAnswer(qIndex, aIndex)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={aIndex.toString()} />
                        </div>
                      </RadioGroup>
                    ) : (
                      <Checkbox
                        checked={answer.is_correct}
                        onCheckedChange={() => toggleCorrectAnswer(qIndex, aIndex)}
                      />
                    )}
                    <Input
                      value={answer.answer_text}
                      onChange={(e) => updateAnswer(qIndex, aIndex, 'answer_text', e.target.value)}
                      placeholder={`Вариант ${aIndex + 1}`}
                    />
                    {question.answers.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAnswer(qIndex, aIndex)}
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
                  onClick={() => addAnswer(qIndex)}
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
                Сохранение...
              </>
            ) : (
              <>
                <Icon name="Check" size={16} className="mr-2" />
                Сохранить изменения
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default TestEditForm;