import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

function NotificationCenter() {
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState([
        { id: 1, title: t('meetingReminder'), description: t('meetingTodayAt', { time: '3 PM' }), status: 'unread' },
        { id: 2, title: '系统更新', description: '系统将在今晚12点进行更新', status: 'unread' },
        // ... 其他通知
    ]);

    const [filter, setFilter] = useState('all'); // 'all', 'confirmed', 'completed'

    const markAsRead = (id) => {
        setNotifications(notifications.map(notification =>
            notification.id === id ? { ...notification, status: 'read' } : notification
        ));
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
    };

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'all') return true;
        if (filter === 'confirmed') return notification.status === 'read';
        if (filter === 'completed') return notification.status === 'completed';
        return false;
    });

    return (
        <div className="notifications-container">
            <h2>{t('notifications')}</h2>
            <div className="filter">
                <button onClick={() => handleFilterChange('all')}>全部</button>
                <button onClick={() => handleFilterChange('confirmed')}>已确认</button>
                <button onClick={() => handleFilterChange('completed')}>已完成</button>
            </div>
            <ul>
                {filteredNotifications.map(notification => (
                    <li key={notification.id} style={{ opacity: notification.status === 'read' ? 0.5 : 1 }}>
                        <span>{notification.title}: {notification.description}</span>
                        {notification.status === 'unread' && (
                            <button onClick={() => markAsRead(notification.id)}>标记为已读</button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default NotificationCenter; 