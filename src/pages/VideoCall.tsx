import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Peer, { DataConnection, MediaConnection } from 'peerjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Message {
  text: string;
  sender: 'me' | 'peer';
  timestamp: Date;
}

export default function VideoCall() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomId = searchParams.get('room');

  const [myPeerId, setMyPeerId] = useState<string>('');
  const [remotePeerId, setRemotePeerId] = useState<string>('');
  const [peer, setPeer] = useState<Peer | null>(null);
  const [connection, setConnection] = useState<DataConnection | null>(null);
  const [call, setCall] = useState<MediaConnection | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [roomUrl, setRoomUrl] = useState<string>('');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [callDuration, setCallDuration] = useState(0);
  const [incomingCall, setIncomingCall] = useState<MediaConnection | null>(null);
  const [callerPeerId, setCallerPeerId] = useState<string>('');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const callTimerRef = useRef<number | null>(null);
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const newPeer = new Peer();

    newPeer.on('open', (id) => {
      setMyPeerId(id);
      console.log('My peer ID:', id);

      if (roomId && roomId !== id) {
        setRemotePeerId(roomId);
        setTimeout(() => {
          connectToPeerById(roomId, newPeer);
        }, 500);
      } else if (!roomId) {
        const url = `${window.location.origin}/video-call?room=${id}`;
        setRoomUrl(url);
      }
    });

    newPeer.on('connection', (conn) => {
      setConnection(conn);
      setIsConnected(true);
      
      conn.on('data', (data) => {
        const message = data as string;
        setMessages(prev => [...prev, { 
          text: message, 
          sender: 'peer', 
          timestamp: new Date() 
        }]);
      });

      conn.on('close', () => {
        setIsConnected(false);
        setConnection(null);
      });
    });

    newPeer.on('call', (mediaConnection) => {
      // Show incoming call notification
      setIncomingCall(mediaConnection);
      setCallerPeerId(mediaConnection.peer);
      
      // Play ringtone
      if (!ringtoneRef.current) {
        ringtoneRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSyBzvLXiTYIG2m98OScTgwOUKXh8LRkGwU7k9jz0I0yBSV9z/HZljgJElyx6OyrWBELTKXh8bllHAU2jdXxxH0pBSh+zvDaj0EKGGG26+maUQ0NTqTg8bVnHwU7k9jz0I0yBSV9z/HZljgJElyx6OyrWBELTKXh8bllHAU2jdXxxH0pBSh+zvDaj0EKGGG26+maUQ0NTqTg8bVnHwU7k9jz0I0yBSV9z/HZljgJElyx6OyrWBELTKXh8bllHAU2jdXxxH0pBSh+zvDaj0EKGGG26+maUQ0NTqTg8bVnHwU7k9jz0I0yBSV9z/HZljgJElyx6OyrWBELTKXh8bllHAU2jdXxxH0pBSh+zvDaj0EKGGG26+maUQ0NTqTg8bVnHwU7k9jz0I0yBSV9z/HZljgJElyx6OyrWBELTKXh8bllHAU2jdXxxH0pBSh+zvDaj0EKGGG26+maUQ0NTqTg8bVnHwU7k9jz');
        ringtoneRef.current.loop = true;
      }
      ringtoneRef.current.play().catch(e => console.error('Ringtone play error:', e));
    });

    setPeer(newPeer);

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      newPeer.destroy();
    };
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const connectToPeerById = (peerId: string, peerInstance?: Peer) => {
    const activePeer = peerInstance || peer;
    if (!activePeer || !peerId) return;

    const conn = activePeer.connect(peerId);
    
    conn.on('open', () => {
      setConnection(conn);
      setIsConnected(true);
    });

    conn.on('data', (data) => {
      const message = data as string;
      setMessages(prev => [...prev, { 
        text: message, 
        sender: 'peer', 
        timestamp: new Date() 
      }]);
    });

    conn.on('close', () => {
      setIsConnected(false);
      setConnection(null);
    });
  };

  const connectToPeer = () => {
    connectToPeerById(remotePeerId);
  };

  const startCall = async () => {
    if (!peer || !remotePeerId) return;

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      setStream(mediaStream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }

      const mediaConnection = peer.call(remotePeerId, mediaStream);
      setCall(mediaConnection);
      setIsCalling(true);
      
      // Start call timer
      setCallDuration(0);
      callTimerRef.current = window.setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      mediaConnection.on('stream', (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      mediaConnection.on('close', () => {
        endCall();
      });
    } catch (error) {
      console.error('Error starting call:', error);
      alert('Не удалось начать звонок');
    }
  };

  const endCall = () => {
    if (call) {
      call.close();
      setCall(null);
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    
    setIsCalling(false);
    setIsVideoEnabled(true);
    setIsAudioEnabled(true);
    setIsScreenSharing(false);

    if (isRecording) {
      stopRecording();
    }

    // Stop call timer
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    setCallDuration(0);
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const startRecording = () => {
    if (!stream) return;

    try {
      const options = { mimeType: 'video/webm; codecs=vp9' };
      let recorder: MediaRecorder;

      try {
        recorder = new MediaRecorder(stream, options);
      } catch (e) {
        const fallbackOptions = { mimeType: 'video/webm' };
        recorder = new MediaRecorder(stream, fallbackOptions);
      }

      recordedChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
          setRecordedChunks([...recordedChunksRef.current]);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `video-call-${new Date().getTime()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      };

      recorder.start(1000);
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Не удалось начать запись');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setMediaRecorder(null);
      setIsRecording(false);
    }
  };

  const acceptCall = async () => {
    if (!incomingCall) return;

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      setStream(mediaStream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }

      incomingCall.answer(mediaStream);
      setCall(incomingCall);
      setIsCalling(true);
      setIncomingCall(null);

      // Stop ringtone
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
      }

      // Start call timer
      setCallDuration(0);
      callTimerRef.current = window.setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      incomingCall.on('stream', (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      incomingCall.on('close', () => {
        endCall();
      });
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Не удалось получить доступ к камере и микрофону');
      rejectCall();
    }
  };

  const rejectCall = () => {
    if (incomingCall) {
      incomingCall.close();
      setIncomingCall(null);
      setCallerPeerId('');
    }
    
    // Stop ringtone
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }
  };

  const toggleScreenShare = async () => {
    if (!call) return;

    if (isScreenSharing) {
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        setScreenStream(null);
      }

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        setStream(mediaStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream;
        }

        const videoTrack = mediaStream.getVideoTracks()[0];
        const sender = call.peerConnection.getSenders().find(s => s.track?.kind === 'video');
        if (sender && videoTrack) {
          await sender.replaceTrack(videoTrack);
        }
      } catch (error) {
        console.error('Error switching back to camera:', error);
      }

      setIsScreenSharing(false);
    } else {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true, 
          audio: false 
        });
        
        setScreenStream(displayStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = displayStream;
        }

        const screenTrack = displayStream.getVideoTracks()[0];
        const sender = call.peerConnection.getSenders().find(s => s.track?.kind === 'video');
        if (sender && screenTrack) {
          await sender.replaceTrack(screenTrack);
        }

        screenTrack.onended = () => {
          toggleScreenShare();
        };

        setIsScreenSharing(true);
      } catch (error) {
        console.error('Error starting screen share:', error);
        alert('Не удалось начать демонстрацию экрана');
      }
    }
  };

  const sendMessage = () => {
    if (!connection || !messageInput.trim()) return;

    connection.send(messageInput);
    setMessages(prev => [...prev, { 
      text: messageInput, 
      sender: 'me', 
      timestamp: new Date() 
    }]);
    setMessageInput('');
  };

  const copyRoomLink = () => {
    const url = roomUrl || `${window.location.origin}/video-call?room=${myPeerId}`;
    navigator.clipboard.writeText(url);
    alert('Ссылка скопирована! Отправьте её собеседнику для подключения');
  };

  const createNewRoom = () => {
    navigate('/video-call');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            Видеозвонки P2P
          </h1>
          <Button onClick={createNewRoom} variant="outline" className="border-black">
            <Icon name="Plus" size={16} className="mr-2" />
            Новая комната
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Icon name="Link" size={24} />
              Ссылка на комнату
            </h2>
            <div className="flex gap-2 mb-3">
              <Input 
                value={roomUrl || `${window.location.origin}/video-call?room=${myPeerId}`}
                readOnly 
                className="flex-1 text-sm"
              />
              <Button onClick={copyRoomLink} variant="outline" className="border-black">
                <Icon name="Copy" size={16} className="mr-2" />
                Копировать
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              Отправьте эту ссылку собеседнику для автоматического подключения
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Icon name="Users" size={24} />
              Подключение вручную
            </h2>
            <div className="flex gap-2 mb-4">
              <Input 
                value={remotePeerId}
                onChange={(e) => setRemotePeerId(e.target.value)}
                placeholder="Или введите ID собеседника"
                className="flex-1"
                disabled={isConnected}
              />
              <Button 
                onClick={connectToPeer} 
                disabled={!remotePeerId || isConnected}
                variant="outline"
                className="border-black"
              >
                <Icon name="Link" size={16} />
              </Button>
            </div>
            {isConnected && (
              <div className="flex items-center gap-2 text-green-600">
                <Icon name="CheckCircle" size={16} />
                <span className="text-sm font-medium">Подключено</span>
              </div>
            )}
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Icon name="Video" size={24} />
                  Видеозвонок
                </h2>
                {isCalling && (
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Icon name="Clock" size={16} />
                    <span className="font-mono">{Math.floor(callDuration / 60).toString().padStart(2, '0')}:{(callDuration % 60).toString().padStart(2, '0')}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {!isCalling ? (
                  <Button 
                    onClick={startCall} 
                    disabled={!isConnected}
                    className="bg-green-600 hover:bg-green-700 border-2 border-black"
                  >
                    <Icon name="Video" size={16} className="mr-2" />
                    Начать звонок
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={toggleVideo}
                      variant={isVideoEnabled ? "outline" : "destructive"}
                      size="icon"
                      className={isVideoEnabled ? "border-black" : ""}
                    >
                      <Icon name={isVideoEnabled ? "Video" : "VideoOff"} size={18} />
                    </Button>
                    <Button 
                      onClick={toggleAudio}
                      variant={isAudioEnabled ? "outline" : "destructive"}
                      size="icon"
                      className={isAudioEnabled ? "border-black" : ""}
                    >
                      <Icon name={isAudioEnabled ? "Mic" : "MicOff"} size={18} />
                    </Button>
                    <Button 
                      onClick={toggleScreenShare}
                      variant="outline"
                      size="icon"
                      className={isScreenSharing ? "border-black bg-gray-100" : "border-black"}
                    >
                      <Icon name={isScreenSharing ? "MonitorX" : "Monitor"} size={18} />
                    </Button>
                    <Button 
                      onClick={isRecording ? stopRecording : startRecording}
                      variant={isRecording ? "destructive" : "outline"}
                      size="icon"
                      className={!isRecording ? "border-black" : ""}
                    >
                      <Icon name={isRecording ? "Square" : "Circle"} size={18} />
                    </Button>
                    <Button 
                      onClick={endCall}
                      className="bg-red-600 hover:bg-red-700 border-2 border-black"
                    >
                      <Icon name="PhoneOff" size={16} className="mr-2" />
                      Завершить
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Incoming call notification */}
            {incomingCall && (
              <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-500 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                      <Icon name="Phone" size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">Входящий звонок</p>
                      <p className="text-sm text-gray-600">От: {callerPeerId.slice(0, 8)}...</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={acceptCall}
                      className="bg-green-600 hover:bg-green-700 border-2 border-black"
                    >
                      <Icon name="Phone" size={16} className="mr-2" />
                      Принять
                    </Button>
                    <Button 
                      onClick={rejectCall}
                      className="bg-red-600 hover:bg-red-700 border-2 border-black"
                    >
                      <Icon name="PhoneOff" size={16} className="mr-2" />
                      Отклонить
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                <video 
                  ref={remoteVideoRef}
                  autoPlay 
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-sm">
                  Собеседник
                </div>
              </div>

              <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                <video 
                  ref={localVideoRef}
                  autoPlay 
                  playsInline 
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-sm">
                  Вы
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 flex flex-col">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Icon name="MessageCircle" size={24} />
              Чат
            </h2>

            <div className="flex-1 bg-gray-50 rounded-lg p-4 mb-4 overflow-y-auto max-h-96 min-h-[300px]">
              {messages.length === 0 ? (
                <p className="text-gray-400 text-center text-sm">
                  Сообщений пока нет
                </p>
              ) : (
                messages.map((msg, index) => (
                  <div 
                    key={index}
                    className={`mb-3 ${msg.sender === 'me' ? 'text-right' : 'text-left'}`}
                  >
                    <div 
                      className={`inline-block px-4 py-2 rounded-lg max-w-[80%] ${
                        msg.sender === 'me' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white text-gray-800 border'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {msg.timestamp.toLocaleTimeString('ru-RU', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2">
              <Input 
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Введите сообщение..."
                disabled={!isConnected}
              />
              <Button 
                onClick={sendMessage} 
                disabled={!isConnected || !messageInput.trim()}
                variant="outline"
                className="border-black"
              >
                <Icon name="Send" size={16} />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}