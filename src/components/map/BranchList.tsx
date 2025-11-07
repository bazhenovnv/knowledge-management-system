import { Button } from '@/components/ui/button';
import { Branch } from './RussiaMap';
import Icon from '@/components/ui/icon';

interface BranchListProps {
  branches: Branch[];
  userRole?: string;
  showManagementPanel: boolean;
  hoveredBranch: string | null;
  onBranchHover: (id: string | null) => void;
  onBranchClick: (branch: Branch) => void;
  onEditClick: (branch: Branch) => void;
  onDeleteClick: (branch: Branch) => void;
}

export const BranchList = ({
  branches,
  userRole,
  showManagementPanel,
  hoveredBranch,
  onBranchHover,
  onBranchClick,
  onEditClick,
  onDeleteClick
}: BranchListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {branches.map((branch) => (
        <div
          key={branch.id}
          className="p-4 border rounded-lg hover:shadow-md hover:border-blue-400 transition-all duration-200 bg-white"
          onMouseEnter={() => onBranchHover(branch.id)}
          onMouseLeave={() => onBranchHover(null)}
        >
          <div className="flex items-start justify-between mb-2">
            <h4 
              className="font-semibold text-lg text-blue-900 cursor-pointer hover:text-blue-600"
              onClick={() => onBranchClick(branch)}
            >
              {branch.city}
            </h4>
            <div className="flex items-center gap-2">
              {branch.id === '1' && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                  HQ
                </span>
              )}
              {userRole === 'admin' && showManagementPanel && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditClick(branch);
                    }}
                    className="h-7 w-7 p-0 hover:bg-blue-100"
                  >
                    <Icon name="Edit" size={14} className="text-blue-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteClick(branch);
                    }}
                    className="h-7 w-7 p-0 hover:bg-red-100"
                  >
                    <Icon name="Trash2" size={14} className="text-red-600" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          <p 
            className="text-sm text-gray-600 mb-3 cursor-pointer"
            onClick={() => onBranchClick(branch)}
          >
            {branch.description}
          </p>
          <div 
            className="space-y-1 text-sm cursor-pointer"
            onClick={() => onBranchClick(branch)}
          >
            <div className="flex items-center gap-2 text-gray-500">
              <Icon name="MapPin" size={14} />
              <span className="truncate">{branch.address}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Icon name="Users" size={14} />
              <span>{branch.employees} сотрудников</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Icon name="Phone" size={14} />
              <span>{branch.phone}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
