import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { database, KnowledgeMaterial, Test } from "@/utils/database";
import { toast } from "sonner";

interface TestFromMaterialFormProps {
  isOpen: boolean;
  onClose: () => void;
  material: KnowledgeMaterial | null;
  onSuccess: () => void;
}

interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

const difficultyMapping = {
  "Начальный": "easy" as const,
  "Средний": "medium" as const, 
  "Продвинутый": "hard" as const
};

const generateQuestionsFromMaterial = (material: KnowledgeMaterial): TestQuestion[] => {
  const questions: TestQuestion[] = [];
  
  // Генерируем вопросы на основе содержания материала
  const contentLines = material.content.split('\n').filter(line => line.trim().length > 0);
  
  // Вопрос 1: Общий вопрос о материале
  questions.push({
    id: `q1_${Date.now()}`,
    question: `Что является основной темой материала "${material.title}"?`,
    options: [
      material.description,
      "Общие принципы программирования",
      "Основы веб-разработки",
      "Управление проектами"
    ],
    correctAnswer: 0,
    explanation: "Основная тема раскрывается в описании материала"
  });

  // Вопрос 2: О категории
  questions.push({
    id: `q2_${Date.now()}`,
    question: `К какой категории относится данный материал?`,
    options: [
      "Программирование",
      material.category,
      "Дизайн",
      "Маркетинг"
    ],
    correctAnswer: 1,
    explanation: `Материал относится к категории "${material.category}"`
  });

  // Вопрос 3: О сложности
  questions.push({
    id: `q3_${Date.now()}`,
    question: `Какой уровень сложности имеет данный материал?`,
    options: [
      "Начальный",
      "Средний", 
      "Продвинутый",
      "Экспертный"
    ],
    correctAnswer: ["Начальный", "Средний", "Продвинутый"].indexOf(material.difficulty),
    explanation: `Уровень сложности: ${material.difficulty}`
  });

  // Вопрос 4: О тегах
  if (material.tags.length > 0) {
    questions.push({
      id: `q4_${Date.now()}`,
      question: `Какие из следующих тегов относятся к данному материалу?`,
      options: [
        material.tags[0] || "React",
        "PHP",
        "Python",
        "Java"
      ],
      correctAnswer: 0,
      explanation: `Один из тегов материала: ${material.tags[0]}`
    });
  }

  // Вопрос 5: О продолжительности
  questions.push({
    id: `q5_${Date.now()}`,
    question: `Сколько времени требуется для изучения данного материала?`,
    options: [
      "30 минут",
      material.duration,
      "1 день",
      "1 неделя"
    ],
    correctAnswer: 1,
    explanation: `Время изучения: ${material.duration}`
  });

  return questions;
};

export const TestFromMaterialForm = ({
  isOpen,
  onClose,
  material,
  onSuccess
}: TestFromMaterialFormProps) => {
  const [testData, setTestData] = useState({
    title: '',
    description: '',
    timeLimit: 30,
    questions: [] as TestQuestion[]
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: настройки теста, 2: вопросы

  useEffect(() => {
    if (material && isOpen) {
      const generatedQuestions = generateQuestionsFromMaterial(material);
      setTestData({
        title: `Тест по материалу: ${material.title}`,
        description: `Тест для проверки знаний по материалу "${material.title}" в категории ${material.category}`,
        timeLimit: 30,
        questions: generatedQuestions
      });
      setStep(1);
    }
  }, [material, isOpen]);

  const handleCreateTest = async () => {
    if (!material) return;

    setLoading(true);
    try {
      const newTest: Omit<Test, 'createdAt'> = {
        id: Date.now().toString(),
        title: testData.title,
        description: testData.description,
        category: material.category,
        difficulty: difficultyMapping[material.difficulty],
        timeLimit: testData.timeLimit,
        questions: testData.questions.map(q => ({
          id: q.id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation
        })),
        department: material.department,
        createdBy: "admin", // В реальном приложении получать из контекста пользователя
        status: "published",
        totalAttempts: 0,
        averageScore: 0,
        sourceMaterialId: material.id,
        isGeneratedFromMaterial: true
      };

      database.saveTest(newTest);
      toast.success('Тест успешно создан!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Ошибка создания теста:', error);
      toast.error('Ошибка при создании теста');
    } finally {
      setLoading(false);
    }
  };

  const updateQuestion = (questionId: string, field: keyof TestQuestion, value: any) => {
    setTestData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, [field]: value } : q
      )
    }));
  };

  const updateQuestionOption = (questionId: string, optionIndex: number, value: string) => {
    setTestData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId 
          ? { ...q, options: q.options.map((opt, idx) => idx === optionIndex ? value : opt) }
          : q
      )
    }));
  };

  if (!material) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="FileText" size={20} />
            Создание теста по материалу
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Информация о материале */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Исходный материал</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{material.title}</h3>
                  <p className="text-sm text-gray-600">{material.description}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">{material.category}</Badge>
                  <Badge variant="outline">{material.difficulty}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Настройки теста</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Название теста</Label>
                  <Input
                    id="title"
                    value={testData.title}
                    onChange={(e) => setTestData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Введите название теста"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Описание теста</Label>
                  <Textarea
                    id="description"
                    value={testData.description}
                    onChange={(e) => setTestData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Описание теста"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="timeLimit">Время на прохождение (минуты)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    value={testData.timeLimit}
                    onChange={(e) => setTestData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 30 }))}
                    min="5"
                    max="120"
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => setStep(2)} className="hover:scale-105 transition-transform">
                    <Icon name="ArrowRight" size={16} className="mr-2" />
                    Далее: Настройка вопросов
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Вопросы теста</h3>
                <Badge variant="outline">{testData.questions.length} вопросов</Badge>
              </div>

              {testData.questions.map((question, index) => (
                <Card key={question.id}>
                  <CardHeader>
                    <CardTitle className="text-base">Вопрос {index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Текст вопроса</Label>
                      <Textarea
                        value={question.question}
                        onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label>Варианты ответов</Label>
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <Badge variant={optIndex === question.correctAnswer ? "default" : "outline"}>
                              {optIndex + 1}
                            </Badge>
                            <Input
                              value={option}
                              onChange={(e) => updateQuestionOption(question.id, optIndex, e.target.value)}
                              placeholder={`Вариант ${optIndex + 1}`}
                            />
                            {optIndex === question.correctAnswer && (
                              <Icon name="CheckCircle" size={16} className="text-green-600" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Правильный ответ</Label>
                      <select
                        value={question.correctAnswer}
                        onChange={(e) => updateQuestion(question.id, 'correctAnswer', parseInt(e.target.value))}
                        className="w-full border rounded px-3 py-2"
                      >
                        {question.options.map((_, optIndex) => (
                          <option key={optIndex} value={optIndex}>
                            Вариант {optIndex + 1}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label>Объяснение (необязательно)</Label>
                      <Textarea
                        value={question.explanation || ''}
                        onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
                        rows={2}
                        placeholder="Объяснение правильного ответа"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(1)} className="hover:scale-105 transition-transform">
                  <Icon name="ArrowLeft" size={16} className="mr-2" />
                  Назад
                </Button>
                <Button onClick={handleCreateTest} disabled={loading} className="hover:scale-105 transition-transform bg-purple-600 hover:bg-purple-700 text-white">
                  {loading ? (
                    <>
                      <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                      Создание теста...
                    </>
                  ) : (
                    <>
                      <Icon name="Plus" size={16} className="mr-2" />
                      Создать тест
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};