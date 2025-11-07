import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Message } from './types';

interface ChatMessageProps {
  message: Message;
  showEmojiPicker: string | null;
  editingMessageId: string | null;
  editingText: string;
  onShowEmojiPicker: (id: string | null) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  onStartEdit: (messageId: string, text: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: (messageId: string) => void;
  onEditingTextChange: (text: string) => void;
  formatFileSize: (bytes: number) => string;
}

export const ChatMessage = ({
  message,
  showEmojiPicker,
  editingMessageId,
  editingText,
  onShowEmojiPicker,
  onAddReaction,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onEditingTextChange,
  formatFileSize,
}: ChatMessageProps) => {
  const isMyMessage = message.sender === 'me';
  const emojis = ['👍', '❤️', '😂', '😮', '😢', '🎉'];

  if (message.isDeleted) {
    return (
      <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} mb-2`}>
        <div className={`px-3 py-2 rounded-lg max-w-xs italic text-gray-400 ${
          isMyMessage ? 'bg-blue-100' : 'bg-gray-100'
        }`}>
          Сообщение удалено
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className="max-w-xs">
        {editingMessageId === message.id ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editingText}
              onChange={(e) => onEditingTextChange(e.target.value)}
              className="px-3 py-2 border rounded-lg flex-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSaveEdit();
                if (e.key === 'Escape') onCancelEdit();
              }}
            />
            <Button size="sm" onClick={onSaveEdit}>
              <Icon name="Check" size={16} />
            </Button>
            <Button size="sm" variant="ghost" onClick={onCancelEdit}>
              <Icon name="X" size={16} />
            </Button>
          </div>
        ) : (
          <>
            <div className={`px-3 py-2 rounded-lg relative group ${
              isMyMessage ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
            }`}>
              {message.file ? (
                <a
                  href={message.file.url}
                  download={message.file.name}
                  className="flex items-center gap-2 hover:underline"
                >
                  <Icon name="Paperclip" size={16} />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{message.file.name}</span>
                    <span className="text-xs opacity-75">
                      {formatFileSize(message.file.size)}
                    </span>
                  </div>
                </a>
              ) : (
                <>
                  <span>{message.text}</span>
                  {message.isEdited && (
                    <span className="text-xs opacity-75 ml-2">(изменено)</span>
                  )}
                </>
              )}
              
              {isMyMessage && message.text && (
                <div className="absolute top-0 right-0 translate-x-full ml-2 hidden group-hover:flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onStartEdit(message.id, message.text || '')}
                    className="h-6 w-6 p-0"
                  >
                    <Icon name="Edit" size={12} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(message.id)}
                    className="h-6 w-6 p-0 text-red-500"
                  >
                    <Icon name="Trash2" size={12} />
                  </Button>
                </div>
              )}
            </div>

            {message.reactions && message.reactions.length > 0 && (
              <div className="flex gap-1 mt-1">
                {message.reactions.map((reaction, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-white border rounded px-1"
                  >
                    {reaction.emoji}
                  </span>
                ))}
              </div>
            )}

            <div className="relative">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onShowEmojiPicker(showEmojiPicker === message.id ? null : message.id)}
                className="h-6 text-xs mt-1"
              >
                <Icon name="Smile" size={14} className="mr-1" />
                Реакция
              </Button>

              {showEmojiPicker === message.id && (
                <div className="absolute bottom-full mb-2 bg-white border rounded-lg shadow-lg p-2 flex gap-1 z-10">
                  {emojis.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => onAddReaction(message.id, emoji)}
                      className="text-2xl hover:scale-110 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <div className="text-xs text-gray-500 mt-1">
          {message.timestamp.toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
};
