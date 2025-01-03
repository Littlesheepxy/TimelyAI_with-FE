import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import Schedule from './components/Schedule';
import MeetingInvite from './components/MeetingInvite';
import ScheduledInvites from './components/ScheduledInvites';
import Settings from './components/Settings';
import 'antd/dist/antd.css';

function App() {
    return (
        <ConfigProvider locale={zhCN}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<Home />} />
                    <Route path="/dashboard" element={<Dashboard />}>
                        <Route index element={<Navigate to="schedule" replace />} />
                        <Route path="schedule" element={<Schedule />} />
                        <Route path="invite" element={<MeetingInvite />} />
                        <Route path="notifications" element={<ScheduledInvites />} />
                        <Route path="scheduled" element={<ScheduledInvites />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </ConfigProvider>
    );
}

export default App;