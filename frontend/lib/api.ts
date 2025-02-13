import axios from "axios"
import io from "socket.io-client"

// 定义接口类型
interface ChatMessage {
  message: string
  type: 'user' | 'assistant' | 'system'
  timestamp?: string
}

interface Meeting {
  id: string
  title: string
  participants: string[]
  startTime: string
  endTime: string
  location?: string
}

interface MeetingData {
  title: string
  participants: string[]
  duration?: string
  location?: string
}

// 定义 WebSocket 消息类型
interface WebSocketMessage {
  message: string
  type: string
  user_id?: string
  time_preference?: {
    start_time: string
    end_time: string
    title?: string
  }
}

interface CoordinationMessage {
  target_user_id: string
  message: string
  type: string
}

// API 基础配置
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
})

// WebSocket 连接管理
let socketInstance: ReturnType<typeof io> | null = null;

// 获取 socket 实例
const getSocket = () => {
  if (!socketInstance) {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:5004";
    socketInstance = io(wsUrl, {
      path: '/ws/socket.io',
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 5000
    });
  }
  return socketInstance;
};

// WebSocket 初始化
export const initializeWebSocket = (
  onMessage: (data: WebSocketMessage) => void,
  onCoordinationMessage: (data: CoordinationMessage) => void
) => {
  const socket = getSocket();
  
  // 只在首次初始化时添加事件监听
  if (socket && !socket.hasListeners('message')) {
    socket.on('connect', () => {
      console.log('WebSocket 连接已建立');
    });

    socket.on('message', (data: WebSocketMessage) => {
      onMessage(data);
    });

    socket.on('coordination_message', (data: CoordinationMessage) => {
      onCoordinationMessage(data);
    });

    socket.on('disconnect', () => {
      console.log('WebSocket 连接已断开');
    });
  }

  return socket;
};

// 发送聊天消息
export const sendChatMessage = async (message: string) => {
  const socket = getSocket();
  if (!socket) {
    throw new Error("WebSocket 未连接");
  }
  socket.emit('chat_message', { message });
};

// 发送模拟用户消息
export const sendMockUserMessage = async (userId: string, message: string) => {
  const socket = getSocket();
  if (!socket) {
    throw new Error("WebSocket 未连接");
  }
  socket.emit('mock_user_message', { user_id: userId, message });
};

// 获取会议列表
export const fetchMeetings = async (): Promise<Meeting[]> => {
  try {
    const response = await api.get("/meetings")
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === "ERR_NETWORK") {
        throw new Error("无法连接到服务器，请检查网络连接或稍后重试。")
      }
      if (error.response) {
        throw new Error(`服务器错误: ${error.response.status}`)
      }
    }
    throw new Error("发生意外错误，请稍后重试。")
  }
}

// 创建会议
export const createMeeting = async (meetingData: MeetingData): Promise<Meeting> => {
  try {
    const response = await api.post("/meetings", meetingData)
    return response.data
  } catch (error) {
    console.error("创建会议失败:", error)
    throw error
  }
}

// 获取模拟用户列表
export const getMockUsers = async () => {
  try {
    const response = await api.get("/api/mock/users")
    return response.data
  } catch (error) {
    console.error("获取模拟用户列表失败:", error)
    throw error
  }
}

// 获取用户日程
export const getUserSchedule = async (userId: string) => {
  try {
    const response = await api.get(`/api/mock/users/${userId}/schedule`)
    return response.data
  } catch (error) {
    console.error("获取用户日程失败:", error)
    throw error
  }
}

// 获取对话历史
export const getConversationHistory = async (userId: string) => {
  try {
    const response = await api.get(`/api/mock/conversation/${userId}`)
    return response.data
  } catch (error) {
    console.error("获取对话历史失败:", error)
    throw error
  }
}

// 结束对话并获取总结
export const endDialogue = async (type: 'user_initiated' | 'system_initiated' = 'user_initiated') => {
  try {
    const response = await api.post('/end_dialogue', { type })
    return response.data
  } catch (error) {
    console.error("结束对话失败:", error)
    throw error
  }
}

// 关闭 WebSocket 连接
export const closeWebSocket = () => {
  if (socketInstance) {
    socketInstance.close();
    socketInstance = null;
  }
};

