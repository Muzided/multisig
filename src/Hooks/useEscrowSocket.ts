import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify';

interface UseEscrowSocketProps {
  escrowContractAddress: string;
  token: string;
  onEventReceived: (data?: any) => void;
}

interface UseEscrowSocketReturn {
  isConnected: boolean;
  error: string | null;
}

export const useEscrowSocket = ({
  escrowContractAddress,
  token,
  onEventReceived,
}: UseEscrowSocketProps): UseEscrowSocketReturn => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!escrowContractAddress || !token) {
      console.log('Socket not initialized: missing escrowContractAddress or token');
      return;
    }

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

        // Join escrow room
        socket.emit('joinEscrowRoom', { escrowContractAddress, token });
        console.log(`Joining escrow room ${escrowContractAddress}`);
      });

      socket.on('joinedEscrowRoom', (data) => {
        console.log('Successfully joined escrow room:', data);
      });

      socket.on('connect_error', (err) => {
        setError('Connection error: ' + err.message);
        toast.error('Failed to connect to escrow server');
      });

      socket.on('unauthorized', (data) => {
        setError('Unauthorized: ' + data.error);
        toast.error('Authentication failed');
      });

      // Listen for reload event that should trigger refresh
      socket.on('reload', (data) => {
        console.log('Reload event received:', data);
        onEventReceived(data);
      });

      // Disconnection handler
      socket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Socket disconnected');
      });

      // Cleanup function
      return () => {
        if (socket) {
          console.log('Cleaning up socket connection');
          socket.off('connect');
          socket.off('joinedEscrowRoom');
          socket.off('connect_error');
          socket.off('unauthorized');
          socket.off('reload');
          socket.off('disconnect');
          socket.disconnect();
        }
      };
    } catch (err) {
      setError('Failed to initialize socket connection');
      toast.error('Failed to initialize escrow connection');
      console.error('Socket initialization error:', err);
    }
  }, [escrowContractAddress, token, onEventReceived]);

  return {
    isConnected,
    error,
  };
}; 