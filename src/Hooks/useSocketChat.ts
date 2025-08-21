'use client'
import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify';
import { ChatMessage, Media, Message, UseSocketChatProps, UseSocketChatReturn } from '@/types/chat';
import { useSocketConnection } from '@/context/SocketContext';



export const useSocketChat = ({
  conversationId,
  senderId,
  onMessageReceived,
}: UseSocketChatProps): UseSocketChatReturn => {
  const { isConnected, error: providerError, on, off, emit } = useSocketConnection();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  

  // Join conversation on connect and when already connected
  useEffect(() => {
    if (!conversationId) return;

    const handleConnect = () => {
      emit('joinConversation', conversationId);
      console.log(`Joined conversation ${conversationId}`);
    };

    // If currently connected, join immediately
    if (isConnected) {
      handleConnect();
    }

    // Also re-join on future reconnects
    on('connect', handleConnect);

    return () => {
      off('connect', handleConnect);
    };
  }, [conversationId, isConnected, on, off, emit]);

  // Listen for incoming messages
  useEffect(() => {
    const handleReceiveMessage = (data: ChatMessage) => {
      console.log('message about to be received', data);
      onMessageReceived?.(data);
    };

    on('receiveMessage', handleReceiveMessage);
    return () => {
      off('receiveMessage', handleReceiveMessage);
    };
  }, [on, off, onMessageReceived]);

  // Surface provider connection errors to UI via toast and local state
  useEffect(() => {
    if (providerError) {
      setError(providerError);
      toast.error('Failed to connect to chat server');
    } else {
      setError(null);
    }
  }, [providerError]);

  // Send message function
  const sendMessage = useCallback((message: string | null, media: Media | null) => {
    console.log("message about to be sent", message);
    if (!isConnected) {
      toast.error('Not connected to chat server');
      return;
    }

    try {
      const messageData: Message = {
        conversationId,
        message,
        senderId,
        media: media
      };
      console.log("media-message-sending", messageData)
      emit('sendMessage', messageData);
    } catch (err) {
      setError('Failed to send message');
      toast.error('Failed to send message');
      console.error('Send message error:', err);
    }
  }, [conversationId, senderId, isConnected, emit]);

  return {
    sendMessage,
    isConnected,
    messages,
    error,
  };
}; 