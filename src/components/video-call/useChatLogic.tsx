interface UseChatLogicProps {
  state: any;
}

export function useChatLogic({ state }: UseChatLogicProps) {
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

  return {
    handleIncomingData,
    sendMessage,
    addReaction,
    startEditMessage,
    saveEditMessage,
    cancelEditMessage,
    deleteMessage,
    handleFileSelect,
    openFileDialog,
  };
}
