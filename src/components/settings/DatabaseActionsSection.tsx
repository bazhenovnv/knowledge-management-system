import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Icon from "@/components/ui/icon";

interface DatabaseActionsSectionProps {
  isExporting: boolean;
  isImporting: boolean;
  onExport: () => void;
  onImport: () => void;
  onShowClearDialog: () => void;
  onShowResetDialog: () => void;
}

export default function DatabaseActionsSection({
  isExporting,
  isImporting,
  onExport,
  onImport,
  onShowClearDialog,
  onShowResetDialog
}: DatabaseActionsSectionProps) {
  return (
    <>
      {/* Экспорт */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <Icon name="Download" size={18} className="mr-2" />
          Экспорт базы данных
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          Создайте резервную копию всех данных в формате JSON. Файл можно импортировать позже для восстановления.
        </p>
        <Button 
          onClick={onExport} 
          disabled={isExporting}
          className="w-full"
        >
          {isExporting ? (
            <>
              <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
              Экспорт...
            </>
          ) : (
            <>
              <Icon name="Download" size={16} className="mr-2" />
              Экспортировать базу данных
            </>
          )}
        </Button>
      </div>

      <Separator />

      {/* Импорт */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <Icon name="Upload" size={18} className="mr-2" />
          Импорт базы данных
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          Восстановите данные из ранее созданной резервной копии. <strong>Внимание:</strong> это заменит все текущие данные!
        </p>
        <Alert className="mb-3 border-orange-200 bg-orange-50">
          <Icon name="AlertTriangle" size={16} className="text-orange-600" />
          <AlertDescription className="text-orange-800">
            Импорт заменит все текущие данные. Рекомендуется сначала создать экспорт.
          </AlertDescription>
        </Alert>
        <Button 
          onClick={onImport} 
          disabled={isImporting}
          className="w-full"
        >
          {isImporting ? (
            <>
              <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
              Импорт...
            </>
          ) : (
            <>
              <Icon name="Upload" size={16} className="mr-2" />
              Импортировать базу данных
            </>
          )}
        </Button>
      </div>

      <Separator />

      {/* Опасные операции */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center text-red-600">
          <Icon name="AlertTriangle" size={18} className="mr-2" />
          Опасная зона
        </h3>
        <Alert className="mb-3 border-red-200 bg-red-50">
          <Icon name="AlertTriangle" size={16} className="text-red-600" />
          <AlertDescription className="text-red-800">
            Эти действия необратимы! Обязательно создайте резервную копию перед выполнением.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-3">
          <Button 
            onClick={onShowClearDialog}
            variant="outline"
            className="w-full border-red-200 hover:bg-red-50 text-red-600"
          >
            <Icon name="Trash2" size={16} className="mr-2" />
            Очистить базу данных
          </Button>

          <Button 
            onClick={onShowResetDialog}
            variant="outline"
            className="w-full border-orange-200 hover:bg-orange-50 text-orange-600"
          >
            <Icon name="RotateCcw" size={16} className="mr-2" />
            Сбросить к демо-данным
          </Button>
        </div>
      </div>
    </>
  );
}
