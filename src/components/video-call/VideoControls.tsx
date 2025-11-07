import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface VideoControlsProps {
  isCalling: boolean;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onToggleScreenShare: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onEndCall: () => void;
}

export const VideoControls = ({
  isCalling,
  isVideoEnabled,
  isAudioEnabled,
  isScreenSharing,
  isRecording,
  onToggleVideo,
  onToggleAudio,
  onToggleScreenShare,
  onStartRecording,
  onStopRecording,
  onEndCall,
}: VideoControlsProps) => {
  if (!isCalling) return null;

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        onClick={onToggleVideo}
        variant={isVideoEnabled ? "default" : "destructive"}
        size="lg"
        className="rounded-full h-12 w-12"
      >
        <Icon name={isVideoEnabled ? "Video" : "VideoOff"} size={20} />
      </Button>
      <Button
        onClick={onToggleAudio}
        variant={isAudioEnabled ? "default" : "destructive"}
        size="lg"
        className="rounded-full h-12 w-12"
      >
        <Icon name={isAudioEnabled ? "Mic" : "MicOff"} size={20} />
      </Button>
      <Button
        onClick={onToggleScreenShare}
        variant={isScreenSharing ? "default" : "outline"}
        size="lg"
        className="rounded-full h-12 w-12"
      >
        <Icon name={isScreenSharing ? "MonitorOff" : "Monitor"} size={20} />
      </Button>
      <Button
        onClick={isRecording ? onStopRecording : onStartRecording}
        variant={isRecording ? "destructive" : "outline"}
        size="lg"
        className="rounded-full h-12 w-12"
      >
        <Icon name={isRecording ? "Square" : "Circle"} size={20} />
      </Button>
      <Button
        onClick={onEndCall}
        variant="destructive"
        size="lg"
        className="rounded-full h-14 w-14"
      >
        <Icon name="PhoneOff" size={24} />
      </Button>
    </div>
  );
};
