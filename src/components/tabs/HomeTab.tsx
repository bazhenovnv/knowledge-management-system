import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface HomeTabProps {
  setActiveTab: (tab: string) => void;
}

export const HomeTab = ({ setActiveTab }: HomeTabProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Добро пожаловать в систему развития сотрудников
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Современный инструмент для обучения, тестирования и управления
          знаниями
        </p>
        <div className="flex justify-center space-x-4">
          <Button
            onClick={() => setActiveTab("dashboard")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Icon name="LayoutDashboard" size={16} className="mr-2" />
            Перейти в панель управления
          </Button>
          <Button variant="outline" onClick={() => setActiveTab("knowledge")}>
            <Icon name="BookOpen" size={16} className="mr-2" />
            Изучить базу знаний
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Icon
                name="GraduationCap"
                size={24}
                className="mr-2 text-blue-600"
              />
              Обучение
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Интерактивные курсы и материалы для развития профессиональных
              навыков
            </p>
            <Button
              variant="outline"
              onClick={() => setActiveTab("knowledge")}
              className="w-full"
            >
              Начать обучение
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Icon name="FileText" size={24} className="mr-2 text-green-600" />
              Тестирование
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Проверьте свои знания с помощью интерактивных тестов и получите
              оценку
            </p>
            <Button
              variant="outline"
              onClick={() => setActiveTab("dashboard")}
              className="w-full"
            >
              Пройти тесты
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Icon
                name="BarChart3"
                size={24}
                className="mr-2 text-purple-600"
              />
              Аналитика
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Отслеживайте свой прогресс и анализируйте результаты обучения
            </p>
            <Button
              variant="outline"
              onClick={() => setActiveTab("analytics")}
              className="w-full"
            >
              Посмотреть статистику
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="text-center">Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => setActiveTab("dashboard")}
            >
              <Icon name="Play" size={24} className="text-blue-600" />
              <span className="text-sm">Начать тест</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => setActiveTab("knowledge")}
            >
              <Icon name="Search" size={24} className="text-green-600" />
              <span className="text-sm">Найти курс</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => setActiveTab("analytics")}
            >
              <Icon name="TrendingUp" size={24} className="text-purple-600" />
              <span className="text-sm">Мой прогресс</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => setActiveTab("knowledge")}
            >
              <Icon
                name="MessageCircle"
                size={24}
                className="text-orange-600"
              />
              <span className="text-sm">Задать вопрос</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
