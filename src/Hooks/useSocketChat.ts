import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify';

interface Message {
  conversationId: string;
  message: string;
  senderId: string;
  timestamp?: string;
}

interface UseSocketChatProps {
  conversationId: string;
  senderId: string;
  onMessageReceived?: (message: Message) => void;
}

interface UseSocketChatReturn {
  sendMessage: (message: string) => void;
  isConnected: boolean;
  messages: Message[];
  error: string | null;
}

export const useSocketChat = ({
  conversationId,
  senderId,
  onMessageReceived,
}: UseSocketChatProps): UseSocketChatReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    try {
      // Initialize socket connection
      socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
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
      socket.on('receiveMessage', (data: Message) => {
        setMessages(prev => [...prev, data]);
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
  const sendMessage = useCallback((message: string) => {
    if (!socketRef.current || !isConnected) {
      toast.error('Not connected to chat server');
      return;
    }

    try {
      const messageData: Message = {
        conversationId,
        message,
        senderId,
        timestamp: new Date().toISOString(),
      };

      socketRef.current.emit('sendMessage', messageData);
      
      // Optimistically add message to local state
      setMessages(prev => [...prev, messageData]);
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