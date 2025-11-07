import { Card } from '@/components/ui/card';
import { Participant } from './types';

interface ParticipantsListProps {
  participants: Participant[];
}

export const ParticipantsList = ({ participants }: ParticipantsListProps) => {
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-3 text-gray-800">
        Участники ({participants.length})
      </h3>
      <div className="space-y-2">
        {participants.map((participant) => {
          const [colorClass, initials] = participant.avatar.split('|');
          return (
            <div
              key={participant.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className={`w-10 h-10 ${colorClass} rounded-full flex items-center justify-center text-white font-semibold relative`}>
                {initials}
                {participant.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-800">
                  {participant.name}
                  {participant.isSelf && (
                    <span className="text-xs text-gray-500 ml-1">(вы)</span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {participant.isOnline ? 'В сети' : 'Не в сети'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
