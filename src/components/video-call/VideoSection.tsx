import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { VideoControls } from './VideoControls';
import { ChatMessage } from './ChatMessage';
import { formatCallDuration, formatFileSize } from './videoCallUtils';

interface VideoSectionProps {
  state: any;
  logic: any;
}

export function VideoSection({ state, logic }: VideoSectionProps) {
  return (
    <div className="lg:col-span-2 space-y-4">
      <Card className="p-4">
        <div className="aspect-video bg-gray-900 rounded-lg relative overflow-hidden">
          <video
            ref={state.remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <video
            ref={state.localVideoRef}
            autoPlay
            playsInline
            muted
            className="absolute bottom-4 right-4 w-48 h-36 object-cover rounded-lg border-2 border-white shadow-lg"
          />
          
          {state.isCalling && (
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {formatCallDuration(state.callDuration)}
            </div>
          )}
          
          {!state.isCalling && (
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
            isCalling={state.isCalling}
            isVideoEnabled={state.isVideoEnabled}
            isAudioEnabled={state.isAudioEnabled}
            isScreenSharing={state.isScreenSharing}
            isRecording={state.isRecording}
            onToggleVideo={logic.toggleVideo}
            onToggleAudio={logic.toggleAudio}
            onToggleScreenShare={logic.toggleScreenShare}
            onStartRecording={logic.startRecording}
            onStopRecording={logic.stopRecording}
            onEndCall={logic.endCall}
          />
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-3 text-gray-800">Чат</h3>
        <div className="h-64 overflow-y-auto mb-3 bg-gray-50 rounded-lg p-3">
          {state.messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              <p>Нет сообщений</p>
            </div>
          ) : (
            state.messages.map((message: any) => (
              <ChatMessage
                key={message.id}
                message={message}
                showEmojiPicker={state.showEmojiPicker}
                editingMessageId={state.editingMessageId}
                editingText={state.editingText}
                onShowEmojiPicker={state.setShowEmojiPicker}
                onAddReaction={logic.addReaction}
                onStartEdit={logic.startEditMessage}
                onSaveEdit={logic.saveEditMessage}
                onCancelEdit={logic.cancelEditMessage}
                onDelete={logic.deleteMessage}
                onEditingTextChange={state.setEditingText}
                formatFileSize={formatFileSize}
              />
            ))
          )}
          <div ref={state.messagesEndRef} />
        </div>
        <div className="flex gap-2">
          <Input
            value={state.messageInput}
            onChange={(e) => state.setMessageInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && logic.sendMessage()}
            placeholder="Введите сообщение..."
            disabled={!state.isConnected}
            className="flex-1"
          />
          <input
            ref={state.fileInputRef}
            type="file"
            onChange={logic.handleFileSelect}
            className="hidden"
          />
          <Button
            onClick={logic.openFileDialog}
            variant="outline"
            disabled={!state.isConnected}
          >
            <Icon name="Paperclip" size={20} />
          </Button>
          <Button onClick={logic.sendMessage} disabled={!state.isConnected}>
            <Icon name="Send" size={20} />
          </Button>
        </div>
      </Card>
    </div>
  );
}
