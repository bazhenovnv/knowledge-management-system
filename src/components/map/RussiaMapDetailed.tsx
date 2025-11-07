import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BranchModal } from './BranchModal';
import { BranchEditDialog } from './BranchEditDialog';
import { Branch } from './RussiaMap';
import Icon from '@/components/ui/icon';
import { branches } from './branchesData';
import { MapSVG } from './MapSVG';
import { BranchList } from './BranchList';

interface RussiaMapDetailedProps {
  userRole?: string;
}

export const RussiaMapDetailed = ({ userRole }: RussiaMapDetailedProps) => {
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [hoveredBranch, setHoveredBranch] = useState<string | null>(null);
  const [showManagementPanel, setShowManagementPanel] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const krasnodar = branches[0];

  const handleEditClick = (branch: Branch) => {
    setEditingBranch(branch);
    setIsAddingNew(false);
  };

  const handleDeleteClick = (branch: Branch) => {
    if (confirm(`Удалить филиал в городе ${branch.city}?`)) {
      console.log('Deleting:', branch);
    }
  };

  const handleAddNewBranch = () => {
    setIsAddingNew(true);
    setEditingBranch({
      id: String(Date.now()),
      city: '',
      address: '',
      phone: '',
      email: '',
      employees: 0,
      description: '',
      images: [],
      x: 50,
      y: 50
    });
  };

  const handleSaveBranch = (branch: Branch) => {
    console.log('Saving branch:', branch);
    setEditingBranch(null);
    setIsAddingNew(false);
  };

  const handleCloseEditDialog = () => {
    setEditingBranch(null);
    setIsAddingNew(false);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">Филиальная сеть по России</h3>
          {userRole === 'admin' && (
            <Button
              onClick={() => setShowManagementPanel(!showManagementPanel)}
              variant={showManagementPanel ? 'destructive' : 'default'}
            >
              <Icon name={showManagementPanel ? 'X' : 'Settings'} size={16} className="mr-2" />
              {showManagementPanel ? 'Закрыть панель' : 'Управление филиалами'}
            </Button>
          )}
        </div>

        {userRole === 'admin' && showManagementPanel && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Панель управления</h4>
              <Button
                onClick={handleAddNewBranch}
                className="bg-green-600 hover:bg-green-700"
              >
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить филиал
              </Button>
            </div>
            <p className="text-sm text-gray-600">Кликните на карточку филиала в списке ниже для редактирования или удаления</p>
          </div>
        )}
        
        <MapSVG
          branches={branches}
          krasnodar={krasnodar}
          hoveredBranch={hoveredBranch}
          onBranchHover={setHoveredBranch}
          onBranchClick={setSelectedBranch}
        />

        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span>Головной офис (Краснодар)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-900 rounded-full"></div>
            <span>Филиалы</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-white opacity-40"></div>
            <span>Связь с центром</span>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Список филиалов ({branches.length})</h3>
        <BranchList
          branches={branches}
          userRole={userRole}
          showManagementPanel={showManagementPanel}
          hoveredBranch={hoveredBranch}
          onBranchHover={setHoveredBranch}
          onBranchClick={setSelectedBranch}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
        />
      </Card>

      <BranchModal
        branch={selectedBranch}
        isOpen={!!selectedBranch}
        onClose={() => setSelectedBranch(null)}
        userRole={userRole}
      />

      <BranchEditDialog
        branch={editingBranch}
        isOpen={!!editingBranch}
        isNew={isAddingNew}
        onClose={handleCloseEditDialog}
        onSave={handleSaveBranch}
      />
    </div>
  );
};
