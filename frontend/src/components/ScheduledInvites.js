import React, { useState } from 'react';
import './ScheduledInvites.css';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Card, Space, Button, Tooltip, Avatar, List, Tag, Alert, AutoComplete } from 'antd';
import { MessageOutlined, ContactsOutlined, DeleteOutlined, MailOutlined, TeamOutlined } from '@ant-design/icons';
import ChatDialog from './ChatDialog';

function ScheduledInvites() {
    const { t } = useTranslation();
    const [invites] = useState([
        { id: 1, title: t('meetingWithTeam'), time: '10:00 AM', location: 'Room 101' },
        // ... 其他邀约
    ]);

    const handleEdit = (id) => {
        console.log(t('editInvite', { id }));
    };

    return (
        <div className="scheduled-invites">
            <h2>{t('scheduledInvites')}</h2>
            <ul>
                {invites.map(invite => (
                    <li key={invite.id}>
                        <span>{invite.title} - {invite.time} {t('at')} {invite.location}</span>
                        <button onClick={() => handleEdit(invite.id)}>{t('edit')}</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ScheduledInvites; 