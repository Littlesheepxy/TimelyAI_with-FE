import React, { useState, useEffect } from 'react';
import { Input, Button, Card } from 'antd';
import axios from 'axios';
import './ChatDialog.css';

function ChatDialog({ onDialogComplete }) {
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [dialogueComplete, setDialogueComplete] = useState(false);

    useEffect(() => {
        // 添加初始欢迎消息
        setMessages([{
            type: 'assistant',
            content: '你好！我是你的智能会议助手。我可以帮你：\n1. 安排新的会议\n2. 修改已有会议\n3. 查询会议信息\n请告诉我你需要什么帮助？'
        }]);
    }, []);

    const sendMessage = async () => {
        if (!userInput.trim()) return;

        try {
            // 添加用户消息
            setMessages(prev => [...prev, {
                type: 'user',
                content: userInput
            }]);

            // 发送请求到后端
            const response = await axios.post('/chat', {
                message: userInput,
                type: 'user_initiated'
            });

            if (response.data.status === 'success') {
                // 添加助手回复
                setMessages(prev => [...prev, {
                    type: 'assistant',
                    content: response.data.response
                }]);

                // 如果对话完成，通知父组件
                if (response.data.dialogue_complete) {
                    setDialogueComplete(true);
                    onDialogComplete(response.data.summary);
                }
            }

            setUserInput('');
        } catch (error) {
            console.error('发送消息失败:', error);
            setMessages(prev => [...prev, {
                type: 'system',
                content: '抱歉，发生了错误。'
            }]);
        }
    };

    return (
        <Card className="chat-dialog-container">
            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.type}`}>
                        {msg.content}
                    </div>
                ))}
            </div>
            <div className="input-area">
                <Input
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onPressEnter={sendMessage}
                    placeholder="请输入您的消息..."
                    disabled={dialogueComplete}
                />
                <Button 
                    type="primary" 
                    onClick={sendMessage}
                    disabled={dialogueComplete}
                >
                    发送
                </Button>
            </div>
        </Card>
    );
}

export default ChatDialog; 