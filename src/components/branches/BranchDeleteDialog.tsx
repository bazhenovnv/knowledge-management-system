import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Branch } from "./BranchManager";

interface BranchDeleteDialogProps {
  isOpen: boolean;
  branch: Branch | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const BranchDeleteDialog = ({
  isOpen,
  branch,
  onConfirm,
  onCancel,
}: BranchDeleteDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить филиал?</AlertDialogTitle>
          <AlertDialogDescription>
            Вы уверены, что хотите удалить филиал "{branch?.name}"? 
            Это действие нельзя отменить.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
            Удалить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
