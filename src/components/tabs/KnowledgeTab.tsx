import { useEffect } from "react";
import { KnowledgeTabProps } from "@/components/knowledge/types";
import { useImageHandlers } from "@/components/knowledge/useImageHandlers";
import { ImagePreviewModal } from "@/components/knowledge/ImagePreviewModal";
import { MaterialViewModal } from "@/components/knowledge/MaterialViewModal";
import { MaterialFormModal } from "@/components/knowledge/MaterialFormModal";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { BranchManager } from "@/components/branches/BranchManager";
import { KnowledgeHeader } from "@/components/knowledge/KnowledgeHeader";
import { CategoryFilter } from "@/components/knowledge/CategoryFilter";
import { DepartmentFilter } from "@/components/knowledge/DepartmentFilter";
import { SubsectionGrid } from "@/components/knowledge/SubsectionGrid";
import { MaterialsList } from "@/components/knowledge/MaterialsList";
import { SubsectionContent } from "@/components/knowledge/SubsectionContent";
import { InstructionFormModal } from "@/components/knowledge/InstructionFormModal";
import { CategoryManagementModal } from "@/components/knowledge/CategoryManagementModal";
import { useDepartments } from "@/hooks/useDepartments";
import { useKnowledgeState } from "@/components/knowledge/hooks/useKnowledgeState";
import { useKnowledgeHandlers } from "@/components/knowledge/hooks/useKnowledgeHandlers";

