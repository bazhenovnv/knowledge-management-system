import { useEffect } from 'react';
import Peer from 'peerjs';

interface VideoCallLogicProps {
  state: any;
}

export function useVideoCallLogic(props: VideoCallLogicProps) {
  const { state } = props;

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

  const handleIncomingData = (data: any) => {
    const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
    
    if (parsedData.type === 'name') {
      state.setRemoteName(parsedData.name);
    } else if (parsedData.type === 'message') {
      state.setMessages((prev: any[]) => [...prev, { 
        text: parsedData.text, 
        sender: 'peer', 
        timestamp: new Date(),
        reactions: [],
        id: parsedData.id
      }]);
    } else if (parsedData.type === 'reaction') {
      state.setMessages((prev: any[]) => prev.map((msg: any) => 
        msg.id === parsedData.messageId
          ? { ...msg, reactions: parsedData.reactions }
          : msg
      ));
    } else if (parsedData.type === 'edit') {
      state.setMessages((prev: any[]) => prev.map((msg: any) => 
        msg.id === parsedData.messageId
          ? { ...msg, text: parsedData.text, isEdited: true }
          : msg
      ));
    } else if (parsedData.type === 'delete') {
      state.setMessages((prev: any[]) => prev.map((msg: any) => 
        msg.id === parsedData.messageId
          ? { ...msg, isDeleted: true, text: undefined, file: undefined }
          : msg
      ));
    } else if (parsedData.type === 'file') {
      const blob = new Blob([parsedData.data], { type: parsedData.fileType });
      const url = URL.createObjectURL(blob);
      
      state.setMessages((prev: any[]) => [...prev, {
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

  const startCall = async () => {
    if (!state.peer || !state.remotePeerId) {
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
      
      state.setStream(mediaStream);
      if (state.localVideoRef.current) {
        state.localVideoRef.current.srcObject = mediaStream;
      }

      const outgoingCall = state.peer.call(state.remotePeerId, mediaStream);
      state.setCall(outgoingCall);
      state.setIsCalling(true);

      state.setCallDuration(0);
      state.callTimerRef.current = window.setInterval(() => {
        state.setCallDuration((prev: number) => prev + 1);
      }, 1000);

      outgoingCall.on('stream', (remoteStream: MediaStream) => {
        if (state.remoteVideoRef.current) {
          state.remoteVideoRef.current.srcObject = remoteStream;
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
    if (state.call) {
      state.call.close();
    }
    if (state.stream) {
      state.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      state.setStream(null);
    }
    if (state.screenStream) {
      state.screenStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      state.setScreenStream(null);
    }
    if (state.callTimerRef.current) {
      clearInterval(state.callTimerRef.current);
      state.callTimerRef.current = null;
    }
    if (state.mediaRecorder && state.mediaRecorder.state !== 'inactive') {
      state.mediaRecorder.stop();
    }
    state.setCall(null);
    state.setIsCalling(false);
    state.setCallDuration(0);
    state.setIsScreenSharing(false);
    state.setIsRecording(false);
    state.setMediaRecorder(null);
    state.setRecordedChunks([]);
  };

  const toggleVideo = () => {
    if (state.stream) {
      const videoTrack = state.stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        state.setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (state.stream) {
      const audioTrack = state.stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        state.setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const startRecording = () => {
    if (!state.stream) return;

    try {
      const options = { mimeType: 'video/webm; codecs=vp9' };
      let recorder: MediaRecorder;

      try {
        recorder = new MediaRecorder(state.stream, options);
      } catch (e) {
        const fallbackOptions = { mimeType: 'video/webm' };
        recorder = new MediaRecorder(state.stream, fallbackOptions);
      }

      state.recordedChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          state.recordedChunksRef.current.push(event.data);
          state.setRecordedChunks([...state.recordedChunksRef.current]);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(state.recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `video-call-${new Date().getTime()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      };

      recorder.start(1000);
      state.setMediaRecorder(recorder);
      state.setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Не удалось начать запись');
    }
  };

  const stopRecording = () => {
    if (state.mediaRecorder && state.mediaRecorder.state !== 'inactive') {
      state.mediaRecorder.stop();
      state.setMediaRecorder(null);
      state.setIsRecording(false);
    }
  };

  const acceptCall = async () => {
    if (!state.incomingCall) return;

    if (state.ringtoneRef.current) {
      state.ringtoneRef.current.pause();
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
      
      state.setStream(mediaStream);
      if (state.localVideoRef.current) {
        state.localVideoRef.current.srcObject = mediaStream;
      }

      state.incomingCall.answer(mediaStream);
      state.setCall(state.incomingCall);
      state.setIsCalling(true);
      state.setIncomingCall(null);

      if (state.ringtoneRef.current) {
        state.ringtoneRef.current.pause();
        state.ringtoneRef.current.currentTime = 0;
      }

      state.setCallDuration(0);
      state.callTimerRef.current = window.setInterval(() => {
        state.setCallDuration((prev: number) => prev + 1);
      }, 1000);

      state.incomingCall.on('stream', (remoteStream: MediaStream) => {
        console.log('Получен поток от звонящего');
        if (state.remoteVideoRef.current) {
          state.remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      state.incomingCall.on('error', (error: Error) => {
        console.error('Ошибка входящего звонка:', error);
        alert('Ошибка во время звонка');
        endCall();
      });

      state.incomingCall.on('close', () => {
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
    if (state.incomingCall) {
      state.incomingCall.close();
      state.setIncomingCall(null);
    }
    if (state.ringtoneRef.current) {
      state.ringtoneRef.current.pause();
      state.ringtoneRef.current.currentTime = 0;
    }
  };

  const toggleScreenShare = async () => {
    if (!state.call) return;

    if (state.isScreenSharing) {
      if (state.screenStream) {
        state.screenStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        state.setScreenStream(null);
      }

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        state.setStream(mediaStream);
        if (state.localVideoRef.current) {
          state.localVideoRef.current.srcObject = mediaStream;
        }

        const videoTrack = mediaStream.getVideoTracks()[0];
        const sender = state.call.peerConnection.getSenders().find((s: RTCRtpSender) => s.track?.kind === 'video');
        if (sender && videoTrack) {
          await sender.replaceTrack(videoTrack);
        }
      } catch (error) {
        console.error('Error switching back to camera:', error);
      }

      state.setIsScreenSharing(false);
    } else {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true, 
          audio: false 
        });
        
        state.setScreenStream(displayStream);
        if (state.localVideoRef.current) {
          state.localVideoRef.current.srcObject = displayStream;
        }

        const screenTrack = displayStream.getVideoTracks()[0];
        const sender = state.call.peerConnection.getSenders().find((s: RTCRtpSender) => s.track?.kind === 'video');
        if (sender && screenTrack) {
          await sender.replaceTrack(screenTrack);
        }

        screenTrack.onended = () => {
          toggleScreenShare();
        };

        state.setIsScreenSharing(true);
      } catch (error) {
        console.error('Error starting screen share:', error);
        alert('Не удалось начать демонстрацию экрана');
      }
    }
  };

  const sendMessage = () => {
    if (!state.connection || !state.messageInput.trim()) return;

    const messageId = Math.random().toString(36).substring(2, 15);
    state.connection.send(JSON.stringify({ type: 'message', text: state.messageInput, id: messageId }));
    state.setMessages((prev: any[]) => [...prev, { 
      text: state.messageInput, 
      sender: 'me', 
      timestamp: new Date(),
      reactions: [],
      id: messageId
    }]);
    state.setMessageInput('');
  };

  const addReaction = (messageId: string, emoji: string) => {
    if (!state.connection) return;

    state.setMessages((prev: any[]) => prev.map((msg: any) => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions?.find((r: any) => r.sender === 'me');
        let newReactions: { emoji: string; sender: 'me' | 'peer' }[];
        
        if (existingReaction) {
          if (existingReaction.emoji === emoji) {
            newReactions = msg.reactions?.filter((r: any) => r.sender !== 'me') || [];
          } else {
            newReactions = msg.reactions?.map((r: any) => 
              r.sender === 'me' ? { ...r, emoji } : r
            ) || [];
          }
        } else {
          newReactions = [...(msg.reactions || []), { emoji, sender: 'me' }];
        }

        state.connection.send(JSON.stringify({
          type: 'reaction',
          messageId,
          reactions: newReactions
        }));

        return { ...msg, reactions: newReactions };
      }
      return msg;
    }));

    state.setShowEmojiPicker(null);
  };

  const startEditMessage = (messageId: string, text: string) => {
    state.setEditingMessageId(messageId);
    state.setEditingText(text);
    state.setShowEmojiPicker(null);
  };

  const saveEditMessage = () => {
    if (!state.connection || !state.editingMessageId || !state.editingText.trim()) return;

    state.connection.send(JSON.stringify({
      type: 'edit',
      messageId: state.editingMessageId,
      text: state.editingText
    }));

    state.setMessages((prev: any[]) => prev.map((msg: any) => 
      msg.id === state.editingMessageId
        ? { ...msg, text: state.editingText, isEdited: true }
        : msg
    ));

    state.setEditingMessageId(null);
    state.setEditingText('');
  };

  const cancelEditMessage = () => {
    state.setEditingMessageId(null);
    state.setEditingText('');
  };

  const deleteMessage = (messageId: string) => {
    if (!state.connection) return;

    state.connection.send(JSON.stringify({
      type: 'delete',
      messageId
    }));

    state.setMessages((prev: any[]) => prev.map((msg: any) => 
      msg.id === messageId
        ? { ...msg, isDeleted: true, text: undefined, file: undefined }
        : msg
    ));
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !state.connection) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const messageId = Math.random().toString(36).substring(2, 15);
      state.connection.send(JSON.stringify({
        type: 'file',
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        data: Array.from(uint8Array),
        id: messageId
      }));

      const url = URL.createObjectURL(file);
      state.setMessages((prev: any[]) => [...prev, {
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

      if (state.fileInputRef.current) {
        state.fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Ошибка при отправке файла:', error);
      alert('Не удалось отправить файл');
    }
  };

  const openFileDialog = () => {
    state.fileInputRef.current?.click();
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
    startCall,
    endCall,
    toggleVideo,
    toggleAudio,
    startRecording,
    stopRecording,
    acceptCall,
    rejectCall,
    toggleScreenShare,
    sendMessage,
    addReaction,
    startEditMessage,
    saveEditMessage,
    cancelEditMessage,
    deleteMessage,
    handleFileSelect,
    openFileDialog,
    copyRoomLink,
    handleNameEdit,
  };
}
