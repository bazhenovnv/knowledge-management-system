import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

// Импорт созданных компонентов
import AssignmentBasicInfo from './AssignmentBasicInfo';
import AssignmentEmployeeSelector from './AssignmentEmployeeSelector';
import AssignmentTestSelector from './AssignmentTestSelector';
import AssignmentMaterialSelector from './AssignmentMaterialSelector';
import { useAssignmentForm } from './useAssignmentForm';
import { AssignmentFormProps } from './assignmentFormTypes';

const AssignmentForm: React.FC<AssignmentFormProps> = ({
  isOpen,
  onClose,
  employees,
  tests,
  materials,
  currentUserRole,
  currentUserId
}) => {
  const {
    formData,
    setFormData,
    searchQuery,
    setSearchQuery,
    selectedDepartments,
    filteredEmployees,
    filteredTests,
    filteredMaterials,
    handleClose,
    toggleEmployee,
    toggleTest,
    toggleMaterial,
    handleSelectAllEmployees,
    handleSelectAllTests,
    handleSelectAllMaterials,
    toggleDepartmentFilter,
    handleSubmit
  } = useAssignmentForm({
    employees,
    tests,
    materials,
    currentUserRole,
    currentUserId,
    onClose
  });

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Icon name="ClipboardList" size={20} />
            <span>Назначить задание</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Основная информация */}
          <AssignmentBasicInfo 
            formData={formData}
            setFormData={setFormData}
          />

          <Tabs defaultValue="assignees" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="assignees" className="flex items-center space-x-2">
                <Icon name="Users" size={16} />
                <span>Сотрудники ({formData.assignees.length})</span>
              </TabsTrigger>
              <TabsTrigger value="tests" className="flex items-center space-x-2">
                <Icon name="FileText" size={16} />
                <span>Тесты ({formData.testIds.length})</span>
              </TabsTrigger>
              <TabsTrigger value="materials" className="flex items-center space-x-2">
                <Icon name="BookOpen" size={16} />
                <span>Материалы ({formData.materialIds.length})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="assignees">
              <AssignmentEmployeeSelector
                formData={formData}
                employees={employees}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedDepartments={selectedDepartments}
                toggleEmployee={toggleEmployee}
                handleSelectAllEmployees={handleSelectAllEmployees}
                toggleDepartmentFilter={toggleDepartmentFilter}
              />
            </TabsContent>

            <TabsContent value="tests">
              <AssignmentTestSelector
                formData={formData}
                tests={tests}
                toggleTest={toggleTest}
                handleSelectAllTests={handleSelectAllTests}
              />
            </TabsContent>

            <TabsContent value="materials">
              <AssignmentMaterialSelector
                formData={formData}
                materials={materials}
                toggleMaterial={toggleMaterial}
                handleSelectAllMaterials={handleSelectAllMaterials}
              />
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Отмена
            </Button>
            <Button 
              type="submit" 
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Icon name="Send" size={16} />
              <span>Назначить задание</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentForm;