import { useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

/**
 * Custom React Hook for Socket.IO client integration
 * Provides smooth real-time updates with auto-reconnection
 */
export function useSocket() {
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const socketRef = useRef(null);
  const listenersRef = useRef(new Map());

  useEffect(() => {
    // Initialize Socket.IO client
    const socket = io('ws://localhost:3001', {
      reconnection: true,
      reconnectionDelay: 1000, // Start with 1 second
      reconnectionDelayMax: 10000, // Max 10 seconds
      reconnectionAttempts: Infinity,
      transports: ['websocket', 'polling'], // Websocket first, fallback to polling
      timeout: 20000,
      autoConnect: true,
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('✅ Socket.IO connected:', socket.id);
      setConnectionStatus('connected');
      setReconnectAttempts(0);
      
      // Show brief success notification if this was a reconnection
      if (reconnectAttempts > 0) {
        console.log('✅ Reconnected successfully!');
        // You can trigger a toast notification here
      }
    });

    socket.on('connecting', () => {
      console.log('⏳ Socket.IO connecting...');
      setConnectionStatus('connecting');
    });

    socket.on('disconnect', (reason) => {
      console.log('🔴 Socket.IO disconnected:', reason);
      setConnectionStatus('disconnected');
      
      if (reason === 'io server disconnect') {
        // Server disconnected us, need to manually reconnect
        socket.connect();
      }
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt #${attemptNumber}...`);
      setReconnectAttempts(attemptNumber);
      setConnectionStatus('connecting');
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
      setConnectionStatus('connected');
      setReconnectAttempts(0);
    });

    socket.on('reconnect_error', (error) => {
      console.error('❌ Reconnection error:', error.message);
    });

    socket.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed after maximum attempts');
      setConnectionStatus('disconnected');
    });

    socket.on('error', (error) => {
      console.error('❌ Socket.IO error:', error);
      // Don't crash app, just log and continue
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message);
      setConnectionStatus('disconnected');
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once on mount

  // Emit event to server
  const emit = useCallback((eventName, data) => {
    try {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit(eventName, data);
        console.log(`📤 Emitted '${eventName}':`, data);
        return true;
      } else {
        console.warn(`⚠️ Cannot emit '${eventName}' - socket not connected`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Error emitting '${eventName}':`, error);
      return false;
    }
  }, []);

  // Listen for events from server
  const on = useCallback((eventName, callback) => {
    try {
      if (socketRef.current) {
        // Remove existing listener if any
        if (listenersRef.current.has(eventName)) {
          socketRef.current.off(eventName, listenersRef.current.get(eventName));
        }

        // Wrap callback with error handling
        const wrappedCallback = (...args) => {
          try {
            console.log(`📥 Received '${eventName}':`, args);
            callback(...args);
          } catch (error) {
            console.error(`❌ Error in '${eventName}' handler:`, error);
          }
        };

        socketRef.current.on(eventName, wrappedCallback);
        listenersRef.current.set(eventName, wrappedCallback);
        console.log(`👂 Listening for '${eventName}'`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`❌ Error setting up listener for '${eventName}':`, error);
      return false;
    }
  }, []);

  // Stop listening for event
  const off = useCallback((eventName) => {
    try {
      if (socketRef.current && listenersRef.current.has(eventName)) {
        const callback = listenersRef.current.get(eventName);
        socketRef.current.off(eventName, callback);
        listenersRef.current.delete(eventName);
        console.log(`🔇 Stopped listening for '${eventName}'`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`❌ Error removing listener for '${eventName}':`, error);
      return false;
    }
  }, []);

  // Manually disconnect
  const disconnect = useCallback(() => {
    try {
      if (socketRef.current) {
        socketRef.current.disconnect();
        setConnectionStatus('disconnected');
        console.log('🔌 Manually disconnected');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error disconnecting:', error);
      return false;
    }
  }, []);

  // Check if connected
  const isConnected = useCallback(() => {
    return socketRef.current && socketRef.current.connected;
  }, []);

  // Get connection status with emoji
  const getStatusDisplay = useCallback(() => {
    switch (connectionStatus) {
      case 'connected':
        return '🟢 Connected';
      case 'connecting':
        return reconnectAttempts > 0 
          ? `⏳ Reconnecting... (attempt #${reconnectAttempts})`
          : '⏳ Connecting...';
      case 'disconnected':
        return '🔴 Disconnected';
      default:
        return '⏳ Connecting...';
    }
  }, [connectionStatus, reconnectAttempts]);

  return {
    socket: socketRef.current,
    connectionStatus,
    statusDisplay: getStatusDisplay(),
    reconnectAttempts,
    isConnected: isConnected(),
    emit,
    on,
    off,
    disconnect,
  };
}

export default useSocket;
