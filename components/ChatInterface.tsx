import { socket } from '@/app/config/socket';
import { useEffect } from 'react';

export const ChatInterface = () => {
  useEffect(() => {
    // 确保组件卸载时断开连接
    return () => {
      socket.disconnect();
    };
  }, []);

  // ... 其他代码 ... 
}; 