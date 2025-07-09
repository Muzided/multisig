import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify';
import { ChatMessage, Media, Message, UseSocketChatProps, UseSocketChatReturn } from '@/types/chat';



export const useSocketChat = ({
  conversationId,
  senderId,
  onMessageReceived,
}: UseSocketChatProps): UseSocketChatReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    try {
      // Initialize socket connection
      socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'https://escrow.ipcre8.com', {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      const socket = socketRef.current;

      // Connection event handlers
      socket.on('connect', () => {
        setIsConnected(true);
        setError(null);
        console.log('Socket connected:', socket.id);

        // Join conversation room
        socket.emit('joinConversation', conversationId);
        console.log(`Joined conversation ${conversationId}`);
      });

      socket.on('connect_error', (err) => {
        setError('Connection error: ' + err.message);
        toast.error('Failed to connect to chat server');
      });

      // Message event handlers
      socket.on('receiveMessage', (data: ChatMessage) => {
        console.log("message about to be received", data);
        // Convert Message to ChatMessage format

        // Pass the original Message to the callback
        onMessageReceived?.(data);
      });

      // Disconnection handler
      socket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Socket disconnected');
      });

      // Cleanup function
      return () => {
        if (socket) {
          socket.off('connect');
          socket.off('connect_error');
          socket.off('receiveMessage');
          socket.off('disconnect');
          socket.disconnect();
        }
      };
    } catch (err) {
      setError('Failed to initialize socket connection');
      toast.error('Failed to initialize chat connection');
      console.error('Socket initialization error:', err);
    }
  }, [conversationId, onMessageReceived]);

  // Send message function
  const sendMessage = useCallback((message: string | null, media: Media | null) => {
    console.log("message about to be sent", message);
    if (!socketRef.current || !isConnected) {
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
      socketRef.current.emit('sendMessage', messageData);
    } catch (err) {
      setError('Failed to send message');
      toast.error('Failed to send message');
      console.error('Send message error:', err);
    }
  }, [conversationId, senderId, isConnected]);

  return {
    sendMessage,
    isConnected,
    messages,
    error,
  };
}; 