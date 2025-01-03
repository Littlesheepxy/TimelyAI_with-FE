import React from 'react';
import { Layout, Menu, Input, Avatar, Badge, Dropdown } from 'antd';
import { 
    UserOutlined, 
    BellOutlined, 
    SettingOutlined, 
    MenuFoldOutlined, 
    MenuUnfoldOutlined,
    CalendarOutlined,
    NotificationOutlined,
    ScheduleOutlined
} from '@ant-design/icons';
import { withTranslation } from 'react-i18next';
import { Outlet, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import confetti from 'canvas-confetti';

const { Header, Sider, Content } = Layout;

function Dashboard({ t }) {
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = React.useState(false);

    const toggle = () => {
        setCollapsed(!collapsed);
    };

    const handleMenuClick = (e) => {
        // 使用路由导航
        switch (e.key) {
            case 'schedule':
                navigate('/dashboard/schedule');
                break;
            case 'invite':
                navigate('/dashboard/invite');
                break;
            case 'notifications':
                navigate('/dashboard/notifications');
                break;
            case 'scheduledInvites':
                navigate('/dashboard/scheduled');
                break;
            case 'settings':
                navigate('/dashboard/settings');
                break;
            default:
                break;
        }
    };

    const menu = (
        <Menu>
            <Menu.Item key="1" onClick={() => navigate('/dashboard/settings')}>个人设置</Menu.Item>
            <Menu.Item key="2" onClick={() => navigate('/login')}>退出登录</Menu.Item>
        </Menu>
    );

    const triggerConfetti = () => {
        // 创建一个持续的庆祝效果
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
        <Layout>
            <Header className="header">
                <div className="logo" />
                <Input.Search placeholder={t('search')} style={{ width: 200, marginRight: 20 }} />
                <div className="header-right">
                    <Badge count={5}>
                        <BellOutlined style={{ fontSize: '20px', marginRight: 20 }} />
                    </Badge>
                    <Dropdown overlay={menu}>
                        <Avatar icon={<UserOutlined />} />
                    </Dropdown>
                </div>
            </Header>
            <Layout>
                <Sider trigger={null} collapsible collapsed={collapsed}>
                    <div className="toggle-button" onClick={toggle}>
                        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    </div>
                    <Menu
                        mode="inline"
                        defaultSelectedKeys={['schedule']}
                        style={{ height: '100%', borderRight: 0 }}
                        onClick={handleMenuClick}
                    >
                        <Menu.Item key="schedule" icon={<CalendarOutlined />}>
                            {t('scheduleOverview')}
                        </Menu.Item>
                        <Menu.Item key="invite" icon={<ScheduleOutlined />}>
                            {t('createNewInvite')}
                        </Menu.Item>
                        <Menu.Item key="notifications" icon={<NotificationOutlined />}>
                            {t('notifications')}
                        </Menu.Item>
                        <Menu.Item key="scheduledInvites" icon={<CalendarOutlined />}>
                            {t('scheduledInvites')}
                        </Menu.Item>
                        <Menu.Item key="settings" icon={<SettingOutlined />}>
                            {t('settings')}
                        </Menu.Item>
                    </Menu>
                </Sider>
                <Layout style={{ padding: '0 24px 24px' }}>
                    <Content
                        className="site-layout-background"
                        style={{
                            padding: 24,
                            margin: 0,
                            minHeight: 280,
                        }}
                    >
                        <Outlet />
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
}

export default withTranslation()(Dashboard); 