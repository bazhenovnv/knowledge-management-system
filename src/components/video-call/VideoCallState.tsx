import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Peer, { DataConnection, MediaConnection } from 'peerjs';
import { Message, Participant } from './types';
import { generateAvatar } from './videoCallUtils';

export function useVideoCallState() {
  const [searchParams] = useSearchParams();
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return {
    roomId,
    myPeerId,
    setMyPeerId,
    remotePeerId,
    setRemotePeerId,
    peer,
    setPeer,
    connection,
    setConnection,
    call,
    setCall,
    messages,
    setMessages,
    messageInput,
    setMessageInput,
    isConnected,
    setIsConnected,
    isCalling,
    setIsCalling,
    stream,
    setStream,
    roomUrl,
    setRoomUrl,
    isVideoEnabled,
    setIsVideoEnabled,
    isAudioEnabled,
    setIsAudioEnabled,
    isScreenSharing,
    setIsScreenSharing,
    screenStream,
    setScreenStream,
    isRecording,
    setIsRecording,
    mediaRecorder,
    setMediaRecorder,
    recordedChunks,
    setRecordedChunks,
    callDuration,
    setCallDuration,
    incomingCall,
    setIncomingCall,
    callerPeerId,
    setCallerPeerId,
    participants,
    setParticipants,
    myName,
    setMyName,
    isEditingName,
    setIsEditingName,
    tempName,
    setTempName,
    remoteName,
    setRemoteName,
    showEmojiPicker,
    setShowEmojiPicker,
    editingMessageId,
    setEditingMessageId,
    editingText,
    setEditingText,
    fileInputRef,
    localVideoRef,
    remoteVideoRef,
    messagesEndRef,
    recordedChunksRef,
    callTimerRef,
    ringtoneRef,
  };
}
