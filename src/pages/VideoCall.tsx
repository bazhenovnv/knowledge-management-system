import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Peer, { DataConnection, MediaConnection } from 'peerjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Footer } from '@/components/layout/Footer';
import { Message, Participant } from '@/components/video-call/types';
import { VideoControls } from '@/components/video-call/VideoControls';
import { ChatMessage } from '@/components/video-call/ChatMessage';
import { ParticipantsList } from '@/components/video-call/ParticipantsList';
import { IncomingCallDialog } from '@/components/video-call/IncomingCallDialog';
import { generateAvatar, formatFileSize, formatCallDuration } from '@/components/video-call/videoCallUtils';

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
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [myName, setMyName] = useState<string>('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [remoteName, setRemoteName] = useState<string>('Собеседник');
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const callTimerRef = useRef<number | null>(null);
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setMyName(storedName);
    } else {
      const randomName = 'Участник ' + Math.floor(Math.random() * 1000);
      setMyName(randomName);
      localStorage.setItem('userName', randomName);
    }
  }, []);

  useEffect(() => {
    if (!myPeerId) return;
    
    const newParticipants: Participant[] = [
      {
        id: myPeerId,
        name: myName || 'Вы',
        avatar: generateAvatar(myName || 'Вы'),
        isOnline: true,
        isSelf: true
      }
    ];

    if ((isConnected || isCalling) && remotePeerId) {
      newParticipants.push({
        id: remotePeerId,
        name: remoteName,
        avatar: generateAvatar(remoteName),
        isOnline: true,
        isSelf: false
      });
    }

    setParticipants(newParticipants);
  }, [myPeerId, myName, isConnected, isCalling, remotePeerId, remoteName]);

  useEffect(() => {
    const newPeer = new Peer({
      debug: 0,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ]
      }
    });

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

    newPeer.on('error', (error) => {
      console.error('PeerJS error:', error);
      if (error.type === 'network') {
        console.error('Проблема с сетью. Проверьте подключение к интернету.');
      } else if (error.type === 'peer-unavailable') {
        console.error('Собеседник недоступен. Проверьте ID комнаты.');
      } else if (error.type === 'server-error') {
        console.error('Ошибка сервера PeerJS. Попробуйте позже.');
      }
    });

    newPeer.on('connection', (conn) => {
      setConnection(conn);
      setIsConnected(true);
      
      conn.on('data', (data) => {
        handleIncomingData(data);
      });

      conn.on('open', () => {
        conn.send(JSON.stringify({ type: 'name', name: myName }));
      });

      conn.on('error', (error) => {
        console.error('Connection error:', error);
      });

      conn.on('close', () => {
        setIsConnected(false);
        setConnection(null);
      });
    });

    newPeer.on('call', (mediaConnection) => {
      setIncomingCall(mediaConnection);
      setCallerPeerId(mediaConnection.peer);
      
      if (!ringtoneRef.current) {
        ringtoneRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSyBzvLXiTYIG2m98OScTgwOUKXh8LRkGwU7k9jz0I0yBSV9z/HZljgJElyx6OyrWBELTKXh8bllHAU2jdXxxH0pBSh+zvDaj0EKGGG26+maUQ0NTqTg8bVnHwU7k9jz0I0yBSV9z/HZljgJElyx6OyrWBELTKXh8bllHAU2jdXxxH0pBSh+zvDaj0EKGGG26+maUQ0NTqTg8bVnHwU7k9jz0I0yBSV9z/HZljgJElyx6OyrWBELTKXh8bllHAU2jdXxxH0pBSh+zvDaj0EKGGG26+maUQ0NTqTg8bVnHwU7k9jz0I0yBSV9z/HZljgJElyx6OyrWBELTKXh8bllHAU2jdXxxH0pBSh+zvDaj0EKGGG26+maUQ0NTqTg8bVnHwU7k9jz');
        ringtoneRef.current.loop = true;
      }
      ringtoneRef.current.play().catch(e => console.error('Ringtone play error:', e));
    });

    setPeer(newPeer);

    return () => {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current = null;
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      newPeer.destroy();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleIncomingData = (data: any) => {
    const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
    
    if (parsedData.type === 'name') {
      setRemoteName(parsedData.name);
    } else if (parsedData.type === 'message') {
      setMessages(prev => [...prev, { 
        text: parsedData.text, 
        sender: 'peer', 
        timestamp: new Date(),
        reactions: [],
        id: parsedData.id
      }]);
    } else if (parsedData.type === 'reaction') {
      setMessages(prev => prev.map(msg => 
        msg.id === parsedData.messageId
          ? { ...msg, reactions: parsedData.reactions }
          : msg
      ));
    } else if (parsedData.type === 'edit') {
      setMessages(prev => prev.map(msg => 
        msg.id === parsedData.messageId
          ? { ...msg, text: parsedData.text, isEdited: true }
          : msg
      ));
    } else if (parsedData.type === 'delete') {
      setMessages(prev => prev.map(msg => 
        msg.id === parsedData.messageId
          ? { ...msg, isDeleted: true, text: undefined, file: undefined }
          : msg
      ));
    } else if (parsedData.type === 'file') {
      const blob = new Blob([parsedData.data], { type: parsedData.fileType });
      const url = URL.createObjectURL(blob);
      
      setMessages(prev => [...prev, {
        sender: 'peer',
        timestamp: new Date(),
        file: {
          name: parsedData.fileName,
          size: parsedData.fileSize,
          type: parsedData.fileType,
          url: url
        },
        reactions: [],
        id: parsedData.id
      }]);
    }
  };

  const connectToPeerById = (peerId: string, peerInstance?: Peer) => {
    const activePeer = peerInstance || peer;
    if (!activePeer || !peerId) {
      console.error('Нет активного peer или ID для подключения');
      return;
    }

    try {
      const conn = activePeer.connect(peerId, { reliable: true });
      
      conn.on('open', () => {
        setConnection(conn);
        setIsConnected(true);
        console.log('Соединение установлено с:', peerId);
        conn.send(JSON.stringify({ type: 'name', name: myName }));
      });

      conn.on('data', (data) => {
        handleIncomingData(data);
      });

      conn.on('error', (error) => {
        console.error('Ошибка подключения:', error);
        alert('Не удалось подключиться к собеседнику. Проверьте ID комнаты.');
      });

      conn.on('close', () => {
        setIsConnected(false);
        setConnection(null);
        console.log('Соединение закрыто');
      });
    } catch (error) {
      console.error('Ошибка при создании подключения:', error);
      alert('Не удалось создать подключение');
    }
  };

  const connectToPeer = () => {
    connectToPeerById(remotePeerId);
  };

  const startCall = async () => {
    if (!peer || !remotePeerId) {
      alert('Нет подключения или ID собеседника');
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 }, 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      setStream(mediaStream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }

      const outgoingCall = peer.call(remotePeerId, mediaStream);
      setCall(outgoingCall);
      setIsCalling(true);

      setCallDuration(0);
      callTimerRef.current = window.setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      outgoingCall.on('stream', (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      outgoingCall.on('close', () => {
        endCall();
      });
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Не удалось получить доступ к камере и микрофону');
    }
  };

  const endCall = () => {
    if (call) {
      call.close();
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    setCall(null);
    setIsCalling(false);
    setCallDuration(0);
    setIsScreenSharing(false);
    setIsRecording(false);
    setMediaRecorder(null);
    setRecordedChunks([]);
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

    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 },
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      setStream(mediaStream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }

      incomingCall.answer(mediaStream);
      setCall(incomingCall);
      setIsCalling(true);
      setIncomingCall(null);

      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
      }

      setCallDuration(0);
      callTimerRef.current = window.setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      incomingCall.on('stream', (remoteStream) => {
        console.log('Получен поток от звонящего');
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      incomingCall.on('error', (error) => {
        console.error('Ошибка входящего звонка:', error);
        alert('Ошибка во время звонка');
        endCall();
      });

      incomingCall.on('close', () => {
        console.log('Входящий звонок завершен');
        endCall();
      });
    } catch (error) {
      console.error('Ошибка доступа к медиа-устройствам:', error);
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          alert('Доступ к камере/микрофону запрещен. Разрешите доступ в настройках браузера.');
        } else if (error.name === 'NotFoundError') {
          alert('Камера или микрофон не найдены. Подключите устройства.');
        } else {
          alert('Не удалось получить доступ к камере и микрофону: ' + error.message);
        }
      }
      rejectCall();
    }
  };

  const rejectCall = () => {
    if (incomingCall) {
      incomingCall.close();
      setIncomingCall(null);
    }
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

    const messageId = Math.random().toString(36).substring(2, 15);
    connection.send(JSON.stringify({ type: 'message', text: messageInput, id: messageId }));
    setMessages(prev => [...prev, { 
      text: messageInput, 
      sender: 'me', 
      timestamp: new Date(),
      reactions: [],
      id: messageId
    }]);
    setMessageInput('');
  };

  const addReaction = (messageId: string, emoji: string) => {
    if (!connection) return;

    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions?.find(r => r.sender === 'me');
        let newReactions: { emoji: string; sender: 'me' | 'peer' }[];
        
        if (existingReaction) {
          if (existingReaction.emoji === emoji) {
            newReactions = msg.reactions?.filter(r => r.sender !== 'me') || [];
          } else {
            newReactions = msg.reactions?.map(r => 
              r.sender === 'me' ? { ...r, emoji } : r
            ) || [];
          }
        } else {
          newReactions = [...(msg.reactions || []), { emoji, sender: 'me' }];
        }

        connection.send(JSON.stringify({
          type: 'reaction',
          messageId,
          reactions: newReactions
        }));

        return { ...msg, reactions: newReactions };
      }
      return msg;
    }));

    setShowEmojiPicker(null);
  };

  const startEditMessage = (messageId: string, text: string) => {
    setEditingMessageId(messageId);
    setEditingText(text);
    setShowEmojiPicker(null);
  };

  const saveEditMessage = () => {
    if (!connection || !editingMessageId || !editingText.trim()) return;

    connection.send(JSON.stringify({
      type: 'edit',
      messageId: editingMessageId,
      text: editingText
    }));

    setMessages(prev => prev.map(msg => 
      msg.id === editingMessageId
        ? { ...msg, text: editingText, isEdited: true }
        : msg
    ));

    setEditingMessageId(null);
    setEditingText('');
  };

  const cancelEditMessage = () => {
    setEditingMessageId(null);
    setEditingText('');
  };

  const deleteMessage = (messageId: string) => {
    if (!connection) return;

    connection.send(JSON.stringify({
      type: 'delete',
      messageId
    }));

    setMessages(prev => prev.map(msg => 
      msg.id === messageId
        ? { ...msg, isDeleted: true, text: undefined, file: undefined }
        : msg
    ));
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !connection) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const messageId = Math.random().toString(36).substring(2, 15);
      connection.send(JSON.stringify({
        type: 'file',
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        data: Array.from(uint8Array),
        id: messageId
      }));

      const url = URL.createObjectURL(file);
      setMessages(prev => [...prev, {
        sender: 'me',
        timestamp: new Date(),
        file: {
          name: file.name,
          size: file.size,
          type: file.type,
          url: url
        },
        reactions: [],
        id: messageId
      }]);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Ошибка при отправке файла:', error);
      alert('Не удалось отправить файл');
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const copyRoomLink = () => {
    const url = roomUrl || `${window.location.origin}/video-call?room=${myPeerId}`;
    navigator.clipboard.writeText(url);
    alert('Ссылка скопирована! Отправьте её собеседнику для начала звонка.');
  };

  const handleNameEdit = () => {
    if (!isEditingName) {
      setTempName(myName);
      setIsEditingName(true);
    } else {
      if (tempName.trim()) {
        setMyName(tempName.trim());
        localStorage.setItem('userName', tempName.trim());
        if (connection) {
          connection.send(JSON.stringify({ type: 'name', name: tempName.trim() }));
        }
      }
      setIsEditingName(false);
    }
  };

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
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-4">
              <div className="aspect-video bg-gray-900 rounded-lg relative overflow-hidden">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute bottom-4 right-4 w-48 h-36 object-cover rounded-lg border-2 border-white shadow-lg"
                />
                
                {isCalling && (
                  <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    {formatCallDuration(callDuration)}
                  </div>
                )}
                
                {!isCalling && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Icon name="Video" size={64} className="mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Нет активного звонка</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <VideoControls
                  isCalling={isCalling}
                  isVideoEnabled={isVideoEnabled}
                  isAudioEnabled={isAudioEnabled}
                  isScreenSharing={isScreenSharing}
                  isRecording={isRecording}
                  onToggleVideo={toggleVideo}
                  onToggleAudio={toggleAudio}
                  onToggleScreenShare={toggleScreenShare}
                  onStartRecording={startRecording}
                  onStopRecording={stopRecording}
                  onEndCall={endCall}
                />
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3 text-gray-800">Чат</h3>
              <div className="h-64 overflow-y-auto mb-3 bg-gray-50 rounded-lg p-3">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <p>Нет сообщений</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      showEmojiPicker={showEmojiPicker}
                      editingMessageId={editingMessageId}
                      editingText={editingText}
                      onShowEmojiPicker={setShowEmojiPicker}
                      onAddReaction={addReaction}
                      onStartEdit={startEditMessage}
                      onSaveEdit={saveEditMessage}
                      onCancelEdit={cancelEditMessage}
                      onDelete={deleteMessage}
                      onEditingTextChange={setEditingText}
                      formatFileSize={formatFileSize}
                    />
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
                  className="flex-1"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  onClick={openFileDialog}
                  variant="outline"
                  disabled={!isConnected}
                >
                  <Icon name="Paperclip" size={20} />
                </Button>
                <Button onClick={sendMessage} disabled={!isConnected}>
                  <Icon name="Send" size={20} />
                </Button>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-3 text-gray-800">Мой ID</h3>
              <div className="bg-gray-100 p-3 rounded-lg mb-3">
                <code className="text-sm break-all">{myPeerId || 'Загрузка...'}</code>
              </div>
              <Button onClick={copyRoomLink} className="w-full" disabled={!myPeerId}>
                <Icon name="Copy" size={16} className="mr-2" />
                Скопировать ссылку
              </Button>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3 text-gray-800">Имя</h3>
              <div className="flex gap-2">
                {isEditingName ? (
                  <Input
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="Введите имя"
                    className="flex-1"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleNameEdit();
                      if (e.key === 'Escape') {
                        setIsEditingName(false);
                        setTempName('');
                      }
                    }}
                  />
                ) : (
                  <div className="flex-1 bg-gray-100 p-2 rounded-lg">
                    {myName || 'Не указано'}
                  </div>
                )}
                <Button onClick={handleNameEdit} variant="outline">
                  <Icon name={isEditingName ? "Check" : "Edit"} size={16} />
                </Button>
              </div>
            </Card>

            {!isConnected && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3 text-gray-800">Подключиться</h3>
                <Input
                  value={remotePeerId}
                  onChange={(e) => setRemotePeerId(e.target.value)}
                  placeholder="ID собеседника"
                  className="mb-3"
                />
                <Button onClick={connectToPeer} className="w-full" disabled={!remotePeerId}>
                  <Icon name="Link" size={16} className="mr-2" />
                  Подключиться
                </Button>
              </Card>
            )}

            {isConnected && !isCalling && (
              <Card className="p-4">
                <Button onClick={startCall} className="w-full" size="lg">
                  <Icon name="Phone" size={20} className="mr-2" />
                  Начать звонок
                </Button>
              </Card>
            )}

            <ParticipantsList participants={participants} />
          </div>
        </div>
      </div>

      <IncomingCallDialog
        isOpen={!!incomingCall}
        callerName={remoteName}
        onAccept={acceptCall}
        onReject={rejectCall}
      />

      <Footer />
    </div>
  );
}
