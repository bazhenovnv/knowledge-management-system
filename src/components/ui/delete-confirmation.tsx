import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";

interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
  loading?: boolean;
}

export const DeleteConfirmation = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Подтвердить удаление",
  description,
  itemName = "элемент",
  loading = false
}: DeleteConfirmationProps) => {
  const defaultDescription = `Вы уверены, что хотите удалить этот ${itemName}? Это действие нельзя отменить.`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Icon name="AlertTriangle" size={20} />
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {description || defaultDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Отмена
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? (
              <>
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                Удаление...
              </>
            ) : (
              <>
                <Icon name="Trash2" size={16} className="mr-2" />
                Удалить
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};