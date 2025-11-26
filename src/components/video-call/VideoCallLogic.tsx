import { usePeerConnection } from './usePeerConnection';
import { useCallControls } from './useCallControls';
import { useChatLogic } from './useChatLogic';

interface VideoCallLogicProps {
  state: any;
}

export function useVideoCallLogic(props: VideoCallLogicProps) {
  const { state } = props;

  const chatLogic = useChatLogic({ state });
  const peerConnection = usePeerConnection({ state, handleIncomingData: chatLogic.handleIncomingData });
  const callControls = useCallControls({ state });

  return {
    connectToPeer: peerConnection.connectToPeer,
    startCall: callControls.startCall,
    endCall: callControls.endCall,
    toggleVideo: callControls.toggleVideo,
    toggleAudio: callControls.toggleAudio,
    startRecording: callControls.startRecording,
    stopRecording: callControls.stopRecording,
    acceptCall: callControls.acceptCall,
    rejectCall: callControls.rejectCall,
    toggleScreenShare: callControls.toggleScreenShare,
    sendMessage: chatLogic.sendMessage,
    addReaction: chatLogic.addReaction,
    startEditMessage: chatLogic.startEditMessage,
    saveEditMessage: chatLogic.saveEditMessage,
    cancelEditMessage: chatLogic.cancelEditMessage,
    deleteMessage: chatLogic.deleteMessage,
    handleFileSelect: chatLogic.handleFileSelect,
    openFileDialog: chatLogic.openFileDialog,
    copyRoomLink: peerConnection.copyRoomLink,
    handleNameEdit: peerConnection.handleNameEdit,
  };
}
