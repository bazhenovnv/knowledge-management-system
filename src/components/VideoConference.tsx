import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface VideoConferenceProps {
  roomId: string;
  userName: string;
  onLeave: () => void;
}

export const VideoConference = ({ roomId, userName, onLeave }: VideoConferenceProps) => {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const [api, setApi] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    if (!jitsiContainerRef.current) return;

    const domain = 'meet.jit.si';
    const options = {
      roomName: roomId,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      userInfo: {
        displayName: userName,
      },
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        prejoinPageEnabled: false,
        enableWelcomePage: false,
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_CHROME_EXTENSION_BANNER: false,
        DEFAULT_BACKGROUND: '#1a1a1a',
        TOOLBAR_BUTTONS: [
          'microphone',
          'camera',
          'closedcaptions',
          'desktop',
          'fullscreen',
          'fodeviceselection',
          'hangup',
          'profile',
          'chat',
          'recording',
          'livestreaming',
          'etherpad',
          'sharedvideo',
          'settings',
          'raisehand',
          'videoquality',
          'filmstrip',
          'stats',
          'shortcuts',
          'tileview',
          'download',
          'help',
          'mute-everyone',
        ],
      },
    };

    const loadJitsi = () => {
      if ((window as any).JitsiMeetExternalAPI) {
        const jitsiApi = new (window as any).JitsiMeetExternalAPI(domain, options);
        setApi(jitsiApi);

        jitsiApi.addListener('videoConferenceJoined', () => {
          toast.success('Вы присоединились к конференции');
        });

        jitsiApi.addListener('videoConferenceLeft', () => {
          onLeave();
        });

        jitsiApi.addListener('audioMuteStatusChanged', ({ muted }: any) => {
          setIsMuted(muted);
        });

        jitsiApi.addListener('videoMuteStatusChanged', ({ muted }: any) => {
          setIsVideoOff(muted);
        });
      } else {
        setTimeout(loadJitsi, 500);
      }
    };

    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = loadJitsi;
    document.body.appendChild(script);

    return () => {
      if (api) {
        api.dispose();
      }
      const existingScript = document.querySelector('script[src="https://meet.jit.si/external_api.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, [roomId, userName]);

  const toggleMute = () => {
    if (api) {
      api.executeCommand('toggleAudio');
    }
  };

  const toggleVideo = () => {
    if (api) {
      api.executeCommand('toggleVideo');
    }
  };

  const handleLeave = () => {
    if (api) {
      api.executeCommand('hangup');
    }
    onLeave();
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900">
      <div className="h-full flex flex-col">
        <div className="flex-1" ref={jitsiContainerRef} />
        
        <div className="bg-gray-800 p-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant={isMuted ? 'destructive' : 'outline'}
              size="lg"
              onClick={toggleMute}
              className="rounded-full w-14 h-14"
            >
              <Icon name={isMuted ? 'MicOff' : 'Mic'} size={24} />
            </Button>
            
            <Button
              variant={isVideoOff ? 'destructive' : 'outline'}
              size="lg"
              onClick={toggleVideo}
              className="rounded-full w-14 h-14"
            >
              <Icon name={isVideoOff ? 'VideoOff' : 'Video'} size={24} />
            </Button>
            
            <Button
              variant="destructive"
              size="lg"
              onClick={handleLeave}
              className="rounded-full w-14 h-14"
            >
              <Icon name="PhoneOff" size={24} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
