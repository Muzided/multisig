import { useEffect, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSocketConnection } from '@/context/SocketContext'

interface UseDisputeRoomListenerOptions {
  enabled?: boolean
  token?: string
}

export function useDisputeRoomListener(
  disputeContractAddresses: string[] | undefined,
  options?: UseDisputeRoomListenerOptions
) {
  const { on, off, emit, isConnected } = useSocketConnection()
  const queryClient = useQueryClient()

  const enabled = options?.enabled ?? true
  const token = options?.token ?? (typeof window !== 'undefined' ? localStorage.getItem('token') ?? undefined : undefined)

  const uniqueAddresses = useMemo(
    () => Array.from(new Set((disputeContractAddresses ?? []).filter(Boolean))),
    [disputeContractAddresses]
  )

  // Join all dispute rooms once connected and whenever the set of addresses changes
  useEffect(() => {
    if (!enabled || uniqueAddresses.length === 0 || !token) return

    const joinAllRooms = () => {
      uniqueAddresses.forEach((address) => {
        emit('joinDisputeRoom', { disputeContractAddress: address, token })
      })
    }

    if (isConnected) {
      joinAllRooms()
    }

    on('connect', joinAllRooms)
    return () => {
      off('connect', joinAllRooms)
    }
  }, [enabled, uniqueAddresses, token, isConnected, on, off, emit])

  // Listen for reload events and refetch "my-escrows" when action is voted
  useEffect(() => {
    if (!enabled) return

    const handleReload = (payload: any) => {
      if (payload?.action === 'decision_initiated') {
        queryClient.invalidateQueries({ queryKey: ['userdisputes'] })
      }
    }

    on('reload', handleReload)
    return () => {
      off('reload', handleReload)
    }
  }, [enabled, on, off, queryClient])
}


