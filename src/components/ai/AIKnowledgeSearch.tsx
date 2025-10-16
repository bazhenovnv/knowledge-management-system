import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { databaseService } from '@/utils/databaseService';

interface Material {
  title: string;
  description: string;
  content: string;
  source_url: string;
  tags: string[];
}

interface AIKnowledgeSearchProps {
  onMaterialAdd?: () => void;
}

const AIKnowledgeSearch = ({ onMaterialAdd }: AIKnowledgeSearchProps) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const BACKEND_URL = 'https://functions.poehali.dev/5ce5a766-35aa-4d9a-9325-babec287d558';

  const searchMaterials = async () => {
    if (!query.trim()) {
      toast.error('Введите поисковый запрос');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}?action=ai_search_knowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() })
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      if (data.materials && data.materials.length > 0) {
        setMaterials(data.materials);
        toast.success(`Найдено ${data.materials.length} материалов`);
      } else {
        toast.warning('Материалы не найдены');
        setMaterials([]);
      }
    } catch (error) {
      toast.error('Ошибка поиска материалов');
      console.error('AI Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToKnowledge = async (material: Material) => {
    try {
      await databaseService.createKnowledgeItem({
        title: material.title,
        content: material.content,
        category: material.tags[0] || 'Общее',
        tags: material.tags.join(', '),
        author: 'AI Generated',
        difficulty: 'intermediate'
      });

      toast.success('Материал добавлен в базу знаний');
      onMaterialAdd?.();
    } catch (error) {
      toast.error('Ошибка добавления материала');
      console.error('Add material error:', error);
    }
  };

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="flex items-center gap-3">
          <Icon name="Sparkles" size={24} />
          <CardTitle>AI Поиск материалов</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchMaterials()}
              placeholder="Например: Python для начинающих, Основы маркетинга..."
              className="flex-1"
              disabled={loading}
            />
            <Button
              onClick={searchMaterials}
              disabled={loading || !query.trim()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {loading ? (
                <>
                  <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                  Поиск...
                </>
              ) : (
                <>
                  <Icon name="Search" size={18} className="mr-2" />
                  Найти
                </>
              )}
            </Button>
          </div>

          {materials.length > 0 && (
            <div className="space-y-3 mt-6">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Icon name="BookOpen" size={16} />
                Найдено материалов: {materials.length}
              </h3>
              
              {materials.map((material, index) => (
                <Card key={index} className="border-2 hover:border-purple-200 transition-colors">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-1">{material.title}</h4>
                          <p className="text-sm text-gray-600">{material.description}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addToKnowledge(material)}
                          className="ml-3 bg-green-600 hover:bg-green-700"
                        >
                          <Icon name="Plus" size={16} className="mr-1" />
                          Добавить
                        </Button>
                      </div>

                      {material.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {material.tags.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpanded(expanded === index ? null : index)}
                        className="text-xs text-purple-600 hover:text-purple-700"
                      >
                        <Icon name={expanded === index ? "ChevronUp" : "ChevronDown"} size={14} className="mr-1" />
                        {expanded === index ? 'Скрыть' : 'Показать'} содержание
                      </Button>

                      {expanded === index && (
                        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap max-h-96 overflow-y-auto">
                          {material.content}
                        </div>
                      )}

                      {material.source_url !== 'AI Generated' && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Icon name="Link" size={12} />
                          <a
                            href={material.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-purple-600 underline"
                          >
                            Источник
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && materials.length === 0 && query && (
            <div className="text-center py-8 text-gray-400">
              <Icon name="Search" size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Введите запрос и нажмите "Найти"</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIKnowledgeSearch;
