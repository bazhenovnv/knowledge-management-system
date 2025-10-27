import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface SupportMessage {
  id: number;
  employee_id: number;
  message: string;
  is_admin_response: boolean;
  is_read: boolean;
  created_at: string;
  employee_name?: string;
  email?: string;
}

interface SupportChatProps {
  employeeId: number;
  isAdmin: boolean;
  compact?: boolean;
}

const SupportChat = ({ employeeId, isAdmin, compact = false }: SupportChatProps) => {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const BACKEND_URL = 'https://functions.poehali.dev/47d7f4cf-0b15-41dd-a1f4-28bec9d7c957';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const params = new URLSearchParams({
        action: 'get_support_messages',
        ...(isAdmin ? {} : { employee_id: employeeId.toString() })
      });

      const response = await fetch(`${BACKEND_URL}?${params}`);
      const data = await response.json();

      if (data.messages) {
        setMessages(data.messages);
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}?action=create_support_message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: employeeId,
          message: newMessage.trim(),
          is_admin_response: isAdmin
        })
      });

      const data = await response.json();

      if (data.success) {
        setNewMessage('');
        await loadMessages();
        toast.success('Сообщение отправлено');
      } else {
        toast.error(data.error || 'Ошибка отправки');
      }
    } catch (error) {
      toast.error('Ошибка отправки сообщения');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    if (isAdmin) return;

    try {
      await fetch(`${BACKEND_URL}?action=mark_support_read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_id: employeeId })
      });
    } catch (error) {
      console.error('Ошибка пометки прочитанных:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMessages();
      markAsRead();
    }
  }, [isOpen, employeeId, isAdmin]);

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant={compact ? "ghost" : "default"}
        size={compact ? "icon" : "default"}
        className={
          compact
            ? "relative"
            : "fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 z-50"
        }
        title="Техническая поддержка"
      >
        <Icon name="Headphones" size={compact ? 20 : 24} />
      </Button>
    );
  }

  return (
    <Card className={compact ? "fixed top-16 right-4 w-96 h-[32rem] shadow-2xl z-50 flex flex-col" : "fixed bottom-6 right-6 w-96 h-[32rem] shadow-2xl z-50 flex flex-col"}>
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Headphones" size={20} />
            <CardTitle className="text-lg">Техническая поддержка</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20 h-8 w-8 p-0"
          >
            <Icon name="X" size={18} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 mt-8">
              <Icon name="MessageSquare" size={48} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Нет сообщений</p>
              <p className="text-xs mt-1">Напишите нам, если нужна помощь</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.is_admin_response ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg px-4 py-2 ${
                    msg.is_admin_response
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  }`}
                >
                  {isAdmin && !msg.is_admin_response && (
                    <div className="text-xs opacity-70 mb-1">
                      {msg.employee_name || msg.email}
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  <div className={`text-xs mt-1 ${msg.is_admin_response ? 'text-gray-500' : 'text-white/70'}`}>
                    {new Date(msg.created_at).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Напишите сообщение..."
              disabled={loading}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={loading || !newMessage.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Icon name="Send" size={18} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupportChat;