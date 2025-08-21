'use client'
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useSocketConnection } from '@/context/SocketContext';

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
  const { isConnected, error: providerError, on, off, emit } = useSocketConnection();
  const [error, setError] = useState<string | null>(null);

  // Join escrow room on connect and when already connected
  useEffect(() => {
    if (!escrowContractAddress || !token) return;

    const handleConnect = () => {
      emit('joinEscrowRoom', { escrowContractAddress, token });
      console.log(`Joining escrow room ${escrowContractAddress}`);
    };

    if (isConnected) {
      handleConnect();
    }

    on('connect', handleConnect);

    return () => {
      off('connect', handleConnect);
    };
  }, [escrowContractAddress, token, isConnected, on, off, emit]);

  // Escrow-specific events
  useEffect(() => {
    const handleJoined = (data: any) => {
      console.log('Successfully joined escrow room:', data);
    };

    const handleReload = (data: any) => {
      console.log('Reload event received:', data);
      onEventReceived?.(data);
    };

    const handleUnauthorized = (data: any) => {
      const msg = 'Unauthorized: ' + (data?.error ?? 'Not authorized');
      setError(msg);
      toast.error('Authentication failed');
    };

    on('joinedEscrowRoom', handleJoined);
    on('reload', handleReload);
    on('unauthorized', handleUnauthorized);

    return () => {
      off('joinedEscrowRoom', handleJoined);
      off('reload', handleReload);
      off('unauthorized', handleUnauthorized);
    };
  }, [on, off, onEventReceived]);

  // Surface provider connection errors to UI via toast and local state
  useEffect(() => {
    if (providerError) {
      setError(providerError);
      toast.error('Failed to connect to escrow server');
    } else {
      setError(null);
    }
  }, [providerError]);

  return {
    isConnected,
    error,
  };
}; 