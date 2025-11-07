import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

interface TeacherStatsProps {
  stats: {
    totalStudents: number;
    createdTests: number;
    averageScore: number;
    activeStudents: number;
  };
}

export const TeacherStats = ({ stats }: TeacherStatsProps) => {
  return (
    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Icon
            name="GraduationCap"
            size={24}
            className="mr-2 text-green-600"
          />
          Статистика обучения
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-3xl font-bold text-green-600">{stats.totalStudents}</div>
            <div className="text-sm text-gray-600">Студентов</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-3xl font-bold text-blue-600">{stats.createdTests}</div>
            <div className="text-sm text-gray-600">Тестов создано</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
