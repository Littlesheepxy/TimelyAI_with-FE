import React from 'react';
import { AutoComplete, Avatar, List, Tag, Space, Button } from 'antd';
import { UserOutlined, DeleteOutlined, MailOutlined, TeamOutlined } from '@ant-design/icons';

function ParticipantSelector({ value = [], onChange }) {
    const [searchText, setSearchText] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [searchResults, setSearchResults] = React.useState([]);

    const handleSearch = async (text) => {
        setSearchText(text);
        if (!text) {
            setSearchResults([]);
            return;
        }

        setLoading(true);
        try {
            // 这里可以调用后端 API 搜索用户
            const response = await fetch(`/api/search-users?keyword=${text}`);
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('搜索用户失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (_, option) => {
        const newParticipant = {
            key: option.key,
            name: option.name,
            email: option.email,
            department: option.department
        };
        onChange([...value, newParticipant]);
        setSearchText('');
    };

    const handleRemove = (index) => {
        const newValue = [...value];
        newValue.splice(index, 1);
        onChange(newValue);
    };

    return (
        <div className="participant-selector">
            <AutoComplete
                value={searchText}
                onChange={handleSearch}
                onSelect={handleSelect}
                placeholder="搜索参与者或输入邮箱"
                loading={loading}
                style={{ width: '100%', marginBottom: 16 }}
            >
                {searchResults.map(item => (
                    <AutoComplete.Option 
                        key={item.id} 
                        value={item.name}
                        name={item.name}
                        email={item.email}
                        department={item.department}
                    >
                        <Space>
                            <Avatar size="small" icon={<UserOutlined />} />
                            <span>{item.name}</span>
                            <Tag color="blue">{item.email}</Tag>
                            {item.department && (
                                <Tag color="green">{item.department}</Tag>
                            )}
                        </Space>
                    </AutoComplete.Option>
                ))}
            </AutoComplete>

            <List
                dataSource={value}
                renderItem={(item, index) => (
                    <List.Item
                        actions={[
                            <Button
                                type="text"
                                icon={<DeleteOutlined />}
                                onClick={() => handleRemove(index)}
                                danger
                            />
                        ]}
                    >
                        <List.Item.Meta
                            avatar={<Avatar icon={<UserOutlined />} />}
                            title={item.name}
                            description={
                                <Space>
                                    <Tag icon={<MailOutlined />}>{item.email}</Tag>
                                    {item.department && (
                                        <Tag icon={<TeamOutlined />}>{item.department}</Tag>
                                    )}
                                </Space>
                            }
                        />
                    </List.Item>
                )}
            />
        </div>
    );
}

export default ParticipantSelector; 