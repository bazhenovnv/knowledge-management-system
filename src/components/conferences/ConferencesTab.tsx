import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { VideoConference } from '@/components/VideoConference';
import { databaseService } from '@/utils/databaseService';
import { toast } from 'sonner';

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

interface ConferencesTabProps {
  userRole: string;
  userId: number;
  userName: string;
}

export function ConferencesTab({ userRole, userId, userName }: ConferencesTabProps) {
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [activeConference, setActiveConference] = useState<{ roomId: string; title: string } | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduled_time: '',
  });

  useEffect(() => {
    loadConferences();
  }, []);

  const loadConferences = async () => {
    try {
      const data = await databaseService.getConferences();
      if (data && data.length > 0) {
        setConferences(data);
      } else {
        setConferences([]);
      }
    } catch (error) {
      console.error('Error loading conferences:', error);
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

    try {
      const roomId = `conf-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      const newConference: Conference = {
        id: Date.now(),
        title: formData.title,
        description: formData.description,
        room_id: roomId,
        status: 'scheduled',
        created_by: userId,
        creator_name: userName || 'Вы',
        scheduled_time: formData.scheduled_time || new Date().toISOString(),
        active_participants: 0,
        created_at: new Date().toISOString(),
      };

      try {
        await databaseService.createConference({
          ...formData,
          created_by: userId,
          status: 'scheduled',
        });
      } catch (apiError) {
        console.log('API error, using local data');
      }

      setConferences([newConference, ...conferences]);
      toast.success('Конференция создана');
      setIsCreating(false);
      setFormData({ title: '', description: '', scheduled_time: '' });
    } catch (error) {
      toast.error('Ошибка создания конференции');
    }
  };

  const handleJoinConference = async (conference: Conference) => {
    try {
      try {
        await databaseService.joinConference(conference.id, userId);
        
        if (conference.status === 'scheduled') {
          await databaseService.updateConference(conference.id, { status: 'active' });
        }
      } catch (apiError) {
        console.log('API error, continuing anyway');
      }

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
          await databaseService.leaveConference(conference.id, userId);
        } catch (apiError) {
          console.log('API error on leave');
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

  if (activeConference) {
    return (
      <VideoConference
        roomId={activeConference.roomId}
        userName={userName || 'Участник'}
        onLeave={handleLeaveConference}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Видеоконференция</h1>
          <p className="text-gray-600 mt-2">Присоединяйтесь к конференциям или создайте новую</p>
        </div>
        
        {(userRole === 'admin' || userRole === 'teacher') && (
          <Button 
            onClick={() => setIsCreating(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-[0.25px] border-black"
          >
            <Icon name="Plus" size={16} className="mr-2" />
            Создать конференцию
          </Button>
        )}
      </div>

      {isCreating && (
        <Card>
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
                <Icon name="X" size={16} className="mr-2" />
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Icon name="Loader2" size={32} className="animate-spin text-blue-600" />
        </div>
      ) : conferences.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Icon name="Video" size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">Нет конференций</h3>
            <p className="text-gray-600 mb-4">Создайте первую видеоконференцию</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {conferences.map((conference) => (
            <Card key={conference.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{conference.title}</CardTitle>
                    {getStatusBadge(conference.status)}
                  </div>
                  <Icon name="Video" size={24} className="text-blue-600" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {conference.description && (
                  <p className="text-sm text-gray-600">{conference.description}</p>
                )}
                
                <div className="flex items-center text-sm text-gray-500">
                  <Icon name="User" size={14} className="mr-1" />
                  <span>{conference.creator_name}</span>
                </div>

                {conference.scheduled_time && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Icon name="Clock" size={14} className="mr-1" />
                    <span>{new Date(conference.scheduled_time).toLocaleString('ru-RU')}</span>
                  </div>
                )}

                {conference.status !== 'ended' && (
                  <Button
                    className="w-full"
                    onClick={() => handleJoinConference(conference)}
                  >
                    <Icon name="Video" size={16} className="mr-2" />
                    Присоединиться
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}