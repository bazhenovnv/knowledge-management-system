import { useEffect } from 'react';
import Peer from 'peerjs';

interface UsePeerConnectionProps {
  state: any;
  handleIncomingData: (data: any) => void;
}

export function usePeerConnection({ state, handleIncomingData }: UsePeerConnectionProps) {
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
      state.setMyPeerId(id);
      console.log('My peer ID:', id);

      if (state.roomId && state.roomId !== id) {
        state.setRemotePeerId(state.roomId);
        setTimeout(() => {
          connectToPeerById(state.roomId, newPeer);
        }, 500);
      } else if (!state.roomId) {
        const url = `${window.location.origin}/video-call?room=${id}`;
        state.setRoomUrl(url);
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
      state.setConnection(conn);
      state.setIsConnected(true);
      
      conn.on('data', (data) => {
        handleIncomingData(data);
      });

      conn.on('open', () => {
        conn.send(JSON.stringify({ type: 'name', name: state.myName }));
      });

      conn.on('error', (error) => {
        console.error('Connection error:', error);
      });

      conn.on('close', () => {
        state.setIsConnected(false);
        state.setConnection(null);
      });
    });

    newPeer.on('call', (mediaConnection) => {
      state.setIncomingCall(mediaConnection);
      state.setCallerPeerId(mediaConnection.peer);
      
      if (!state.ringtoneRef.current) {
        state.ringtoneRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSyBzvLXiTYIG2m98OScTgwOUKXh8LRkGwU7k9jz0I0yBSV9z/HZljgJElyx6OyrWBELTKXh8bllHAU2jdXxxH0pBSh+zvDaj0EKGGG26+maUQ0NTqTg8bVnHwU7k9jz0I0yBSV9z/HZljgJElyx6OyrWBELTKXh8bllHAU2jdXxxH0pBSh+zvDaj0EKGGG26+maUQ0NTqTg8bVnHwU7k9jz0I0yBSV9z/HZljgJElyx6OyrWBELTKXh8bllHAU2jdXxxH0pBSh+zvDaj0EKGGG26+maUQ0NTqTg8bVnHwU7k9jz0I0yBSV9z/HZljgJElyx6OyrWBELTKXh8bllHAU2jdXxxH0pBSh+zvDaj0EKGGG26+maUQ0NTqTg8bVnHwU7k9jz');
        state.ringtoneRef.current.loop = true;
      }
      state.ringtoneRef.current.play().catch((e: Error) => console.error('Ringtone play error:', e));
    });

    state.setPeer(newPeer);

    return () => {
      if (state.ringtoneRef.current) {
        state.ringtoneRef.current.pause();
        state.ringtoneRef.current = null;
      }
      if (state.stream) {
        state.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }
      if (state.callTimerRef.current) {
        clearInterval(state.callTimerRef.current);
      }
      newPeer.destroy();
    };
  }, []);

  const connectToPeerById = (peerId: string, peerInstance?: Peer) => {
    const activePeer = peerInstance || state.peer;
    if (!activePeer || !peerId) {
      console.error('Нет активного peer или ID для подключения');
      return;
    }

    try {
      const conn = activePeer.connect(peerId, { reliable: true });
      
      conn.on('open', () => {
        state.setConnection(conn);
        state.setIsConnected(true);
        console.log('Соединение установлено с:', peerId);
        conn.send(JSON.stringify({ type: 'name', name: state.myName }));
      });

      conn.on('data', (data) => {
        handleIncomingData(data);
      });

      conn.on('error', (error) => {
        console.error('Ошибка подключения:', error);
        alert('Не удалось подключиться к собеседнику. Проверьте ID комнаты.');
      });

      conn.on('close', () => {
        state.setIsConnected(false);
        state.setConnection(null);
        console.log('Соединение закрыто');
      });
    } catch (error) {
      console.error('Ошибка при создании подключения:', error);
      alert('Не удалось создать подключение');
    }
  };

  const connectToPeer = () => {
    connectToPeerById(state.remotePeerId);
  };

  const copyRoomLink = () => {
    const url = state.roomUrl || `${window.location.origin}/video-call?room=${state.myPeerId}`;
    navigator.clipboard.writeText(url);
    alert('Ссылка скопирована! Отправьте её собеседнику для начала звонка.');
  };

  const handleNameEdit = () => {
    if (!state.isEditingName) {
      state.setTempName(state.myName);
      state.setIsEditingName(true);
    } else {
      if (state.tempName.trim()) {
        state.setMyName(state.tempName.trim());
        localStorage.setItem('userName', state.tempName.trim());
        if (state.connection) {
          state.connection.send(JSON.stringify({ type: 'name', name: state.tempName.trim() }));
        }
      }
      state.setIsEditingName(false);
    }
  };

  return {
    connectToPeer,
    copyRoomLink,
    handleNameEdit,
  };
}
