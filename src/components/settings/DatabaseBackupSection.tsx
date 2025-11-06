import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { AutoBackup, autoBackupService } from "@/utils/autoBackup";
import { toast } from "sonner";

interface DatabaseBackupSectionProps {
  backupHistory: AutoBackup[];
  onLoadBackupHistory: () => void;
  onSelectBackup: (backup: AutoBackup) => void;
  onShowRestoreDialog: () => void;
}

export default function DatabaseBackupSection({
  backupHistory,
  onLoadBackupHistory,
  onSelectBackup,
  onShowRestoreDialog
}: DatabaseBackupSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <Icon name="History" size={18} className="mr-2" />
        Автоматические резервные копии
      </h3>
      <Alert className="mb-3 border-blue-200 bg-blue-50">
        <Icon name="Info" size={16} className="text-blue-600" />
        <AlertDescription className="text-blue-800">
          Система автоматически создаёт резервную копию при каждом входе администратора (не чаще 1 раза в 24 часа). Хранятся последние {backupHistory.length} из 10 копий. Размер: {autoBackupService.getBackupSize()}
        </AlertDescription>
      </Alert>

      {backupHistory.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-gray-50">
          <Icon name="Database" size={32} className="mx-auto mb-2 text-gray-400" />
          <p className="text-gray-600">Автоматические резервные копии ещё не создавались</p>
          <p className="text-sm text-gray-500 mt-1">Они будут созданы при следующем входе</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {backupHistory.map((backup, index) => (
            <div key={backup.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon name="Database" size={16} className="text-blue-600" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{backup.date} в {backup.time}</span>
                      {index === 0 && (
                        <Badge variant="secondary" className="text-xs">Последняя</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {backup.stats.total} записей: {backup.stats.employees} сотр., {backup.stats.tests} тест., {backup.stats.testResults} рез.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => autoBackupService.downloadBackup(backup.id)}
                  >
                    <Icon name="Download" size={14} className="mr-1" />
                    Скачать
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onSelectBackup(backup);
                      onShowRestoreDialog();
                    }}
                  >
                    <Icon name="RotateCcw" size={14} className="mr-1" />
                    Восстановить
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm('Удалить эту резервную копию?')) {
                        autoBackupService.deleteBackup(backup.id);
                        onLoadBackupHistory();
                        toast.success('Резервная копия удалена');
                      }
                    }}
                  >
                    <Icon name="Trash2" size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {backupHistory.length > 0 && (
        <div className="mt-3 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const backup = autoBackupService.createAutoBackup();
              if (backup) {
                onLoadBackupHistory();
                toast.success('Резервная копия создана!');
              } else {
                toast.info('Резервная копия уже создавалась за последние 24 часа');
              }
            }}
            className="flex-1"
          >
            <Icon name="Plus" size={14} className="mr-1" />
            Создать копию сейчас
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm(`Удалить все ${backupHistory.length} автоматических резервных копий?`)) {
                autoBackupService.clearAllBackups();
                onLoadBackupHistory();
                toast.success('Все автоматические копии удалены');
              }
            }}
            className="flex-1"
          >
            <Icon name="Trash2" size={14} className="mr-1" />
            Удалить все
          </Button>
        </div>
      )}
    </div>
  );
}
