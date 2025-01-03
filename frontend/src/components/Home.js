import React from 'react';
import { Form, Input, Button, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
    const navigate = useNavigate();

    const onFinish = (values) => {
        console.log('Success:', values);
        // 调用后端API进行登录
        // 假设登录成功
        localStorage.setItem('userToken', 'dummy-token'); // 存储token
        navigate('/dashboard'); // 跳转到仪表板
    };

    const handleForgotPassword = () => {
        console.log('忘记密码');
        // 处理忘记密码逻辑
    };

    return (
        <div className="home-container">
            <div className="header">
                <h1>TimelyAI</h1>
            </div>
            <div className="content">
                <div className="login-left">
                    <div className="promo-text">
                        <span className="typing-effect">创新驱动未来</span>
                    </div>
                </div>
                <div className="login-right">
                    <h2 style={{ textAlign: 'center' }}>登录</h2>
                    <Form
                        name="login"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                    >
                        <Form.Item
                            name="username"
                            rules={[{ required: true, message: '请输入用户名!' }]}
                        >
                            <Input prefix={<UserOutlined />} placeholder="用户名" />
                        </Form.Item>
                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: '请输入密码!' }]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
                        </Form.Item>
                        <Form.Item>
                            <Form.Item name="remember" valuePropName="checked" noStyle>
                                <Checkbox>记住我</Checkbox>
                            </Form.Item>
                            <Button 
                                type="link" 
                                style={{ float: 'right', padding: 0 }}
                                onClick={handleForgotPassword}
                            >
                                忘记密码?
                            </Button>
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                                登录
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </div>
    );
}

export default Home; 