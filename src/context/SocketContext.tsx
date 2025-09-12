'use client'

import React, { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useUser } from './userContext'
import { toast } from 'react-toastify'

interface SocketContextType {
	socket: Socket | null
	isConnected: boolean
	error: string | null
	on: (event: string, callback: (...args: any[]) => void) => void
	off: (event: string, callback?: (...args: any[]) => void) => void
	emit: (event: string, ...args: any[]) => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

interface SocketProviderProps {
	children: ReactNode
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
	const { getToken } = useUser()
	const [isConnected, setIsConnected] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const socketRef = useRef<Socket | null>(null)

	useEffect(() => {
		// Ensure we only initialize on the client
		if (typeof window === 'undefined') return

		try {
			const token = getToken()
			if (!token) {
				toast('No authentication token found')
				return
			}
			const url = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'
			socketRef.current = io(url, {
				auth: {
					token: token 
				},
				reconnection: true,
				reconnectionAttempts: 5,
				reconnectionDelay: 1000,
				transports: ['websocket']
			})

			const socket = socketRef.current

			socket.on('connect', () => {
				setIsConnected(true)
				setError(null)
			})

			socket.on('connect_error', (err) => {
				setError('Connection error: ' + err.message)
			})

			socket.on('disconnect', () => {
				setIsConnected(false)
			})

			return () => {
				if (!socket) return
				socket.off('connect')
				socket.off('connect_error')
				socket.off('disconnect')
				socket.disconnect()
				socketRef.current = null
			}
		} catch (err) {
			setError('Failed to initialize socket connection')
			console.error('SocketProvider initialization error:', err)
		}
	}, [])

	const on = useCallback((event: string, callback: (...args: any[]) => void) => {
		socketRef.current?.on(event, callback)
	}, [])

	const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
		if (!socketRef.current) return
		if (callback) {
			socketRef.current.off(event, callback)
		} else {
			// Remove all listeners for the event
			socketRef.current.removeAllListeners(event)
		}
	}, [])

	const emit = useCallback((event: string, ...args: any[]) => {
		socketRef.current?.emit(event, ...args)
	}, [])

	return (
		<SocketContext.Provider
			value={{
				socket: socketRef.current,
				isConnected,
				error,
				on,
				off,
				emit
			}}
		>
			{children}
		</SocketContext.Provider>
	)
}

export function useSocketConnection(): SocketContextType {
	const context = useContext(SocketContext)
	if (context === undefined) {
		throw new Error('useSocketConnection must be used within a SocketProvider')
	}
	return context
}


