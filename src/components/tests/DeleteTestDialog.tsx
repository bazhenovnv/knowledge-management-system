import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Icon from '@/components/ui/icon';

interface DeleteTestDialogProps {
  isOpen: boolean;
  testTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteTestDialog: React.FC<DeleteTestDialogProps> = ({
  isOpen,
  testTitle,
  onConfirm,
  onCancel,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center space-x-2">
            <div className="bg-red-100 dark:bg-red-900/20 p-2 rounded-full">
              <Icon name="AlertTriangle" size={24} className="text-red-600" />
            </div>
            <AlertDialogTitle>Удалить тест?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-4">
            Вы уверены, что хотите удалить тест <strong>"{testTitle}"</strong>?
            <br />
            <br />
            Тест будет деактивирован и скрыт из списка. Все результаты прохождения теста
            сотрудниками будут сохранены.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            <Icon name="Trash2" size={16} className="mr-2" />
            Удалить тест
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteTestDialog;
