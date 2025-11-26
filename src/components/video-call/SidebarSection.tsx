import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { ParticipantsList } from './ParticipantsList';

interface SidebarSectionProps {
  state: any;
  logic: any;
}

export function SidebarSection({ state, logic }: SidebarSectionProps) {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="font-semibold mb-3 text-gray-800">Мой ID</h3>
        <div className="bg-gray-100 p-3 rounded-lg mb-3">
          <code className="text-sm break-all">{state.myPeerId || 'Загрузка...'}</code>
        </div>
        <Button onClick={logic.copyRoomLink} className="w-full" disabled={!state.myPeerId}>
          <Icon name="Copy" size={16} className="mr-2" />
          Скопировать ссылку
        </Button>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-3 text-gray-800">Имя</h3>
        <div className="flex gap-2">
          {state.isEditingName ? (
            <Input
              value={state.tempName}
              onChange={(e) => state.setTempName(e.target.value)}
              placeholder="Введите имя"
              className="flex-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') logic.handleNameEdit();
                if (e.key === 'Escape') {
                  state.setIsEditingName(false);
                  state.setTempName('');
                }
              }}
            />
          ) : (
            <div className="flex-1 bg-gray-100 p-2 rounded-lg">
              {state.myName || 'Не указано'}
            </div>
          )}
          <Button onClick={logic.handleNameEdit} variant="outline">
            <Icon name={state.isEditingName ? "Check" : "Edit"} size={16} />
          </Button>
        </div>
      </Card>

      {!state.isConnected && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3 text-gray-800">Подключиться</h3>
          <Input
            value={state.remotePeerId}
            onChange={(e) => state.setRemotePeerId(e.target.value)}
            placeholder="ID собеседника"
            className="mb-3"
          />
          <Button onClick={logic.connectToPeer} className="w-full" disabled={!state.remotePeerId}>
            <Icon name="Link" size={16} className="mr-2" />
            Подключиться
          </Button>
        </Card>
      )}

      {state.isConnected && !state.isCalling && (
        <Card className="p-4">
          <Button onClick={logic.startCall} className="w-full" size="lg">
            <Icon name="Phone" size={20} className="mr-2" />
            Начать звонок
          </Button>
        </Card>
      )}

      <ParticipantsList participants={state.participants} />
    </div>
  );
}
