import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";

export interface TextSection {
  id: string;
  title: string;
  content: string;
  description: string;
}

interface TextSectionsTabProps {
  textSections: TextSection[];
  setTextSections: (sections: TextSection[]) => void;
  activeSection: string;
  setActiveSection: (id: string) => void;
}

export function TextSectionsTab({
  textSections,
  setTextSections,
  activeSection,
  setActiveSection
}: TextSectionsTabProps) {
  const { toast } = useToast();

  const validateSection = (section: TextSection): string | null => {
    if (!section.title.trim()) {
      return "Название раздела не может быть пустым";
    }
    if (section.title.length < 3) {
      return "Название должно содержать минимум 3 символа";
    }
    if (section.title.length > 100) {
      return "Название не должно превышать 100 символов";
    }
    if (!section.description.trim()) {
      return "Описание раздела не может быть пустым";
    }
    if (!section.content.trim()) {
      return "Содержание раздела не может быть пустым";
    }
    if (section.content.length > 5000) {
      return "Содержание не должно превышать 5000 символов";
    }
    return null;
  };

  const saveTextSections = () => {
    for (const section of textSections) {
      const error = validateSection(section);
      if (error) {
        toast({
          title: "Ошибка валидации",
          description: `${section.title}: ${error}`,
          variant: "destructive"
        });
        return;
      }
    }

    localStorage.setItem("adminTextSections", JSON.stringify(textSections));
    toast({
      title: "Сохранено",
      description: "Тексты успешно обновлены",
    });
  };

  const updateTextSection = (id: string, field: keyof TextSection, value: string) => {
    setTextSections(
      textSections.map(section =>
        section.id === id ? { ...section, [field]: value } : section
      )
    );
  };

  const addNewSection = () => {
    const newSection: TextSection = {
      id: `custom_${Date.now()}`,
      title: "Новый раздел",
      content: "",
      description: "Описание нового раздела"
    };
    setTextSections([...textSections, newSection]);
    setActiveSection(newSection.id);
  };

  const deleteSection = (id: string) => {
    if (textSections.length <= 1) {
      toast({
        title: "Ошибка",
        description: "Нельзя удалить последний раздел",
        variant: "destructive"
      });
      return;
    }
    setTextSections(textSections.filter(s => s.id !== id));
    setActiveSection(textSections[0]?.id || "");
  };

  const currentSection = textSections.find(s => s.id === activeSection);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Редактирование текстов</h2>
        <Button onClick={addNewSection} size="sm">
          <Icon name="Plus" className="mr-2" size={16} />
          Добавить раздел
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Разделы</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {textSections.map(section => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setActiveSection(section.id)}
              >
                <Icon name="FileText" className="mr-2" size={16} />
                {section.title}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Редактировать раздел</CardTitle>
            <CardDescription>
              {currentSection?.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentSection && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="section-title">Название раздела</Label>
                  <Input
                    id="section-title"
                    value={currentSection.title}
                    onChange={(e) => updateTextSection(currentSection.id, "title", e.target.value)}
                    placeholder="Название"
                    maxLength={100}
                    className={!currentSection.title.trim() || currentSection.title.length < 3 ? "border-red-300" : ""}
                  />
                  <p className="text-xs text-gray-500">
                    {currentSection.title.length}/100 символов (минимум 3)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="section-description">Описание</Label>
                  <Input
                    id="section-description"
                    value={currentSection.description}
                    onChange={(e) => updateTextSection(currentSection.id, "description", e.target.value)}
                    placeholder="Краткое описание"
                    className={!currentSection.description.trim() ? "border-red-300" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="section-content">Содержание</Label>
                  <Textarea
                    id="section-content"
                    value={currentSection.content}
                    onChange={(e) => updateTextSection(currentSection.id, "content", e.target.value)}
                    placeholder="Текст раздела"
                    rows={8}
                    maxLength={5000}
                    className={`font-mono text-sm ${!currentSection.content.trim() ? "border-red-300" : ""}`}
                  />
                  <p className="text-xs text-gray-500">
                    {currentSection.content.length}/5000 символов
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={saveTextSections} className="flex-1">
                    <Icon name="Save" className="mr-2" size={16} />
                    Сохранить изменения
                  </Button>
                  <Button
                    onClick={() => deleteSection(currentSection.id)}
                    variant="destructive"
                  >
                    <Icon name="Trash2" className="mr-2" size={16} />
                    Удалить раздел
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}