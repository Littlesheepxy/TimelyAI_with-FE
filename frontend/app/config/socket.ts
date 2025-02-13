import { Socket } from 'socket.io-client';
import socketIOClient from 'socket.io-client';

export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';

export const socket: Socket = socketIOClient(SOCKET_URL, {
  transports: ['polling', 'websocket'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  withCredentials: false,
  path: '/socket.io',
  timeout: 60000,
  forceNew: true,
  upgrade: true,
  rememberUpgrade: true
});

// 添加连接状态日志
socket.on('connect_error', (error) => {
  console.log('Connection Error Details:', {
    message: error.message,
    type: error.type,
    description: error.description,
    url: SOCKET_URL
  });
});

socket.on('connect', () => {
  console.log('Socket Connected Successfully to:', SOCKET_URL);
});

socket.on('disconnect', (reason) => {
  console.log('Socket Disconnected:', reason);
});

socket.on('error', (error) => {
  console.log('Socket Error:', error);
});

// 导出 socket 实例
export default socket; 