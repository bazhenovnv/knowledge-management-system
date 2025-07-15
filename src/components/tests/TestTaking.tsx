import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, Clock, CheckCircle, X } from "lucide-react";
import { toast } from "sonner";
import Icon from "@/components/ui/icon";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  timeLimit?: number;
}

interface Test {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number;
  questions: Question[];
  department?: string;
}

interface TestResult {
  testId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  answers: { questionId: string; selectedAnswer: number; correct: boolean }[];
  completedAt: Date;
}

interface TestTakingProps {
  test: Test | null;
  onClose: () => void;
  onComplete: (result: TestResult) => void;
  userId: string;
}

const TestTaking: React.FC<TestTakingProps> = ({
  test,
  onClose,
  onComplete,
  userId,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; selectedAnswer: number | null }[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isStarted, setIsStarted] = useState(false);

  // Инициализация теста
  useEffect(() => {
    if (test && !isStarted) {
      setAnswers(test.questions.map(q => ({ questionId: q.id, selectedAnswer: null })));
      setTimeLeft(test.timeLimit * 60); // конвертируем минуты в секунды
      setQuestionTimeLeft(test.questions[0]?.timeLimit || 60);
      setStartTime(new Date());
    }
  }, [test, isStarted]);

  // Общий таймер теста
  useEffect(() => {
    if (!isStarted || isCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleCompleteTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, isCompleted]);

  // Таймер для текущего вопроса
  useEffect(() => {
    if (!isStarted || isCompleted) return;

    const questionTimer = setInterval(() => {
      setQuestionTimeLeft(prev => {
        if (prev <= 1) {
          handleNextQuestion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(questionTimer);
  }, [currentQuestionIndex, isStarted, isCompleted]);

  // Обновление таймера вопроса при смене вопроса
  useEffect(() => {
    if (test && isStarted && !isCompleted) {
      const currentQuestion = test.questions[currentQuestionIndex];
      setQuestionTimeLeft(currentQuestion?.timeLimit || 60);
    }
  }, [currentQuestionIndex, test, isStarted, isCompleted]);

  const handleStartTest = () => {
    setIsStarted(true);
    setStartTime(new Date());
    toast.success("Тест начат! Удачи!");
  };

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setAnswers(prev => prev.map(a => 
      a.questionId === questionId 
        ? { ...a, selectedAnswer: answerIndex }
        : a
    ));
  };

  const handleNextQuestion = () => {
    if (!test) return;
    
    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleCompleteTest();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleCompleteTest = () => {
    if (!test || !startTime) return;

    const endTime = new Date();
    const timeSpent = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    
    const resultAnswers = answers.map(answer => {
      const question = test.questions.find(q => q.id === answer.questionId);
      return {
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer ?? -1,
        correct: answer.selectedAnswer === question?.correctAnswer
      };
    });

    const correctAnswers = resultAnswers.filter(a => a.correct).length;
    const score = Math.round((correctAnswers / test.questions.length) * 100);

    const result: TestResult = {
      testId: test.id,
      userId: userId,
      score,
      totalQuestions: test.questions.length,
      correctAnswers,
      timeSpent,
      answers: resultAnswers,
      completedAt: endTime
    };

    setTestResult(result);
    setIsCompleted(true);
    setShowResults(true);
    onComplete(result);
    
    toast.success(`Тест завершен! Ваш результат: ${score}%`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  if (!test) return null;

  const currentQuestion = test.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / test.questions.length) * 100;
  const currentAnswer = answers.find(a => a.questionId === currentQuestion?.id);

  return (
    <Dialog open={!!test} onOpenChange={() => !isStarted && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{test.title}</span>
            {isStarted && !isCompleted && (
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <Icon name="Clock" size={16} className="mr-1" />
                  <span className={timeLeft < 300 ? "text-red-500" : ""}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <div className="flex items-center">
                  <Icon name="AlertCircle" size={16} className="mr-1" />
                  <span className={questionTimeLeft < 10 ? "text-red-500" : ""}>
                    {formatTime(questionTimeLeft)}
                  </span>
                </div>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        {!isStarted && !isCompleted && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{test.title}</h3>
                <p className="text-gray-600">{test.description}</p>
              </div>
              
              <div className="flex justify-center space-x-4">
                <Badge className="bg-blue-100 text-blue-800">
                  {test.category}
                </Badge>
                <Badge className={
                  test.difficulty === "easy" ? "bg-green-100 text-green-800" :
                  test.difficulty === "medium" ? "bg-yellow-100 text-yellow-800" :
                  "bg-red-100 text-red-800"
                }>
                  {test.difficulty === "easy" ? "Легкий" : 
                   test.difficulty === "medium" ? "Средний" : "Сложный"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Icon name="Clock" size={24} className="mx-auto mb-2 text-gray-600" />
                  <div className="text-lg font-semibold">{test.timeLimit} мин</div>
                  <div className="text-sm text-gray-600">Общее время</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Icon name="AlertCircle" size={24} className="mx-auto mb-2 text-gray-600" />
                  <div className="text-lg font-semibold">{test.questions.length}</div>
                  <div className="text-sm text-gray-600">Вопросов</div>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={onClose}>
                Отмена
              </Button>
              <Button onClick={handleStartTest}>
                Начать тест
              </Button>
            </div>
          </div>
        )}

        {isStarted && !isCompleted && currentQuestion && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Вопрос {currentQuestionIndex + 1} из {test.questions.length}
                </span>
                <div className="flex items-center space-x-2">
                  <Progress value={progress} className="w-32" />
                  <span className="text-sm font-medium">{Math.round(progress)}%</span>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {currentQuestion.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                        className={`w-full p-4 text-left rounded-lg border transition-colors ${
                          currentAnswer?.selectedAnswer === index
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                            currentAnswer?.selectedAnswer === index
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300"
                          }`}>
                            {currentAnswer?.selectedAnswer === index && (
                              <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                            )}
                          </div>
                          <span>{option}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Предыдущий
              </Button>
              <div className="flex space-x-2">
                {currentQuestionIndex === test.questions.length - 1 ? (
                  <Button onClick={handleCompleteTest}>
                    Завершить тест
                  </Button>
                ) : (
                  <Button onClick={handleNextQuestion}>
                    Следующий
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {showResults && testResult && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <Icon 
                  name="CheckCircle" 
                  size={48} 
                  className={`mx-auto ${getScoreColor(testResult.score)}`} 
                />
                <h3 className="text-2xl font-bold">Тест завершен!</h3>
                <div className="space-y-2">
                  <Badge className={`text-lg px-4 py-2 ${getScoreBadgeColor(testResult.score)}`}>
                    {testResult.score}%
                  </Badge>
                  <p className="text-gray-600">
                    Правильных ответов: {testResult.correctAnswers} из {testResult.totalQuestions}
                  </p>
                  <p className="text-sm text-gray-500">
                    Время прохождения: {formatTime(testResult.timeSpent)}
                  </p>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Результаты по вопросам</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {test.questions.map((question, index) => {
                    const answer = testResult.answers.find(a => a.questionId === question.id);
                    return (
                      <div key={question.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium mb-2">
                              {index + 1}. {question.question}
                            </h4>
                            <div className="space-y-2">
                              {question.options.map((option, optIndex) => (
                                <div
                                  key={optIndex}
                                  className={`p-2 rounded text-sm ${
                                    optIndex === question.correctAnswer
                                      ? "bg-green-100 text-green-800"
                                      : answer?.selectedAnswer === optIndex
                                        ? "bg-red-100 text-red-800"
                                        : "bg-gray-50"
                                  }`}
                                >
                                  {optIndex === question.correctAnswer && "✓ "}
                                  {answer?.selectedAnswer === optIndex && optIndex !== question.correctAnswer && "✗ "}
                                  {option}
                                </div>
                              ))}
                            </div>
                            {question.explanation && (
                              <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                                <strong>Пояснение:</strong> {question.explanation}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            {answer?.correct ? (
                              <Icon name="CheckCircle" className="text-green-500" size={20} />
                            ) : (
                              <Icon name="X" className="text-red-500" size={20} />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <Button onClick={onClose}>
                Закрыть
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TestTaking;