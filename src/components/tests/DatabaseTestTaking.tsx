import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { testsService, TestWithQuestions, UserAnswer } from '@/utils/testsService';

interface DatabaseTestTakingProps {
  testId: number;
  userId: number;
  onComplete: () => void;
  onCancel: () => void;
}

const DatabaseTestTaking: React.FC<DatabaseTestTakingProps> = ({ 
  testId, 
  userId, 
  onComplete, 
  onCancel 
}) => {
  const [test, setTest] = useState<TestWithQuestions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, number[]>>(new Map());
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [testResults, setTestResults] = useState<{
    score: number;
    maxScore: number;
    percentage: number;
    passed: boolean;
  } | null>(null);

  useEffect(() => {
    loadTest();
  }, [testId]);

  useEffect(() => {
    if (test?.time_limit && timeLeft === null) {
      setTimeLeft(test.time_limit * 60);
    }

    if (timeLeft === null || timeLeft === 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [test, timeLeft]);

  const loadTest = async () => {
    setIsLoading(true);
    try {
      const testData = await testsService.getTestWithQuestions(testId);
      if (testData) {
        setTest(testData);
      } else {
        toast.error('Тест не найден');
        onCancel();
      }
    } catch (error) {
      toast.error('Ошибка загрузки теста');
      console.error('Error loading test:', error);
      onCancel();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (questionId: number, answerId: number, isMultiple: boolean = false) => {
    const newAnswers = new Map(answers);
    
    if (isMultiple) {
      const currentAnswers = newAnswers.get(questionId) || [];
      if (currentAnswers.includes(answerId)) {
        newAnswers.set(questionId, currentAnswers.filter(id => id !== answerId));
      } else {
        newAnswers.set(questionId, [...currentAnswers, answerId]);
      }
    } else {
      newAnswers.set(questionId, [answerId]);
    }
    
    setAnswers(newAnswers);
  };

  const calculateResults = (): { score: number; maxScore: number; userAnswers: UserAnswer[] } => {
    if (!test) return { score: 0, maxScore: 0, userAnswers: [] };

    let score = 0;
    let maxScore = 0;
    const userAnswers: UserAnswer[] = [];

    test.questions.forEach(question => {
      maxScore += question.points;
      const userAnswerIds = answers.get(question.id) || [];
      
      if (question.question_type === 'multiple_choice') {
        const correctAnswerIds = (question.answers || [])
          .filter(a => a.is_correct)
          .map(a => a.id);
        
        const isFullyCorrect = 
          correctAnswerIds.every(id => userAnswerIds.includes(id)) &&
          userAnswerIds.every(id => correctAnswerIds.includes(id));
        
        const pointsEarned = isFullyCorrect ? question.points : 0;
        score += pointsEarned;

        userAnswerIds.forEach(answerId => {
          const answer = (question.answers || []).find(a => a.id === answerId);
          userAnswers.push({
            question_id: question.id,
            answer_id: answerId,
            is_correct: answer?.is_correct || false,
            points_earned: isFullyCorrect ? question.points / userAnswerIds.length : 0
          });
        });
      } else {
        const answerId = userAnswerIds[0];
        const answer = (question.answers || []).find(a => a.id === answerId);
        const isCorrect = answer?.is_correct || false;
        const pointsEarned = isCorrect ? question.points : 0;
        
        score += pointsEarned;
        
        if (answerId) {
          userAnswers.push({
            question_id: question.id,
            answer_id: answerId,
            is_correct: isCorrect,
            points_earned: pointsEarned
          });
        }
      }
    });

    return { score, maxScore, userAnswers };
  };

  const handleSubmitTest = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const { score, maxScore, userAnswers } = calculateResults();
      const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
      
      const timeSpent = test?.time_limit ? (test.time_limit * 60 - (timeLeft || 0)) : 0;

      const result = await testsService.submitTestResults({
        test_id: testId,
        employee_id: userId,
        score,
        max_score: maxScore,
        attempt_number: 1,
        time_spent: timeSpent,
        user_answers: userAnswers
      });

      if (result) {
        setTestResults({
          score,
          maxScore,
          percentage,
          passed: result.passed
        });
        setShowResults(true);
        toast.success('Тест завершен!');
      } else {
        toast.error('Ошибка сохранения результатов');
      }
    } catch (error) {
      toast.error('Ошибка отправки результатов');
      console.error('Error submitting test:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  if (!test) {
    return (
      <div className="text-center py-12">
        <Icon name="AlertCircle" size={48} className="mx-auto mb-4 text-red-500" />
        <p className="text-lg font-medium">Тест не найден</p>
        <Button onClick={onCancel} className="mt-4">Назад</Button>
      </div>
    );
  }

  if (showResults && testResults) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Результаты теста</CardTitle>
          <CardDescription>{test.title}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className={`text-6xl font-bold mb-2 ${testResults.passed ? 'text-green-600' : 'text-red-600'}`}>
              {testResults.percentage}%
            </div>
            <Badge variant={testResults.passed ? 'default' : 'destructive'} className="text-lg py-1 px-3">
              {testResults.passed ? 'Тест пройден' : 'Тест не пройден'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Набрано баллов</p>
              <p className="text-2xl font-bold">{testResults.score} / {testResults.maxScore}</p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Проходной балл</p>
              <p className="text-2xl font-bold">{test.passing_score}%</p>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <Button onClick={onComplete}>
              <Icon name="CheckCircle" size={16} className="mr-2" />
              Завершить
            </Button>
            
            {!testResults.passed && test.max_attempts > 1 && (
              <Button variant="outline" onClick={() => window.location.reload()}>
                <Icon name="RotateCcw" size={16} className="mr-2" />
                Попробовать еще раз
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / test.questions.length) * 100;

  return (
    <div className="space-y-6">
      {/* Заголовок и таймер */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{test.title}</CardTitle>
              <CardDescription>
                Вопрос {currentQuestionIndex + 1} из {test.questions.length}
              </CardDescription>
            </div>
            
            {timeLeft !== null && (
              <div className="flex items-center space-x-2">
                <Icon name="Clock" size={20} className={timeLeft < 60 ? 'text-red-600' : 'text-blue-600'} />
                <span className={`text-lg font-bold ${timeLeft < 60 ? 'text-red-600' : ''}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Вопрос */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{currentQuestion.question_text}</CardTitle>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <Badge variant="outline">{currentQuestion.points} балл(ов)</Badge>
            <Badge variant="outline">
              {currentQuestion.question_type === 'multiple_choice' 
                ? 'Несколько ответов' 
                : 'Один ответ'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {currentQuestion.question_type === 'multiple_choice' ? (
            <div className="space-y-3">
              {(currentQuestion.answers || []).map((answer) => (
                <div key={answer.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Checkbox
                    id={`answer-${answer.id}`}
                    checked={answers.get(currentQuestion.id)?.includes(answer.id) || false}
                    onCheckedChange={() => handleAnswer(currentQuestion.id, answer.id, true)}
                  />
                  <Label htmlFor={`answer-${answer.id}`} className="flex-1 cursor-pointer">
                    {answer.answer_text}
                  </Label>
                </div>
              ))}
            </div>
          ) : (
            <RadioGroup
              value={answers.get(currentQuestion.id)?.[0]?.toString()}
              onValueChange={(value) => handleAnswer(currentQuestion.id, parseInt(value))}
            >
              <div className="space-y-3">
                {(currentQuestion.answers || []).map((answer) => (
                  <div key={answer.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <RadioGroupItem value={answer.id.toString()} id={`answer-${answer.id}`} />
                    <Label htmlFor={`answer-${answer.id}`} className="flex-1 cursor-pointer">
                      {answer.answer_text}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          )}
        </CardContent>
      </Card>

      {/* Навигация */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
            >
              <Icon name="ChevronLeft" size={16} className="mr-2" />
              Назад
            </Button>

            <div className="text-sm text-gray-600">
              Отвечено: {answers.size} / {test.questions.length}
            </div>

            {currentQuestionIndex < test.questions.length - 1 ? (
              <Button
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
              >
                Далее
                <Icon name="ChevronRight" size={16} className="ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmitTest}
                disabled={isSubmitting || answers.size < test.questions.length}
              >
                {isSubmitting ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  <>
                    <Icon name="Send" size={16} className="mr-2" />
                    Завершить тест
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Отмена */}
      <div className="text-center">
        <Button variant="ghost" onClick={onCancel}>
          Отменить прохождение теста
        </Button>
      </div>
    </div>
  );
};

export default DatabaseTestTaking;