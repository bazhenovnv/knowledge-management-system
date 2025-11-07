import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface IncomingCallDialogProps {
  isOpen: boolean;
  callerName: string;
  onAccept: () => void;
  onReject: () => void;
}

export const IncomingCallDialog = ({
  isOpen,
  callerName,
  onAccept,
  onReject,
}: IncomingCallDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="p-6 max-w-md w-full mx-4 animate-bounce">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Phone" size={40} className="text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Входящий звонок</h3>
            <p className="text-gray-600">
              {callerName} звонит вам
            </p>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Button
              onClick={onReject}
              variant="destructive"
              size="lg"
              className="rounded-full w-16 h-16"
            >
              <Icon name="PhoneOff" size={28} />
            </Button>
            <Button
              onClick={onAccept}
              className="bg-green-500 hover:bg-green-600 rounded-full w-16 h-16"
              size="lg"
            >
              <Icon name="Phone" size={28} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
