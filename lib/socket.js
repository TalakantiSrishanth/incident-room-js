'use client';
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io({ path: '/api/socketio', transports: ['websocket', 'polling'] });
  }
  return socket;
}

export function useSocket() {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = getSocket();
    return () => {};
  }, []);

  return socketRef.current;
}
