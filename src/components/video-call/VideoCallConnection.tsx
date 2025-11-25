import { useEffect, useRef } from 'react';
import Peer, { DataConnection, MediaConnection } from 'peerjs';
import { Message } from './types';

interface VideoCallConnectionProps {
  roomId: string | null;
  myName: string;
  setMyPeerId: (id: string) => void;
  setPeer: (peer: Peer) => void;
  setConnection: (conn: DataConnection | null) => void;
  setIsConnected: (connected: boolean) => void;
  setIncomingCall: (call: MediaConnection | null) => void;
  setCallerPeerId: (id: string) => void;
  setRemotePeerId: (id: string) => void;
  setRoomUrl: (url: string) => void;
  setRemoteName: (name: string) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  ringtoneRef: React.MutableRefObject<HTMLAudioElement | null>;
  stream: MediaStream | null;
  callTimerRef: React.MutableRefObject<number | null>;
}

export const VideoCallConnection = ({
  roomId,
  myName,
  setMyPeerId,
  setPeer,
  setConnection,
  setIsConnected,
  setIncomingCall,
  setCallerPeerId,
  setRemotePeerId,
  setRoomUrl,
  setRemoteName,
  setMessages,
  ringtoneRef,
  stream,
  callTimerRef
}: VideoCallConnectionProps) => {
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

  const connectToPeerById = (peerId: string, peerInstance: Peer) => {
    if (!peerInstance || !peerId) {
      console.error('Нет активного peer или ID для подключения');
      return;
    }

    try {
      const conn = peerInstance.connect(peerId, { reliable: true });
      
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

  return null;
};
