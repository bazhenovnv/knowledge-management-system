import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";
import { BranchList } from "./BranchList";
import { BranchMap } from "./BranchMap";
import { BranchFormDialog } from "./BranchFormDialog";
import { BranchDeleteDialog } from "./BranchDeleteDialog";

export interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  manager: string;
  latitude: number;
  longitude: number;
  description?: string;
  workingHours?: string;
  employeeCount?: number;
  isActive: boolean;
  createdAt: Date;
}

const STORAGE_KEY = 'branches_db';

interface BranchManagerProps {
  onClose?: () => void;
}

export const BranchManager = ({ onClose }: BranchManagerProps = {}) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Branch>>({
    name: '',
    address: '',
    city: 'Краснодар',
    phone: '',
    email: '',
    manager: '',
    latitude: 45.0355,
    longitude: 38.9753,
    description: '',
    workingHours: '9:00 - 18:00',
    employeeCount: 0,
    isActive: true,
  });

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setBranches(parsed.map((b: any) => ({
        ...b,
        createdAt: new Date(b.createdAt)
      })));
    } else {
      const defaultBranches: Branch[] = [
        {
          id: '1',
          name: 'Главный офис',
          address: 'ул. Красная, 123',
          city: 'Краснодар',
          phone: '+7(938) 523-17-81',
          email: 'n.bazhenov@a-b.ru',
          manager: 'Баженов Н.',
          latitude: 45.0355,
          longitude: 38.9753,
          description: 'Центральный офис компании',
          workingHours: '9:00 - 18:00',
          employeeCount: 25,
          isActive: true,
          createdAt: new Date(),
        }
      ];
      setBranches(defaultBranches);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultBranches));
    }
  };

  const saveBranches = (newBranches: Branch[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newBranches));
    setBranches(newBranches);
  };

  const openDialog = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch);
      setFormData(branch);
    } else {
      setEditingBranch(null);
      setFormData({
        name: '',
        address: '',
        city: 'Краснодар',
        phone: '',
        email: '',
        manager: '',
        latitude: 45.0355,
        longitude: 38.9753,
        description: '',
        workingHours: '9:00 - 18:00',
        employeeCount: 0,
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address || !formData.phone) {
      toast.error('Заполните обязательные поля');
      return;
    }

    if (editingBranch) {
      const updated = branches.map(b => 
        b.id === editingBranch.id 
          ? { ...formData, id: b.id, createdAt: b.createdAt } as Branch
          : b
      );
      saveBranches(updated);
      toast.success('Филиал обновлён');
    } else {
      const newBranch: Branch = {
        ...formData as Branch,
        id: Date.now().toString(),
        createdAt: new Date(),
      };
      saveBranches([...branches, newBranch]);
      toast.success('Филиал добавлен');
    }

    setIsDialogOpen(false);
    setEditingBranch(null);
  };

  const handleDelete = () => {
    if (!deletingBranch) return;
    
    const updated = branches.filter(b => b.id !== deletingBranch.id);
    saveBranches(updated);
    
    if (selectedBranchId === deletingBranch.id) {
      setSelectedBranchId(null);
    }
    
    toast.success('Филиал удалён');
    setIsDeleteDialogOpen(false);
    setDeletingBranch(null);
  };

  const toggleBranchStatus = (id: string) => {
    const updated = branches.map(b => 
      b.id === id ? { ...b, isActive: !b.isActive } : b
    );
    saveBranches(updated);
    toast.success('Статус филиала изменён');
  };

  const handleMapClick = (lat: number, lng: number) => {
    setFormData({ ...formData, latitude: lat, longitude: lng });
    toast.info(`Координаты обновлены: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
  };

  const openDeleteDialog = (branch: Branch) => {
    setDeletingBranch(branch);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Назад
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Филиалы компании</h2>
            <p className="text-gray-600">Управление филиалами и их расположением на карте</p>
          </div>
        </div>
        <Button onClick={() => openDialog()}>
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить филиал
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BranchList
          branches={branches}
          selectedBranchId={selectedBranchId}
          onSelectBranch={setSelectedBranchId}
          onEditBranch={openDialog}
          onDeleteBranch={openDeleteDialog}
          onToggleStatus={toggleBranchStatus}
        />

        <BranchMap
          branches={branches}
          selectedBranchId={selectedBranchId}
          onMapClick={isDialogOpen ? handleMapClick : undefined}
        />
      </div>

      <BranchFormDialog
        isOpen={isDialogOpen}
        editingBranch={editingBranch}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
        onClose={() => setIsDialogOpen(false)}
      />

      <BranchDeleteDialog
        isOpen={isDeleteDialogOpen}
        branch={deletingBranch}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
};
