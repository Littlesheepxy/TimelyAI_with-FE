import React, { useState, useEffect } from 'react';
import { Tabs, Form, Input, Button, Switch, Select } from 'antd';
import { useTranslation } from 'react-i18next';

const { TabPane } = Tabs;
const { Option } = Select;

function Settings() {
    const { t, i18n } = useTranslation();
    const [form] = Form.useForm();
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
    }, [theme]);

    const handleFormSubmit = (values) => {
        console.log('Form values:', values);
    };

    const handleThemeChange = (value) => {
        setTheme(value);
        document.body.setAttribute('data-theme', value);
    };

    const handleLanguageChange = (value) => {
        i18n.changeLanguage(value);
    };

    return (
        <div className="settings-container">
            <h2>{t('settings')}</h2>
            <Tabs defaultActiveKey="1">
                <TabPane tab={t('personalInfo')} key="1">
                    <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
                        <Form.Item label={t('name')} name="name">
                            <Input />
                        </Form.Item>
                        <Form.Item label={t('email')} name="email">
                            <Input />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">{t('save')}</Button>
                        </Form.Item>
                    </Form>
                </TabPane>
                <TabPane tab={t('accountSecurity')} key="2">
                    <Form layout="vertical">
                        <Form.Item label={t('changePassword')}>
                            <Input.Password />
                        </Form.Item>
                        <Form.Item label={t('twoFactorAuth')}>
                            <Switch />
                        </Form.Item>
                    </Form>
                </TabPane>
                <TabPane tab={t('notificationSettings')} key="3">
                    <Form layout="vertical">
                        <Form.Item label={t('receiveNotifications')}>
                            <Switch />
                        </Form.Item>
                        <Form.Item label={t('notificationFrequency')}>
                            <Select defaultValue="daily">
                                <Option value="instant">{t('instant')}</Option>
                                <Option value="daily">{t('daily')}</Option>
                                <Option value="weekly">{t('weekly')}</Option>
                            </Select>
                        </Form.Item>
                    </Form>
                </TabPane>
                <TabPane tab={t('privacySettings')} key="4">
                    <Form layout="vertical">
                        <Form.Item label={t('dataSharing')}>
                            <Switch />
                        </Form.Item>
                    </Form>
                </TabPane>
                <TabPane tab={t('appSettings')} key="5">
                    <Form layout="vertical">
                        <Form.Item label={t('theme')}>
                            <Select defaultValue="light" onChange={handleThemeChange}>
                                <Option value="light">{t('light')}</Option>
                                <Option value="dark">{t('dark')}</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item label={t('language')}>
                            <Select defaultValue="zh" onChange={handleLanguageChange}>
                                <Option value="zh">{t('chinese')}</Option>
                                <Option value="en">{t('english')}</Option>
                            </Select>
                        </Form.Item>
                    </Form>
                </TabPane>
            </Tabs>
        </div>
    );
}

export default Settings; 