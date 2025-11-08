'use client';

import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('✅ Socket.io connected');
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('🔌 Socket.io disconnected');
      setConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.warn('⚠️ Socket.io connection error:', error.message);
      console.log('💡 Backend may not be running - demo mode active');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return { socket, connected };
}
