import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Footer } from '@/components/layout/Footer';
import { IncomingCallDialog } from '@/components/video-call/IncomingCallDialog';
import { useVideoCallState } from '@/components/video-call/VideoCallState';
import { useVideoCallLogic } from '@/components/video-call/VideoCallLogic';
import { VideoSection } from '@/components/video-call/VideoSection';
import { SidebarSection } from '@/components/video-call/SidebarSection';

export default function VideoCall() {
  const navigate = useNavigate();
  const state = useVideoCallState();
  const logic = useVideoCallLogic({ state });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <Icon name="ArrowLeft" size={20} />
            Назад
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">Видеозвонок</h1>
          <div className="w-24"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <VideoSection state={state} logic={logic} />
          <SidebarSection state={state} logic={logic} />
        </div>
      </div>

      <IncomingCallDialog
        isOpen={!!state.incomingCall}
        callerName={state.remoteName}
        onAccept={logic.acceptCall}
        onReject={logic.rejectCall}
      />

      <Footer />
    </div>
  );
}
