import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { Branch } from "./BranchManager";
import { BranchCard } from "./BranchCard";

interface BranchListProps {
  branches: Branch[];
  selectedBranchId: string | null;
  onSelectBranch: (id: string) => void;
  onEditBranch: (branch: Branch) => void;
  onDeleteBranch: (branch: Branch) => void;
  onToggleStatus: (id: string) => void;
}

export const BranchList = ({
  branches,
  selectedBranchId,
  onSelectBranch,
  onEditBranch,
  onDeleteBranch,
  onToggleStatus,
}: BranchListProps) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Icon name="MapPin" size={20} className="mr-2 text-blue-600" />
            Список филиалов ({branches.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {branches.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Icon name="Building" size={48} className="mx-auto mb-2 opacity-30" />
              <p>Нет филиалов</p>
              <p className="text-sm">Добавьте первый филиал</p>
            </div>
          ) : (
            branches.map((branch) => (
              <BranchCard
                key={branch.id}
                branch={branch}
                isSelected={selectedBranchId === branch.id}
                onSelect={() => onSelectBranch(branch.id)}
                onEdit={() => onEditBranch(branch)}
                onDelete={() => onDeleteBranch(branch)}
                onToggleStatus={() => onToggleStatus(branch.id)}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