export const KnowledgeTab = ({
  searchQuery,
  setSearchQuery,
  userRole,
  currentUserId,
  onBackButtonChange,
}: KnowledgeTabProps) => {
  const departments = useDepartments();
  const state = useKnowledgeState();
  
  const handlers = useKnowledgeHandlers({
    setFormData: state.setFormData,
    setSelectedDepartments: state.setSelectedDepartments,
    setCoverImagePreview: state.setCoverImagePreview,
    setIsCreating: state.setIsCreating,
    setEditingMaterial: state.setEditingMaterial,
    setUploadingCount: state.setUploadingCount,
    setInstructionForm: state.setInstructionForm,
    setEditingInstruction: state.setEditingInstruction,
    setIsCreatingInstruction: state.setIsCreatingInstruction,
    setCategoryForm: state.setCategoryForm,
    setEditingCategory: state.setEditingCategory,
    setDeletingCategory: state.setDeletingCategory,
    setTransferTargetCategory: state.setTransferTargetCategory,
    instructionCategories: state.instructionCategories,
    editingMaterial: state.editingMaterial,
    editingInstruction: state.editingInstruction,
    formData: state.formData,
    selectedDepartments: state.selectedDepartments,
    currentUserId,
    loadMaterials: state.loadMaterials,
    loadInstructions: state.loadInstructions,
    loadInstructionCategories: state.loadInstructionCategories,
    editingCategory: state.editingCategory,
    categoryForm: state.categoryForm,
    deletingCategory: state.deletingCategory,
    transferTargetCategory: state.transferTargetCategory,
  });

  const imageHandlers = useImageHandlers();
  const { scrollRef, showIndicator } = useScrollPosition('knowledgeTab', state.materials.length);
  
  const highlightText = (text: string) => {
    if (!state.subsectionSearchQuery) return text;
    const regex = new RegExp(`(${state.subsectionSearchQuery})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  };
  
  const containsSearchQuery = (text: string) => {
    if (!state.subsectionSearchQuery) return true;
    return text.toLowerCase().includes(state.subsectionSearchQuery.toLowerCase());
  };
  
  const getSubsectionResultsCount = () => {
    if (!state.subsectionSearchQuery || !state.selectedSubsection) return 0;
    
    if (state.selectedSubsection === "Инструкции") {
      return state.instructions.filter(instruction => {
        const query = state.subsectionSearchQuery.toLowerCase();
        return instruction.title.toLowerCase().includes(query) ||
               instruction.description.toLowerCase().includes(query) ||
               instruction.steps.some(step => step.toLowerCase().includes(query));
      }).length;
    }
    
    return 0;
  };

  useEffect(() => {
    state.loadMaterials();
    state.loadSubsectionContent();
    state.loadInstructions();
    state.loadInstructionCategories();
  }, []);

  useEffect(() => {
    if (state.selectedSubsection) {
      localStorage.setItem('knowledgeSubsection', state.selectedSubsection);
    } else {
      localStorage.removeItem('knowledgeSubsection');
    }
    state.setSubsectionSearchQuery("");
    
    if (onBackButtonChange) {
      if (state.selectedSubsection && !state.isEditingSubsection) {
        onBackButtonChange(true, () => {
          if (state.previousSubsection) {
            state.setSelectedSubsection(state.previousSubsection);
            state.setPreviousSubsection(null);
          } else {
            state.setSelectedSubsection(null);
          }
          state.setIsEditingSubsection(false);
        });
      } else {
        onBackButtonChange(false);
      }
    }
  }, [state.selectedSubsection, state.isEditingSubsection, state.previousSubsection, onBackButtonChange]);

  useEffect(() => {
    const handleResetSubsection = () => {
      state.setSelectedSubsection(null);
      state.setIsEditingSubsection(false);
    };

    window.addEventListener('resetSubsection', handleResetSubsection);

    return () => {
      window.removeEventListener('resetSubsection', handleResetSubsection);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!imageHandlers.previewImage) return;
      
      if (e.key === 'Escape') {
        imageHandlers.closeImagePreview();
      } else if (e.key === 'ArrowLeft') {
        imageHandlers.navigatePrevious();
      } else if (e.key === 'ArrowRight') {
        imageHandlers.navigateNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [imageHandlers]);

  const filteredMaterials = state.materials.filter(material => {
    const matchesCategory = state.selectedCategory === 'all' || material.category === state.selectedCategory;
    const matchesSearch = searchQuery === '' || 
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (material.tags && material.tags.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDepartment = state.selectedDepartmentFilter.length === 0 || 
      (material.departments && material.departments.some(dept => state.selectedDepartmentFilter.includes(dept)));
    return matchesCategory && matchesSearch && matchesDepartment;
  });

  const categories = ['all', ...Array.from(new Set(state.materials.map(m => m.category).filter(Boolean)))];

  return (
    <div ref={scrollRef} className="space-y-6">
      <KnowledgeHeader
        selectedSubsection={state.selectedSubsection}
        subsectionSearchQuery={state.subsectionSearchQuery}
        setSubsectionSearchQuery={state.setSubsectionSearchQuery}
        getSubsectionResultsCount={getSubsectionResultsCount}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        userRole={userRole}
        onCreateMaterial={handlers.handleCreateMaterial}
        onShowBranchManager={() => state.setShowBranchManager(true)}
      />

      {!state.selectedSubsection && (
        <>
          <SubsectionGrid onSelectSubsection={state.setSelectedSubsection} />
          
          <CategoryFilter
            selectedCategory={state.selectedCategory}
            setSelectedCategory={state.setSelectedCategory}
            categories={categories}
          />

          <DepartmentFilter
            selectedDepartmentFilter={state.selectedDepartmentFilter}
            setSelectedDepartmentFilter={state.setSelectedDepartmentFilter}
            departments={departments}
          />

          <MaterialsList
            materials={filteredMaterials}
            loading={state.loading}
            userRole={userRole}
            onViewMaterial={state.setViewingMaterial}
            onEditMaterial={handlers.handleEditMaterial}
            onDeleteMaterial={handlers.handleDeleteMaterial}
          />
        </>
      )}

      {state.selectedSubsection && (
        <SubsectionContent
          selectedSubsection={state.selectedSubsection}
          subsectionContent={state.subsectionContent}
          editableTexts={state.editableTexts}
          isEditingSubsection={state.isEditingSubsection}
          userRole={userRole}
          subsectionSearchQuery={state.subsectionSearchQuery}
          instructions={state.instructions}
          selectedInstructionCategory={state.selectedInstructionCategory}
          instructionCategories={state.instructionCategories}
          onSetPreviousSubsection={state.setPreviousSubsection}
          onSelectSubsection={state.setSelectedSubsection}
          onSetIsEditingSubsection={state.setIsEditingSubsection}
          onSaveSubsectionContent={state.saveSubsectionContent}
          onSelectInstructionCategory={state.setSelectedInstructionCategory}
          onEditInstruction={handlers.handleEditInstruction}
          onDeleteInstruction={handlers.handleDeleteInstruction}
          onCreateInstruction={handlers.handleCreateInstruction}
          onManageCategories={() => state.setIsManagingCategories(true)}
          containsSearchQuery={containsSearchQuery}
          highlightText={highlightText}
        />
      )}

      <ImagePreviewModal
        isOpen={!!imageHandlers.previewImage}
        imageUrl={imageHandlers.previewImage}
        onClose={imageHandlers.closeImagePreview}
        onPrevious={imageHandlers.navigatePrevious}
        onNext={imageHandlers.navigateNext}
        currentIndex={imageHandlers.currentImageIndex}
        totalImages={imageHandlers.totalImages}
      />

      <MaterialViewModal
        isOpen={!!state.viewingMaterial}
        material={state.viewingMaterial}
        onClose={() => state.setViewingMaterial(null)}
        onImageClick={imageHandlers.openImagePreview}
      />

      <MaterialFormModal
        isOpen={state.isCreating || !!state.editingMaterial}
        isEditing={!!state.editingMaterial}
        formData={state.formData}
        selectedDepartments={state.selectedDepartments}
        coverImagePreview={state.coverImagePreview}
        uploadingCount={state.uploadingCount}
        departments={departments}
        onClose={handlers.handleCloseModal}
        onFormDataChange={state.setFormData}
        onSelectedDepartmentsChange={state.setSelectedDepartments}
        onUploadCoverImage={handlers.handleUploadCoverImage}
        onUploadAttachment={handlers.handleUploadAttachment}
        onRemoveAttachment={handlers.handleRemoveAttachment}
        onSave={handlers.handleSaveMaterial}
      />

      <InstructionFormModal
        isOpen={state.isCreatingInstruction}
        isEditing={!!state.editingInstruction}
        form={state.instructionForm}
        categories={state.instructionCategories}
        onClose={() => {
          state.setIsCreatingInstruction(false);
          state.setEditingInstruction(null);
        }}
        onFormChange={state.setInstructionForm}
        onSubmit={handlers.handleSaveInstruction}
        onUploadImage={handlers.handleUploadInstructionImage}
      />

      <CategoryManagementModal
        isOpen={state.isManagingCategories}
        categories={state.instructionCategories}
        categoryForm={state.categoryForm}
        editingCategory={state.editingCategory}
        deletingCategory={state.deletingCategory}
        transferTargetCategory={state.transferTargetCategory}
        onClose={() => state.setIsManagingCategories(false)}
        onCategoryFormChange={state.setCategoryForm}
        onCreateCategory={handlers.handleCreateCategory}
        onStartEditCategory={handlers.handleStartEditCategory}
        onUpdateCategory={handlers.handleUpdateCategory}
        onCancelEditCategory={handlers.handleCancelEditCategory}
        onStartDeleteCategory={handlers.handleStartDeleteCategory}
        onConfirmDeleteCategory={handlers.handleConfirmDeleteCategory}
        onCancelDeleteCategory={handlers.handleCancelDeleteCategory}
        onTransferTargetChange={state.setTransferTargetCategory}
      />

      {state.showBranchManager && (
        <BranchManager onClose={() => state.setShowBranchManager(false)} />
      )}
    </div>
  );
};
