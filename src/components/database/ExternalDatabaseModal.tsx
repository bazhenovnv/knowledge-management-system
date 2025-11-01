import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";

interface ExternalDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (connectionString: string) => Promise<void>;
}

export const ExternalDatabaseModal = ({
  isOpen,
  onClose,
  onSave,
}: ExternalDatabaseModalProps) => {
  const [connectionString, setConnectionString] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!connectionString.trim()) {
      toast.error("Введите строку подключения");
      return;
    }

    // Базовая валидация PostgreSQL строки подключения
    if (!connectionString.includes("postgresql://") && !connectionString.includes("postgres://")) {
      toast.error("Неверный формат строки подключения PostgreSQL");
      return;
    }

    try {
      setIsSaving(true);
      await onSave(connectionString);
      toast.success("База данных подключена");
      setConnectionString("");
      onClose();
    } catch (error) {
      toast.error("Ошибка подключения к базе данных");
      console.error("Database connection error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setConnectionString("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Database" size={24} />
            Подключить внешнюю базу данных
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex gap-3">
              <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm text-blue-900 dark:text-blue-100">
                <p className="font-medium">Внешняя PostgreSQL база данных TimeWeb Cloud с полной SSL верификацией</p>
                <p className="text-blue-700 dark:text-blue-300">
                  Вставьте строку подключения в формате:<br />
                  <code className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded mt-1 inline-block">
                    postgresql://user:password@host:port/database?sslmode=verify-full
                  </code>
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="connection-string" className="text-base font-semibold">
              Строка подключения (EXTERNAL_DATABASE_URL)
            </Label>
            <Textarea
              id="connection-string"
              value={connectionString}
              onChange={(e) => setConnectionString(e.target.value)}
              placeholder="postgresql://gen_user:Nikita230282@d83d798a9783891138...@localhost:5432/default_db?sslmode=verify-full"
              className="font-mono text-sm min-h-[120px] resize-none"
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">
              Строка подключения будет сохранена в секретах проекта
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleSave} 
              disabled={isSaving || !connectionString.trim()}
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Подключение...
                </>
              ) : (
                <>
                  <Icon name="Database" size={16} className="mr-2" />
                  Подключить базу данных
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={isSaving}
            >
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
