import { Separator } from "@/components/ui/separator";
import Icon from "@/components/ui/icon";

interface DatabaseStatsSectionProps {
  stats: {
    employees: number;
    tests: number;
    testResults: number;
    materials: number;
    notifications: number;
    assignments: number;
    total: number;
  };
}

export default function DatabaseStatsSection({ stats }: DatabaseStatsSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <Icon name="BarChart3" size={18} className="mr-2" />
        Статистика базы данных
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg bg-blue-50">
          <div className="flex items-center justify-between mb-2">
            <Icon name="Users" size={20} className="text-blue-600" />
            <span className="text-2xl font-bold text-blue-600">{stats.employees}</span>
          </div>
          <p className="text-sm text-gray-600">Сотрудников</p>
        </div>

        <div className="p-4 border rounded-lg bg-green-50">
          <div className="flex items-center justify-between mb-2">
            <Icon name="FileText" size={20} className="text-green-600" />
            <span className="text-2xl font-bold text-green-600">{stats.tests}</span>
          </div>
          <p className="text-sm text-gray-600">Тестов</p>
        </div>

        <div className="p-4 border rounded-lg bg-purple-50">
          <div className="flex items-center justify-between mb-2">
            <Icon name="CheckCircle" size={20} className="text-purple-600" />
            <span className="text-2xl font-bold text-purple-600">{stats.testResults}</span>
          </div>
          <p className="text-sm text-gray-600">Результатов</p>
        </div>

        <div className="p-4 border rounded-lg bg-orange-50">
          <div className="flex items-center justify-between mb-2">
            <Icon name="BookOpen" size={20} className="text-orange-600" />
            <span className="text-2xl font-bold text-orange-600">{stats.materials}</span>
          </div>
          <p className="text-sm text-gray-600">Материалов</p>
        </div>

        <div className="p-4 border rounded-lg bg-yellow-50">
          <div className="flex items-center justify-between mb-2">
            <Icon name="Bell" size={20} className="text-yellow-600" />
            <span className="text-2xl font-bold text-yellow-600">{stats.notifications}</span>
          </div>
          <p className="text-sm text-gray-600">Уведомлений</p>
        </div>

        <div className="p-4 border rounded-lg bg-pink-50">
          <div className="flex items-center justify-between mb-2">
            <Icon name="ClipboardList" size={20} className="text-pink-600" />
            <span className="text-2xl font-bold text-pink-600">{stats.assignments}</span>
          </div>
          <p className="text-sm text-gray-600">Заданий</p>
        </div>
      </div>

      <div className="mt-4 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-blue-900">Всего записей в БД</p>
            <p className="text-sm text-blue-700">Общее количество данных</p>
          </div>
          <span className="text-4xl font-bold text-blue-600">{stats.total}</span>
        </div>
      </div>
    </div>
  );
}
