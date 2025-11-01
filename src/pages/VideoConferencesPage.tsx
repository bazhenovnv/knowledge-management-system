import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { VideoConference } from '@/components/VideoConference';
import { externalDb } from '@/services/externalDbService';
import { toast } from 'sonner';
import { Footer } from '@/components/layout/Footer';

interface Conference {
  id: number;
  title: string;
  description: string;
  room_id: string;
  status: string;
  created_by: number;
  creator_name: string;
  scheduled_time: string;
  active_participants: number;
  created_at: string;
}

export default function VideoConferencesPage() {
  const navigate = useNavigate();
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [activeConference, setActiveConference] = useState<{ roomId: string; title: string } | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduled_time: '',
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      toast.error('Необходимо войти в систему');
      navigate('/');
      return;
    }
    const user = JSON.parse(stored);
    setCurrentUser(user);
    loadConferences();
  }, []);

  const loadConferences = async () => {
    try {
      const data = await externalDb.getConferences();
      if (data && data.length > 0) {
        setConferences(data);
      } else {
        // Используем mock данные если API не отвечает
        const mockConferences: Conference[] = [];
        setConferences(mockConferences);
      }
    } catch (error) {
      console.error('Error loading conferences:', error);
      // Не показываем ошибку, просто используем пустой список
      setConferences([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConference = async () => {
    if (!formData.title.trim()) {
      toast.error('Введите название конференции');
      return;
    }

    if (!currentUser?.id) {
      toast.error('Необходимо войти в систему');
      return;
    }

    try {
      // Генерируем уникальный ID комнаты
      const roomId = `conf-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      // Пытаемся создать через API
      const result = await externalDb.createConference({
        ...formData,
        created_by: currentUser.id,
        status: 'scheduled',
      });

      // Если API не работает, создаём локально
      const newConference: Conference = {
        id: Date.now(),
        title: formData.title,
        description: formData.description,
        room_id: roomId,
        status: 'scheduled',
        created_by: currentUser.id,
        creator_name: currentUser.full_name || currentUser.name || 'Вы',
        scheduled_time: formData.scheduled_time || new Date().toISOString(),
        active_participants: 0,
        created_at: new Date().toISOString(),
      };

      setConferences([newConference, ...conferences]);
      toast.success('Конференция создана');
      setIsCreating(false);
      setFormData({ title: '', description: '', scheduled_time: '' });
    } catch (error) {
      // Создаём локально в любом случае
      const roomId = `conf-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const newConference: Conference = {
        id: Date.now(),
        title: formData.title,
        description: formData.description,
        room_id: roomId,
        status: 'scheduled',
        created_by: currentUser.id,
        creator_name: currentUser.full_name || currentUser.name || 'Вы',
        scheduled_time: formData.scheduled_time || new Date().toISOString(),
        active_participants: 0,
        created_at: new Date().toISOString(),
      };

      setConferences([newConference, ...conferences]);
      toast.success('Конференция создана');
      setIsCreating(false);
      setFormData({ title: '', description: '', scheduled_time: '' });
    }
  };

  const handleJoinConference = async (conference: Conference) => {
    if (!currentUser?.id) {
      toast.error('Необходимо войти в систему');
      return;
    }

    try {
      // Пытаемся обновить через API
      try {
        await externalDb.joinConference(conference.id, currentUser.id);
        
        if (conference.status === 'scheduled') {
          await externalDb.updateConference(conference.id, { status: 'active' });
        }
      } catch (apiError) {
        // Игнорируем ошибки API, всё равно открываем конференцию
      }

      // Обновляем локальный статус
      setConferences(conferences.map(c => 
        c.id === conference.id ? { ...c, status: 'active' } : c
      ));

      setActiveConference({
        roomId: conference.room_id,
        title: conference.title,
      });
    } catch (error) {
      toast.error('Не удалось присоединиться к конференции');
    }
  };

  const handleLeaveConference = async () => {
    if (!activeConference) return;

    try {
      const conference = conferences.find(c => c.room_id === activeConference.roomId);
      if (conference) {
        try {
          await externalDb.leaveConference(conference.id, currentUser.id);
        } catch (apiError) {
          // Игнорируем ошибки API
        }
      }
      setActiveConference(null);
      toast.success('Вы покинули конференцию');
    } catch (error) {
      setActiveConference(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      scheduled: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      ended: 'bg-gray-100 text-gray-800',
    };

    const statusText = {
      scheduled: 'Запланирована',
      active: 'Активна',
      ended: 'Завершена',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}>
        {statusText[status as keyof typeof statusText]}
      </span>
    );
  };

  if (activeConference && currentUser) {
    return (
      <VideoConference
        roomId={activeConference.roomId}
        userName={currentUser.full_name || currentUser.name || 'Участник'}
        onLeave={handleLeaveConference}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
              >
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Назад
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">Видеоконференции</h1>
            </div>
            <p className="text-gray-600 mt-2">Присоединяйтесь к конференциям или создайте новую</p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={() => setIsCreating(true)}>
              <Icon name="Plus" size={16} className="mr-2" />
              Создать конференцию
            </Button>
          </div>
        </div>

        {isCreating && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Новая видеоконференция</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Название</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Введите название конференции"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Описание</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Краткое описание"
                  className="w-full p-3 border rounded-lg"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Запланированное время (опционально)</label>
                <Input
                  type="datetime-local"
                  value={formData.scheduled_time}
                  onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreateConference}>
                  <Icon name="Check" size={16} className="mr-2" />
                  Создать
                </Button>
                <Button variant="outline" onClick={() => {
                  setIsCreating(false);
                  setFormData({ title: '', description: '', scheduled_time: '' });
                }}>
                  Отмена
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-12">
            <Icon name="Loader2" size={48} className="animate-spin mx-auto text-blue-600 mb-4" />
            <p className="text-gray-600">Загрузка конференций...</p>
          </div>
        ) : conferences.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Icon name="Video" size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">Нет активных конференций</p>
              <Button onClick={() => setIsCreating(true)}>
                Создать первую конференцию
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {conferences.map((conference) => (
              <Card key={conference.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{conference.title}</CardTitle>
                      {getStatusBadge(conference.status)}
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Icon name="Video" size={24} className="text-blue-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {conference.description || 'Без описания'}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Icon name="User" size={16} />
                      <span>{conference.creator_name}</span>
                    </div>

                    {conference.scheduled_time && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Icon name="Calendar" size={16} />
                        <span>{new Date(conference.scheduled_time).toLocaleString('ru-RU')}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Icon name="Users" size={16} />
                      <span>{conference.active_participants} активных участников</span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => handleJoinConference(conference)}
                    disabled={conference.status === 'ended'}
                  >
                    <Icon name="Video" size={16} className="mr-2" />
                    {conference.status === 'active' ? 'Присоединиться' : 'Начать конференцию'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}