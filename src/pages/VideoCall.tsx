import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Peer, { DataConnection, MediaConnection } from 'peerjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Footer } from '@/components/layout/Footer';

interface Message {
  text?: string;
  sender: 'me' | 'peer';
  timestamp: Date;
  file?: {
    name: string;
    size: number;
    type: string;
    url: string;
  };
  reactions?: {
    emoji: string;
    sender: 'me' | 'peer';
  }[];
  id: string;
  isEdited?: boolean;
  isDeleted?: boolean;
}

interface Participant {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  isSelf: boolean;
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

  const generateAvatar = (name: string): string => {
    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
    
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-pink-500',
      'bg-orange-500',
      'bg-teal-500'
    ];
    
    const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[colorIndex] + '|' + initials;
  };

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
        ringtoneRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSyBzvLXiTYIG2m98OScTgwOUKXh8LRkGwU7k9jz0I0yBSV9z/HZljgJElyx6OyrWBELTKXh8bllHAU2jdXxxH0pBSh+zvDaj0EKGGG26+maUQ0NTqTg8bVnHwU7k9jz0I0yBSV9z/HZljgJElyx6OyrWBELTKXh8bllHAU2jdXxxH0pBSh+zvDaj0EKGGG26+maUQ0NTqTg8bVnHwU7k9jz0I0yBSV9z/HZljgJElyx6OyrWBELTKXh8bllHAU2jdXxxH0pBSh+zvDaj0EKGGG26+maUQ0NTqTg8bVnHwU7k9jz0I0yBSV9z/HZljgJElyx6OyrWBELTKXh8bllHAU2jdXxxH0pBSh+zvDaj0EKGGG26+maUQ0NTqTg8bVnHwU7k9jz0I0yBSV9z/HZljgJElyx6OyrWBELTKXh8bllHAU2jdXxxH0pBSh+zvDaj0EKGGG26+maUQ0NTqTg8bVnHwU7k9jz');
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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Б';
    const k = 1024;
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const copyRoomLink = () => {
    const url = roomUrl || `${window.location.origin}/video-call?room=${myPeerId}`;
    navigator.clipboard.writeText(url);
    alert('Ссылка скопирована! Отправьте её собеседнику для подключения');
  };

  const createNewRoom = () => {
    const roomId = Math.random().toString(36).substring(2, 15);
    navigate(`/video-call?room=${roomId}`);
    window.location.reload();
  };

  const shareRoom = async () => {
    const url = roomUrl || `${window.location.origin}/video-call?room=${myPeerId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Присоединяйтесь к видеозвонку',
          text: 'Нажмите на ссылку, чтобы присоединиться к видеоконференции',
          url: url
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Ошибка при попытке поделиться:', error);
          copyRoomLink();
        }
      }
    } else {
      copyRoomLink();
    }
  };

  const startEditingName = () => {
    setTempName(myName);
    setIsEditingName(true);
  };

  const saveName = () => {
    if (tempName.trim()) {
      setMyName(tempName.trim());
      localStorage.setItem('userName', tempName.trim());
      setIsEditingName(false);
      
      if (connection) {
        connection.send(JSON.stringify({ type: 'name', name: tempName.trim() }));
      }
    }
  };

  const cancelEditingName = () => {
    setIsEditingName(false);
    setTempName('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 px-6 bg-white rounded-lg shadow-lg border-[0.25px] border-black h-14">
          <h1 className="text-4xl font-bold text-gray-800">
            Видеозвонки P2P
          </h1>
          <Button onClick={createNewRoom} variant="outline" className="border-[0.25px] border-black">
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
            <div className="mb-4 bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Icon name="Users" size={16} />
                Участники ({participants.length})
              </h3>
              <div className="space-y-2">
                {participants.map((participant) => {
                  const [bgColor, initials] = participant.avatar.split('|');
                  return (
                    <div key={participant.id} className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm">
                      <div className={`w-10 h-10 ${bgColor} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                        {initials}
                      </div>
                      <div className="flex-1">
                        {participant.isSelf && isEditingName ? (
                          <div className="flex items-center gap-2">
                            <Input 
                              value={tempName}
                              onChange={(e) => setTempName(e.target.value)}
                              className="h-8 text-sm flex-1"
                              placeholder="Введите имя"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveName();
                                if (e.key === 'Escape') cancelEditingName();
                              }}
                              autoFocus
                            />
                            <Button size="sm" onClick={saveName} variant="ghost" className="h-8 w-8 p-0">
                              <Icon name="Check" size={14} />
                            </Button>
                            <Button size="sm" onClick={cancelEditingName} variant="ghost" className="h-8 w-8 p-0">
                              <Icon name="X" size={14} />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{participant.name}</span>
                              {participant.isSelf && (
                                <>
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Вы</span>
                                  <Button 
                                    size="sm" 
                                    onClick={startEditingName}
                                    variant="ghost" 
                                    className="h-6 w-6 p-0 hover:bg-gray-100"
                                    title="Изменить имя"
                                  >
                                    <Icon name="Pencil" size={12} />
                                  </Button>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-xs text-green-600">Онлайн</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-2 mb-3">
              <Input 
                value={roomUrl || `${window.location.origin}/video-call?room=${myPeerId}`}
                readOnly 
                className="flex-1 text-sm"
              />
              <Button onClick={copyRoomLink} variant="outline" className="border-[0.25px] border-black" title="Копировать ссылку">
                <Icon name="Copy" size={16} />
              </Button>
              <Button onClick={shareRoom} variant="default" className="border-[0.25px] border-black" title="Поделиться ссылкой">
                <Icon name="Share2" size={16} />
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              Скопируйте или поделитесь ссылкой для автоматического подключения собеседника
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
                className="border-[0.25px] border-black"
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
                <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                  <Icon name="Users" size={16} className="text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">
                    {isCalling ? '2' : isConnected ? '2' : '1'}
                  </span>
                </div>
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
                    className="bg-green-600 hover:bg-green-700 border-[0.25px] border-black"
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
                      className={isVideoEnabled ? "border-[0.25px] border-black" : ""}
                    >
                      <Icon name={isVideoEnabled ? "Video" : "VideoOff"} size={18} />
                    </Button>
                    <Button 
                      onClick={toggleAudio}
                      variant={isAudioEnabled ? "outline" : "destructive"}
                      size="icon"
                      className={isAudioEnabled ? "border-[0.25px] border-black" : ""}
                    >
                      <Icon name={isAudioEnabled ? "Mic" : "MicOff"} size={18} />
                    </Button>
                    <Button 
                      onClick={toggleScreenShare}
                      variant="outline"
                      size="icon"
                      className={isScreenSharing ? "border-[0.25px] border-black bg-gray-100" : "border-[0.25px] border-black"}
                    >
                      <Icon name={isScreenSharing ? "MonitorX" : "Monitor"} size={18} />
                    </Button>
                    <Button 
                      onClick={isRecording ? stopRecording : startRecording}
                      variant={isRecording ? "destructive" : "outline"}
                      size="icon"
                      className={!isRecording ? "border-[0.25px] border-black" : ""}
                    >
                      <Icon name={isRecording ? "Square" : "Circle"} size={18} />
                    </Button>
                    <Button 
                      onClick={endCall}
                      className="bg-red-600 hover:bg-red-700 border-[0.25px] border-black"
                    >
                      <Icon name="PhoneOff" size={16} className="mr-2" />
                      Завершить
                    </Button>
                  </>
                )}
              </div>
            </div>

            {incomingCall && (
              <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-500 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                      <Icon name="Phone" size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Входящий звонок</h3>
                      <p className="text-sm text-gray-600">От: {callerPeerId.substring(0, 8)}...</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={acceptCall}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Icon name="Phone" size={16} className="mr-2" />
                      Принять
                    </Button>
                    <Button 
                      onClick={rejectCall}
                      variant="destructive"
                    >
                      <Icon name="PhoneOff" size={16} className="mr-2" />
                      Отклонить
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
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
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
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
                      {msg.isDeleted ? (
                        <p className="text-sm italic opacity-60">Сообщение удалено</p>
                      ) : msg.file ? (
                        <div>
                          {msg.file.type.startsWith('image/') ? (
                            <div className="space-y-2">
                              <a 
                                href={msg.file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                              >
                                <img 
                                  src={msg.file.url}
                                  alt={msg.file.name}
                                  className="max-w-full max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                />
                              </a>
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{msg.file.name}</p>
                                  <p className="text-xs opacity-70">{formatFileSize(msg.file.size)}</p>
                                </div>
                                <a 
                                  href={msg.file.url}
                                  download={msg.file.name}
                                  className={`p-2 rounded hover:bg-opacity-80 ${
                                    msg.sender === 'me' ? 'hover:bg-blue-500' : 'hover:bg-gray-100'
                                  }`}
                                  title="Скачать"
                                >
                                  <Icon name="Download" size={16} />
                                </a>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded flex items-center justify-center ${
                                msg.sender === 'me' ? 'bg-blue-500' : 'bg-gray-200'
                              }`}>
                                <Icon name="File" size={20} className={msg.sender === 'me' ? 'text-white' : 'text-gray-600'} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{msg.file.name}</p>
                                <p className="text-xs opacity-70">{formatFileSize(msg.file.size)}</p>
                              </div>
                              <a 
                                href={msg.file.url}
                                download={msg.file.name}
                                className={`p-2 rounded hover:bg-opacity-80 ${
                                  msg.sender === 'me' ? 'hover:bg-blue-500' : 'hover:bg-gray-100'
                                }`}
                                title="Скачать"
                              >
                                <Icon name="Download" size={16} />
                              </a>
                            </div>
                          )}
                        </div>
                      ) : editingMessageId === msg.id ? (
                        <div className="flex gap-2 items-center w-full">
                          <Input
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEditMessage();
                              if (e.key === 'Escape') cancelEditMessage();
                            }}
                            className="flex-1 h-8 text-sm"
                            autoFocus
                          />
                          <Button size="sm" onClick={saveEditMessage} variant="ghost" className="h-8 w-8 p-0">
                            <Icon name="Check" size={14} />
                          </Button>
                          <Button size="sm" onClick={cancelEditMessage} variant="ghost" className="h-8 w-8 p-0">
                            <Icon name="X" size={14} />
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm">{msg.text}</p>
                          {msg.isEdited && <span className="text-xs opacity-50 ml-1">(изменено)</span>}
                        </div>
                      )}
                      <p className="text-xs opacity-70 mt-1">
                        {msg.timestamp.toLocaleTimeString('ru-RU', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                    
                    {!msg.isDeleted && (
                      <div className={`flex items-center gap-2 mt-2 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div className="flex gap-1 bg-white border rounded-full px-2 py-1 shadow-sm">
                            {msg.reactions.map((reaction, idx) => (
                              <span key={idx} className="text-sm" title={reaction.sender === 'me' ? 'Вы' : remoteName}>
                                {reaction.emoji}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="relative">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 rounded-full hover:bg-gray-200"
                            onClick={() => setShowEmojiPicker(showEmojiPicker === msg.id ? null : msg.id)}
                          >
                            <Icon name="Smile" size={14} />
                          </Button>
                          {showEmojiPicker === msg.id && (
                            <div className="absolute bottom-full mb-2 bg-white border rounded-lg shadow-lg p-2 flex gap-1 z-10">
                              {['👍', '❤️', '😂', '😮', '😢', '🎉'].map(emoji => (
                                <button
                                  key={emoji}
                                  onClick={() => addReaction(msg.id, emoji)}
                                  className="text-xl hover:scale-125 transition-transform p-1"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        {msg.sender === 'me' && !msg.file && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 rounded-full hover:bg-gray-200"
                              onClick={() => startEditMessage(msg.id, msg.text || '')}
                              title="Редактировать"
                            >
                              <Icon name="Pencil" size={12} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 rounded-full hover:bg-red-100 hover:text-red-600"
                              onClick={() => deleteMessage(msg.id)}
                              title="Удалить"
                            >
                              <Icon name="Trash2" size={12} />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2">
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                onClick={openFileDialog}
                disabled={!isConnected}
                variant="outline"
                size="icon"
                className="border-[0.25px] border-black"
                title="Отправить файл"
              >
                <Icon name="Paperclip" size={16} />
              </Button>
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
                className="border-[0.25px] border-black"
              >
                <Icon name="Send" size={16} />
              </Button>
            </div>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}