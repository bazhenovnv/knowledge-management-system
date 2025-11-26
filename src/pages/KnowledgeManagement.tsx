import { useState, useEffect } from 'react';
import { knowledgeApi } from '@/lib/knowledgeApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface Document {
  id: number;
  title: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
}

interface Stats {
  tables: Array<{
    table_name: string;
    column_count: number;
    record_count: number;
  }>;
  totalTables: number;
  totalRecords: number;
}

export default function KnowledgeManagement() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [healthStatus, setHealthStatus] = useState<string>('checking');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
  });

  const [editMode, setEditMode] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    setInitialLoading(true);
    const healthResult = await checkHealth();
    await Promise.all([
      loadStats(),
      loadDocuments()
    ]);
    setInitialLoading(false);
    
    if (healthResult === 'ok') {
      toast({
        title: 'Подключено',
        description: 'API успешно доступен на ab-education.ru',
      });
    } else if (healthResult === 'error') {
      toast({
        title: 'Ошибка подключения',
        description: 'Не удалось подключиться к API. Проверьте статус сервера.',
        variant: 'destructive',
      });
    }
  };

  const checkHealth = async () => {
    try {
      setHealthStatus('checking');
      const result = await knowledgeApi.healthCheck();
      const status = result.status || 'unknown';
      setHealthStatus(status);
      return status;
    } catch (error) {
      setHealthStatus('error');
      console.error('Health check failed:', error);
      return 'error';
    }
  };

  const loadStats = async () => {
    try {
      const result = await knowledgeApi.stats();
      setStats(result as Stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const result = await knowledgeApi.list('documents');
      setDocuments(result.rows || []);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить документы',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editMode) {
        await knowledgeApi.update('documents', editMode, formData);
        toast({
          title: 'Успех',
          description: 'Документ обновлён',
        });
      } else {
        await knowledgeApi.create('documents', formData);
        toast({
          title: 'Успех',
          description: 'Документ создан',
        });
      }

      setFormData({ title: '', content: '', category: '' });
      setEditMode(null);
      setIsDialogOpen(false);
      loadDocuments();
      loadStats();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить документ',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (doc: Document) => {
    setFormData({
      title: doc.title,
      content: doc.content,
      category: doc.category,
    });
    setEditMode(doc.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить документ?')) return;

    setLoading(true);
    try {
      await knowledgeApi.delete('documents', id);
      toast({
        title: 'Успех',
        description: 'Документ удалён',
      });
      loadDocuments();
      loadStats();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить документ',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', category: '' });
    setEditMode(null);
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="w-96 p-8">
          <div className="flex flex-col items-center space-y-4">
            <Icon name="Loader2" size={48} className="animate-spin text-blue-500" />
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">Подключение к API</h2>
              <p className="text-sm text-gray-600">Проверяем соединение с ab-education.ru...</p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">База знаний</h1>
            <p className="text-gray-600 mt-2">Управление документами и знаниями компании</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                loadDocuments();
                loadStats();
                checkHealth();
              }}
              disabled={loading}
            >
              <Icon name="RefreshCw" size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
            <Badge variant={healthStatus === 'ok' ? 'default' : healthStatus === 'checking' ? 'secondary' : 'destructive'}>
              <Icon name={healthStatus === 'checking' ? 'Loader2' : 'Activity'} size={14} className={`mr-1 ${healthStatus === 'checking' ? 'animate-spin' : ''}`} />
              API: {healthStatus === 'checking' ? 'проверка...' : healthStatus}
            </Badge>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} size="lg">
                  <Icon name="Plus" size={18} className="mr-2" />
                  Создать документ
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editMode ? 'Редактировать документ' : 'Новый документ'}
                  </DialogTitle>
                  <DialogDescription>
                    Заполните информацию о документе
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Название</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Введите название документа"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Категория</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      placeholder="Например: Инструкции, Политики, FAQ"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Содержание</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      placeholder="Введите содержание документа..."
                      rows={8}
                      required
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={loading}
                    >
                      Отмена
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading && <Icon name="Loader2" size={16} className="mr-2 animate-spin" />}
                      {loading ? 'Сохранение...' : editMode ? 'Обновить' : 'Создать'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="documents" className="space-y-4">
          <TabsList>
            <TabsTrigger value="documents">
              <Icon name="FileText" size={16} className="mr-2" />
              Документы
            </TabsTrigger>
            <TabsTrigger value="stats">
              <Icon name="BarChart3" size={16} className="mr-2" />
              Статистика
            </TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Список документов</CardTitle>
                <CardDescription>
                  Всего документов: {documents.length}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Icon name="Loader2" size={32} className="animate-spin text-gray-400" />
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-12">
                    <Icon name="FileX" size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Документов пока нет</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Создайте первый документ, нажав кнопку выше
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Название</TableHead>
                        <TableHead>Категория</TableHead>
                        <TableHead>Создан</TableHead>
                        <TableHead className="text-right">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">{doc.title}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{doc.category}</Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(doc.created_at).toLocaleDateString('ru-RU')}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(doc)}
                              disabled={loading}
                            >
                              <Icon name="Edit" size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(doc.id)}
                              disabled={loading}
                            >
                              <Icon name="Trash2" size={14} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            {stats && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Всего таблиц
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{stats.totalTables}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Всего записей
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{stats.totalRecords}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Средний размер
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {stats.totalTables > 0
                          ? Math.round(stats.totalRecords / stats.totalTables)
                          : 0}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Структура базы данных</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Таблица</TableHead>
                          <TableHead className="text-right">Колонок</TableHead>
                          <TableHead className="text-right">Записей</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stats.tables.map((table) => (
                          <TableRow key={table.table_name}>
                            <TableCell className="font-medium">
                              {table.table_name}
                            </TableCell>
                            <TableCell className="text-right">
                              {table.column_count}
                            </TableCell>
                            <TableCell className="text-right">
                              {table.record_count}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}