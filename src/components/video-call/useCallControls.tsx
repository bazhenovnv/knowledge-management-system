interface UseCallControlsProps {
  state: any;
}

export function useCallControls({ state }: UseCallControlsProps) {
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

  return {
    startCall,
    endCall,
    toggleVideo,
    toggleAudio,
    startRecording,
    stopRecording,
    acceptCall,
    rejectCall,
    toggleScreenShare,
  };
}
