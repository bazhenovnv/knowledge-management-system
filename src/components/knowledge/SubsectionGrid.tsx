import { Card, CardContent } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

interface SubsectionGridProps {
  onSelectSubsection: (subsection: string) => void;
}

export const SubsectionGrid = ({ onSelectSubsection }: SubsectionGridProps) => {
  const subsections = [
    { name: "О компании", icon: "Building2", color: "blue" },
    { name: "Регионы присутствия", icon: "Map", color: "red" },
    { name: "Инструкции", icon: "FileText", color: "indigo" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {subsections.map((subsection) => (
        <Card
          key={subsection.name}
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
          onClick={() => onSelectSubsection(subsection.name)}
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-${subsection.color}-100 dark:bg-${subsection.color}-950`}>
              <Icon name={subsection.icon} size={24} className={`text-${subsection.color}-600 dark:text-${subsection.color}-400`} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{subsection.name}</h3>
              <p className="text-sm text-muted-foreground">Нажмите для просмотра</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};