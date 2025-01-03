import React from 'react';
import { Calendar, Card, List, Badge, Row, Col, Typography, Button, Tag, Space, Divider } from 'antd';
import { 
    ClockCircleOutlined, 
    TeamOutlined, 
    VideoCameraOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import './Schedule.css';

const { Title, Text } = Typography;

function Schedule() {
    const { t } = useTranslation();

    // 示例数据
    const meetings = [
        { 
            id: 1, 
            title: '产品评审会议', 
            time: '2024-01-03 10:00', 
            type: 'success',
            participants: ['张三', '李四', '王五'],
            isOnline: true,
            duration: '1小时'
        },
        { 
            id: 2, 
            title: '团队周会', 
            time: '2024-01-03 14:00', 
            type: 'warning',
            participants: ['整个团队'],
            isOnline: true,
            duration: '1.5小时'
        },
        { 
            id: 3, 
            title: '项目进度汇报', 
            time: '2024-01-04 15:00', 
            type: 'processing',
            participants: ['项目组'],
            isOnline: false,
            duration: '2小时'
        },
    ];

    const dateCellRender = (value) => {
        const listData = meetings.filter(meeting => {
            const meetingDate = new Date(meeting.time);
            return meetingDate.toDateString() === value.toDate().toDateString();
        });

        return (
            <ul className="events">
                {listData.map(item => (
                    <li key={item.id}>
                        <Badge status={item.type} text={item.title} />
                    </li>
                ))}
            </ul>
        );
    };

    const getStatusColor = (type) => {
        switch(type) {
            case 'success': return 'green';
            case 'warning': return 'orange';
            case 'processing': return 'blue';
            default: return 'default';
        }
    };

    return (
        <div className="schedule-container">
            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <Card bordered={false} className="header-card">
                        <Row justify="space-between" align="middle">
                            <Col>
                                <Title level={3}>
                                    <CalendarOutlined /> {t('scheduleOverview')}
                                </Title>
                            </Col>
                            <Col>
                                <Space>
                                    <Button type="primary">
                                        创建会议
                                    </Button>
                                    <Button>
                                        导出日程
                                    </Button>
                                </Space>
                            </Col>
                        </Row>
                    </Card>
                </Col>

                <Col xs={24} lg={16}>
                    <Card bordered={false} className="calendar-card">
                        <Calendar dateCellRender={dateCellRender} />
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card 
                        title={<Title level={4}>{t('upcomingMeetings')}</Title>}
                        bordered={false}
                        className="meetings-card"
                    >
                        <List
                            itemLayout="vertical"
                            dataSource={meetings}
                            renderItem={item => (
                                <List.Item
                                    className="meeting-item"
                                    actions={[
                                        <Button type="link" key="join">
                                            加入会议
                                        </Button>,
                                        <Button type="link" key="details">
                                            查看详情
                                        </Button>
                                    ]}
                                >
                                    <List.Item.Meta
                                        title={
                                            <Space>
                                                <Text strong>{item.title}</Text>
                                                <Tag color={getStatusColor(item.type)}>
                                                    {item.isOnline ? '线上' : '线下'}
                                                </Tag>
                                            </Space>
                                        }
                                        description={
                                            <Space direction="vertical" size={2}>
                                                <Space>
                                                    <ClockCircleOutlined />
                                                    <Text type="secondary">{item.time}</Text>
                                                    <Divider type="vertical" />
                                                    <Text type="secondary">{item.duration}</Text>
                                                </Space>
                                                <Space>
                                                    <TeamOutlined />
                                                    <Text type="secondary">
                                                        {item.participants.join(', ')}
                                                    </Text>
                                                </Space>
                                                {item.isOnline && (
                                                    <Space>
                                                        <VideoCameraOutlined />
                                                        <Text type="secondary">视频会议</Text>
                                                    </Space>
                                                )}
                                            </Space>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default Schedule; 