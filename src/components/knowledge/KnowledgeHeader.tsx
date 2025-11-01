import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";

interface KnowledgeHeaderProps {
  selectedSubsection: string | null;
  subsectionSearchQuery: string;
  setSubsectionSearchQuery: (query: string) => void;
  getSubsectionResultsCount: () => number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  userRole: string;
  onCreateMaterial: () => void;
  onShowBranchManager: () => void;
}

export const KnowledgeHeader = ({
  selectedSubsection,
  subsectionSearchQuery,
  setSubsectionSearchQuery,
  getSubsectionResultsCount,
  searchQuery,
  setSearchQuery,
  userRole,
  onCreateMaterial,
  onShowBranchManager,
}: KnowledgeHeaderProps) => {
  const resultsCount = getSubsectionResultsCount();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h2 className="text-2xl font-bold">База знаний</h2>
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        {selectedSubsection && (
          <div className="relative">
            <Input
              type="text"
              placeholder="Поиск в разделе..."
              value={subsectionSearchQuery}
              onChange={(e) => setSubsectionSearchQuery(e.target.value)}
              className="w-full sm:w-64 pr-20"
            />
            {subsectionSearchQuery && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{resultsCount}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSubsectionSearchQuery('')}
                  className="h-6 w-6 p-0"
                >
                  <Icon name="X" size={14} />
                </Button>
              </div>
            )}
          </div>
        )}
        {!selectedSubsection && (
          <div className="relative">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Поиск материалов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
        )}
        {userRole === 'admin' && !selectedSubsection && (
          <>
            <Button onClick={onCreateMaterial} className="whitespace-nowrap">
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить материал
            </Button>
            <Button onClick={onShowBranchManager} variant="outline" className="whitespace-nowrap">
              <Icon name="GitBranch" size={16} className="mr-2" />
              Управление филиалами
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
