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
  isDeleted?: boolean;
  onConfirm: (permanent: boolean) => void;
  onCancel: () => void;
}

const DeleteTestDialog: React.FC<DeleteTestDialogProps> = ({
  isOpen,
  testTitle,
  isDeleted = false,
  onConfirm,
  onCancel,
}) => {
  const [isPermanent, setIsPermanent] = React.useState(false);
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
            {isDeleted ? (
              <>
                Тест <strong>"{testTitle}"</strong> уже удалён.
                <br />
                <br />
                Вы можете восстановить его или удалить полностью из базы данных.
                <br />
                <strong className="text-red-600">Полное удаление необратимо!</strong> Все результаты прохождения теста будут потеряны.
              </>
            ) : (
              <>
                Вы уверены, что хотите удалить тест <strong>"{testTitle}"</strong>?
                <br />
                <br />
                {isPermanent ? (
                  <>
                    <strong className="text-red-600">Внимание! Полное удаление!</strong>
                    <br />
                    Тест и все результаты его прохождения будут безвозвратно удалены из базы данных.
                    Это действие нельзя отменить.
                  </>
                ) : (
                  <>
                    Тест будет деактивирован и скрыт из списка. Все результаты прохождения теста
                    сотрудниками будут сохранены. Тест можно будет восстановить позже.
                  </>
                )}
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {!isDeleted && (
            <div className="flex items-center mr-auto">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPermanent}
                  onChange={(e) => setIsPermanent(e.target.checked)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Удалить полностью из базы данных
                </span>
              </label>
            </div>
          )}
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          {isDeleted ? (
            <AlertDialogAction
              onClick={() => onConfirm(true)}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              <Icon name="Trash2" size={16} className="mr-2" />
              Удалить навсегда
            </AlertDialogAction>
          ) : (
            <AlertDialogAction
              onClick={() => onConfirm(isPermanent)}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              <Icon name="Trash2" size={16} className="mr-2" />
              {isPermanent ? 'Удалить навсегда' : 'Удалить тест'}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteTestDialog;