import { useState, useEffect } from 'react'
import socketIOClient from 'socket.io-client'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'

interface Message {
  message: string
  type: 'user' | 'assistant' | 'system'
  timestamp?: string
  time_preference?: {
    start_time: string
    end_time: string
    title?: string
  }
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [socket, setSocket] = useState<any>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:5002"
    const newSocket = socketIOClient(wsUrl, {
      transports: ['websocket', 'polling'],  // 允许降级到 polling
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      timeout: 20000,
      forceNew: true
    })

    newSocket.on('connect', () => {
      console.log('WebSocket 连接已建立')
      setIsConnected(true)
      setRetryCount(0)
    })

    newSocket.on('message', (data: Message) => {
      console.log('收到消息:', data)
      setMessages(prev => [...prev, {
        ...data,
        timestamp: data.timestamp || new Date().toISOString()
      }])
    })

    newSocket.on('connect_error', (error: Error) => {
      console.error('WebSocket 连接错误:', error)
      setIsConnected(false)
      setRetryCount(prev => {
        const newCount = prev + 1
        if (newCount <= 10) {  // 最多显示10次重试消息
          setMessages(prev => [...prev, {
            message: `连接失败 (${newCount}/10)，正在重试...`,
            type: 'system',
            timestamp: new Date().toISOString()
          }])
        }
        return newCount
      })
    })

    newSocket.on('disconnect', () => {
      console.log('WebSocket 连接已断开')
      setIsConnected(false)
      setMessages(prev => [...prev, {
        message: '连接已断开，正在尝试重新连接...',
        type: 'system',
        timestamp: new Date().toISOString()
      }])
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !socket || !isConnected) return

    const userMessage: Message = {
      message: inputMessage,
      type: 'user',
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    socket.emit('chat_message', { message: inputMessage })
    setInputMessage('')
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg max-w-[80%] ${
              msg.type === 'user'
                ? 'ml-auto bg-blue-100'
                : msg.type === 'system'
                ? 'mx-auto bg-yellow-100'
                : 'bg-gray-100'
            }`}
          >
            <div className="text-sm">{msg.message}</div>
            {msg.time_preference && (
              <div className="mt-2 text-xs text-blue-600">
                建议时间：{msg.time_preference.start_time} - {msg.time_preference.end_time}
                {msg.time_preference.title && <div>会议：{msg.time_preference.title}</div>}
              </div>
            )}
            {msg.timestamp && (
              <div className="text-xs text-gray-500 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="请描述您的会议需求，例如：帮我安排一个下周三下午的产品评审会议，参与者有产品经理和开发团队..."
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!isConnected}
          >
            {isConnected ? '发送' : '连接中...'}
          </Button>
        </div>
      </div>
    </div>
  )
} 