import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

interface DataExportImportProps {
  onExportTestResults: () => void;
  onExportStudents: () => void;
  onImportStudents: () => void;
}

export const DataExportImport = ({
  onExportTestResults,
  onExportStudents,
  onImportStudents,
}: DataExportImportProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Экспорт и импорт данных</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600 font-medium">
              Результаты тестов
            </p>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center"
              onClick={onExportTestResults}
            >
              <Icon name="Download" size={16} className="mr-2" />
              Экспорт результатов
            </Button>
            <p className="text-xs text-gray-500">
              Скачать все результаты тестов в формате JSON
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600 font-medium">Список студентов</p>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center"
              onClick={onExportStudents}
            >
              <Icon name="Download" size={16} className="mr-2" />
              Экспорт студентов
            </Button>
            <p className="text-xs text-gray-500">
              Скачать список всех студентов в JSON
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600 font-medium">
              Импорт студентов
            </p>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center"
              onClick={onImportStudents}
            >
              <Icon name="Upload" size={16} className="mr-2" />
              Импорт студентов
            </Button>
            <p className="text-xs text-gray-500">
              Загрузить студентов из JSON файла
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
