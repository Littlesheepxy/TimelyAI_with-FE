import React, { useState, useEffect } from 'react';
import { Layout, Input, Button, Tabs, List, Card, DatePicker, Radio, Steps, message, Modal, Progress, Table, Result, Descriptions, Tag, Space, Alert, Select, Switch, Timeline, Form } from 'antd';
import { UserOutlined, CalendarOutlined, BellOutlined, MessageOutlined, CheckOutlined, RollbackOutlined, MailOutlined, SlackOutlined, ThunderboltOutlined, TeamOutlined, HolderOutlined, RobotOutlined } from '@ant-design/icons';
import './MeetingInvite.css';
import { useTranslation } from 'react-i18next';
import ChatDialog from './ChatDialog';
import axios from 'axios';
import moment from 'moment';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { SortableHandle } from 'react-sortable-hoc';
import ParticipantSelector from './ParticipantSelector';
import confetti from 'canvas-confetti';

const { Header, Content, Footer } = Layout;
const { TabPane } = Tabs;
const { Step } = Steps;

function MeetingInvite() {
    const { t } = useTranslation();
    const [meetingInfo, setMeetingInfo] = useState({
        participants: [],
        subject: '',
        time: null,
        location: '',
        description: ''
    });
    const [mode, setMode] = useState('standard'); // 'standard' 或 'natural'
    const [currentStep, setCurrentStep] = useState(0);
    const [dialogueComplete, setDialogueComplete] = useState(false);
    const [dialogueResult, setDialogueResult] = useState(null);
    const [channels, setChannels] = useState([
        { id: 'email', name: '邮件', icon: <MailOutlined />, enabled: true, priority: 1 },
        { id: 'slack', name: 'Slack', icon: <SlackOutlined />, enabled: true, priority: 2 },
        { id: 'feishu', name: '飞书', icon: <ThunderboltOutlined />, enabled: true, priority: 3 },
        { id: 'teams', name: 'Teams', icon: <TeamOutlined />, enabled: false, priority: 4 },
        { id: 'sms', name: '短信', icon: <MessageOutlined />, enabled: false, priority: 5 }
    ]);
    const [inviteProgress, setInviteProgress] = useState(0);
    const [inviteStatus, setInviteStatus] = useState('waiting'); // waiting, processing, success, error
    const [processingLogs, setProcessingLogs] = useState([]);
    const [currentManualStatus, setCurrentManualStatus] = useState('preparing');
    const [manualNote, setManualNote] = useState('');

    const handleDialogueComplete = async (result) => {
        try {
            // 调用后端的 DialogueAgent 处理结果
            const response = await axios.post('/api/dialogue-agent/process', {
                dialogue: result
            });

            const processedInfo = response.data;
            setDialogueResult(processedInfo);
            
            // 更新会议信息
            setMeetingInfo({
                participants: processedInfo.participants || [],
                subject: processedInfo.subject || '',
                time: processedInfo.time ? moment(processedInfo.time) : null,
                location: processedInfo.location || '',
                description: processedInfo.description || ''
            });

            setDialogueComplete(true);
            // 如果两步都完成，自动前进到第三步
            if (currentStep < 2) {
                setCurrentStep(2);
            }
        } catch (error) {
            message.error('处理对话内容失败，请重试');
        }
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(channels);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // 更新优先级
        const updatedItems = items.map((item, index) => ({
            ...item,
            priority: index + 1
        }));

        setChannels(updatedItems);
    };

    const renderInitialSteps = () => {
        if (mode === 'natural') {
            return (
                <Card className="dialogue-card">
                    <div className="mode-switch">
                        <Button 
                            type="link" 
                            onClick={() => setMode('standard')}
                            icon={<RollbackOutlined />}
                        >
                            切换到标准模式
                        </Button>
                    </div>
                    
                    {!dialogueComplete ? (
                        <ChatDialog 
                            onComplete={handleDialogueComplete}
                            placeholder="请告诉我您要安排的会议详情，包括参与者、时间、地点和主题..."
                        />
                    ) : (
                        <div className="dialogue-summary">
                            <Result
                                status="success"
                                title="会议信息已收集完成"
                                subTitle="您可以查看下方的会议详情或继续下一步"
                            />
                            <Descriptions bordered>
                                <Descriptions.Item label="参与者" span={3}>
                                    <Space wrap>
                                        {meetingInfo.participants.map((p, index) => (
                                            <Tag key={index} icon={<UserOutlined />}>{p.name}</Tag>
                                        ))}
                                    </Space>
                                </Descriptions.Item>
                                <Descriptions.Item label="主题" span={3}>
                                    {meetingInfo.subject}
                                </Descriptions.Item>
                                <Descriptions.Item label="时间" span={3}>
                                    {meetingInfo.time?.format('YYYY-MM-DD HH:mm')}
                                </Descriptions.Item>
                                <Descriptions.Item label="地点" span={3}>
                                    {meetingInfo.location}
                                </Descriptions.Item>
                                <Descriptions.Item label="描述" span={3}>
                                    {meetingInfo.description}
                                </Descriptions.Item>
                            </Descriptions>
                        </div>
                    )}
                </Card>
            );
        }

        // 标准模式下的步骤
        return (
            <div className="standard-steps">
                {currentStep === 0 ? (
                    <Card title="选择参与者" extra={
                        <Button 
                            type="primary" 
                            icon={<MessageOutlined />}
                            onClick={() => setMode('natural')}
                        >
                            使用自然语言模式
                        </Button>
                    }>
                        <ParticipantSelector
                            value={meetingInfo.participants}
                            onChange={participants => {
                                setMeetingInfo(prev => ({ ...prev, participants }));
                            }}
                        />
                    </Card>
                ) : (
                    <Card title="会议详情" extra={
                        <Button 
                            type="primary" 
                            icon={<MessageOutlined />}
                            onClick={() => setMode('natural')}
                        >
                            使用自然语言模式
                        </Button>
                    }>
                        <Form layout="vertical">
                            <Form.Item 
                                label="会议主题" 
                                required
                                validateStatus={meetingInfo.subject ? 'success' : ''}
                            >
                                <Input
                                    value={meetingInfo.subject}
                                    onChange={e => setMeetingInfo(prev => ({
                                        ...prev,
                                        subject: e.target.value
                                    }))}
                                    placeholder="请输入会议主题"
                                />
                            </Form.Item>
                            
                            <Form.Item 
                                label="会议时间" 
                                required
                                validateStatus={meetingInfo.time ? 'success' : ''}
                            >
                                <DatePicker
                                    showTime
                                    value={meetingInfo.time}
                                    onChange={time => setMeetingInfo(prev => ({
                                        ...prev,
                                        time
                                    }))}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                            
                            <Form.Item label="会议地点">
                                <Input
                                    value={meetingInfo.location}
                                    onChange={e => setMeetingInfo(prev => ({
                                        ...prev,
                                        location: e.target.value
                                    }))}
                                    placeholder="请输入会议地点"
                                />
                            </Form.Item>
                            
                            <Form.Item label="会议描述">
                                <Input.TextArea
                                    value={meetingInfo.description}
                                    onChange={e => setMeetingInfo(prev => ({
                                        ...prev,
                                        description: e.target.value
                                    }))}
                                    rows={4}
                                    placeholder="请输入会议描述"
                                />
                            </Form.Item>
                        </Form>
                    </Card>
                )}
            </div>
        );
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 2: // 选择渠道
                return (
                    <Card title="选择通知渠道" bordered={false}>
                        <Alert
                            message="通过拖拽调整渠道优先级，优先级高的渠道将优先发送通知"
                            type="info"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                        
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="channels">
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="channels-list"
                                    >
                                        {channels.map((channel, index) => (
                                            <Draggable
                                                key={channel.id}
                                                draggableId={channel.id}
                                                index={index}
                                            >
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className={`channel-item ${snapshot.isDragging ? 'dragging' : ''}`}
                                                    >
                                                        <Card
                                                            size="small"
                                                            className={`channel-card ${channel.enabled ? 'enabled' : ''}`}
                                                        >
                                                            <div className="channel-content">
                                                                <div 
                                                                    className="drag-handle" 
                                                                    {...provided.dragHandleProps}
                                                                >
                                                                    <HolderOutlined />
                                                                </div>
                                                                <div className="channel-info">
                                                                    <Space>
                                                                        {channel.icon}
                                                                        <span>{channel.name}</span>
                                                                        <Tag color="blue">优先级 {channel.priority}</Tag>
                                                                    </Space>
                                                                </div>
                                                                <div className="channel-actions">
                                                                    <Switch
                                                                        checked={channel.enabled}
                                                                        onChange={(checked) => {
                                                                            const updatedChannels = channels.map(c => 
                                                                                c.id === channel.id 
                                                                                    ? { ...c, enabled: checked }
                                                                                    : c
                                                                            );
                                                                            setChannels(updatedChannels);
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                            {channel.enabled && (
                                                                <div className="channel-settings">
                                                                    <Form layout="vertical" size="small">
                                                                        {channel.id === 'email' && (
                                                                            <Form.Item label="邮件模板">
                                                                                <Select defaultValue="default">
                                                                                    <Select.Option value="default">默认模板</Select.Option>
                                                                                    <Select.Option value="formal">正式模板</Select.Option>
                                                                                    <Select.Option value="casual">简约模板</Select.Option>
                                                                                </Select>
                                                                            </Form.Item>
                                                                        )}
                                                                        {channel.id === 'slack' && (
                                                                            <Form.Item label="Slack 频道">
                                                                                <Input placeholder="输入频道名称" />
                                                                            </Form.Item>
                                                                        )}
                                                                    </Form>
                                                                </div>
                                                            )}
                                                        </Card>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>

                        <div className="channels-summary" style={{ marginTop: 16 }}>
                            <Alert
                                message={
                                    <div>
                                        已启用 {channels.filter(c => c.enabled).length} 个渠道
                                        <ul style={{ marginTop: 8 }}>
                                            {channels
                                                .filter(c => c.enabled)
                                                .map(c => (
                                                    <li key={c.id}>
                                                        {c.icon} {c.name} (优先级 {c.priority})
                                                    </li>
                                                ))}
                                        </ul>
                                    </div>
                                }
                                type="success"
                                showIcon
                            />
                        </div>
                    </Card>
                );
            case 3: // 邀约处理
                return (
                    <Card title="邀约处理" bordered={false}>
                        <div className="invite-progress">
                            <Progress 
                                percent={Math.round(inviteProgress)} 
                                status={
                                    inviteStatus === 'processing' ? 'active' :
                                    inviteStatus === 'success' ? 'success' :
                                    inviteStatus === 'error' ? 'exception' :
                                    'normal'
                                }
                            />
                            
                            {inviteStatus === 'waiting' && (
                                <div className="process-options">
                                    <Alert
                                        message="请选择处理方式"
                                        description="您可以选择 AI 托管自动处理或人工手动处理邀约流程"
                                        type="info"
                                        showIcon
                                        style={{ marginBottom: 16 }}
                                    />
                                    <Space size="large">
                                        <Button 
                                            type="primary"
                                            icon={<RobotOutlined />}
                                            onClick={handleAIProcess}
                                        >
                                            AI 托管处理
                                        </Button>
                                        <Button
                                            icon={<UserOutlined />}
                                            onClick={handleManualProcess}
                                        >
                                            人工处理
                                        </Button>
                                    </Space>
                                </div>
                            )}

                            {inviteStatus === 'processing' && (
                                <div className="processing-status">
                                    <Timeline>
                                        {processingLogs.map((log, index) => (
                                            <Timeline.Item 
                                                key={index}
                                                color={
                                                    log.type === 'success' ? 'green' :
                                                    log.type === 'warning' ? 'orange' :
                                                    log.type === 'error' ? 'red' :
                                                    'blue'
                                                }
                                            >
                                                <div className="log-item">
                                                    <div className="log-header">
                                                        <span className="log-title">{log.title}</span>
                                                        <span className="log-time">
                                                            {moment(log.timestamp).format('HH:mm:ss')}
                                                        </span>
                                                    </div>
                                                    <div className="log-content">{log.content}</div>
                                                </div>
                                            </Timeline.Item>
                                        ))}
                                    </Timeline>
                                </div>
                            )}

                            {inviteStatus === 'processing' && mode === 'manual' && (
                                <div className="manual-controls">
                                    <Card title="人工处理面板" size="small">
                                        <Form layout="vertical">
                                            <Form.Item label="处理状态">
                                                <Select
                                                    value={currentManualStatus}
                                                    onChange={handleManualStatusChange}
                                                >
                                                    <Select.Option value="preparing">准备中</Select.Option>
                                                    <Select.Option value="sending">发送中</Select.Option>
                                                    <Select.Option value="confirming">确认中</Select.Option>
                                                    <Select.Option value="completed">已完成</Select.Option>
                                                </Select>
                                            </Form.Item>
                                            
                                            <Form.Item label="处理记录">
                                                <Input.TextArea
                                                    placeholder="输入处理记录..."
                                                    rows={4}
                                                    value={manualNote}
                                                    onChange={e => setManualNote(e.target.value)}
                                                />
                                            </Form.Item>
                                            
                                            <Form.Item>
                                                <Space>
                                                    <Button 
                                                        type="primary"
                                                        onClick={handleAddManualLog}
                                                    >
                                                        添加记录
                                                    </Button>
                                                    <Button
                                                        type="primary"
                                                        danger
                                                        onClick={() => {
                                                            setInviteProgress(100);
                                                            setInviteStatus('success');
                                                            setCurrentStep(4);
                                                        }}
                                                    >
                                                        完成处理
                                                    </Button>
                                                </Space>
                                            </Form.Item>
                                        </Form>
                                    </Card>
                                </div>
                            )}
                        </div>
                    </Card>
                );
            // ... 其他步骤的 case
        }
    };

    const handleAIProcess = async () => {
        try {
            setInviteStatus('processing');
            setInviteProgress(0);
            
            // 1. 调用 StrategyAgent 生成策略
            const strategyResponse = await axios.post('/api/strategy-agent/generate', {
                meetingInfo,
                channels: channels.filter(c => c.enabled).sort((a, b) => a.priority - b.priority),
                mode: mode,
                dialogueResult: mode === 'natural' ? dialogueResult : null
            });

            addProcessingLog({
                type: 'success',
                title: '策略生成完成',
                content: strategyResponse.data.strategy.description
            });
            setInviteProgress(30);

            // 2. 启动协调流程
            const coordinationResponse = await axios.post('/api/coordination-agent/start', {
                strategy: strategyResponse.data.strategy,
                meetingInfo,
                channels: channels.filter(c => c.enabled)
            });

            // 3. 建立 WebSocket 连接监听实时进度
            const ws = new WebSocket('ws://your-backend/coordination-progress');
            
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                
                if (data.type === 'progress') {
                    setInviteProgress(30 + data.progress * 0.7); // 30-100 范围
                    addProcessingLog({
                        type: data.status,
                        title: data.title,
                        content: data.message
                    });

                    if (data.progress === 100) {
                        setInviteStatus('success');
                        setCurrentStep(4);
                        triggerConfetti();
                        ws.close();
                    }
                }
            };

            return () => ws.close();
        } catch (error) {
            setInviteStatus('error');
            addProcessingLog({
                type: 'error',
                title: '处理失败',
                content: error.message
            });
        }
    };

    const handleManualProcess = () => {
        setInviteStatus('processing');
        setInviteProgress(0);
    };

    const addProcessingLog = (log) => {
        setProcessingLogs(prev => [...prev, {
            ...log,
            timestamp: new Date().toISOString()
        }]);
    };

    const handleManualStatusChange = (status) => {
        setCurrentManualStatus(status);
        setInviteProgress(
            status === 'preparing' ? 25 :
            status === 'sending' ? 50 :
            status === 'confirming' ? 75 :
            status === 'completed' ? 100 : 0
        );
    };

    const handleAddManualLog = () => {
        if (!manualNote.trim()) {
            message.warning('请输入处理记录');
            return;
        }

        addProcessingLog({
            type: 'info',
            title: `${currentManualStatus} - 人工处理记录`,
            content: manualNote
        });

        setManualNote('');

        // 如果状态是已完成，自动触发完成流程
        if (currentManualStatus === 'completed') {
            setInviteProgress(100);
            setInviteStatus('success');
            setCurrentStep(4);
        }
    };

    const triggerConfetti = () => {
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#ff0000', '#00ff00', '#0000ff']
            });
            
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#ff0000', '#00ff00', '#0000ff']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        
        frame();
    };

    return (
        <Layout className="meeting-invite-container">
            <Content>
                <Card className="main-card">
                    <Steps current={currentStep}>
                        <Step title="选择参与者" />
                        <Step title="会议详情" />
                        <Step title="选择渠道" />
                        <Step title="确认发送" />
                        <Step title="邀约完成" />
                    </Steps>

                    <div className="step-content">
                        {currentStep <= 1 ? renderInitialSteps() : renderStepContent()}
                    </div>

                    {mode === 'standard' && (
                        <div className="step-actions">
                            {currentStep > 0 && (
                                <Button 
                                    style={{ marginRight: 8 }} 
                                    onClick={() => setCurrentStep(currentStep - 1)}
                                >
                                    上一步
                                </Button>
                            )}
                            <Button 
                                type="primary" 
                                onClick={() => setCurrentStep(currentStep + 1)}
                                disabled={
                                    (currentStep === 0 && meetingInfo.participants.length === 0) ||
                                    (currentStep === 1 && (!meetingInfo.subject || !meetingInfo.time))
                                }
                            >
                                下一步
                            </Button>
                        </div>
                    )}
                </Card>
            </Content>
        </Layout>
    );
}

export default MeetingInvite; 