import React, { useEffect } from 'react';
import { Badge, Popover, List, Avatar, Spin } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useStore } from 'zustand';
import notificationStore from '@stores/notificationStore'; // I will create this store
import { formatDate } from '@utils/helper';
import { Link } from 'react-router-dom';

const NotificationBell = () => {
  const { notifications, loading, getNotifications, markAsRead } = useStore(notificationStore);

  useEffect(() => {
    getNotifications();
  }, [getNotifications]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification._id);
    }
  };

  const notificationContent = (
    <div style={{ width: 350, maxHeight: '50vh', overflowY: 'auto' }}>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
          <Spin />
        </div>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={notifications}
          renderItem={item => (
            <List.Item
              onClick={() => handleNotificationClick(item)}
              style={{ backgroundColor: item.is_read ? '#fff' : '#f0f8ff', cursor: 'pointer' }}
            >
              <Link to={item.link || '#'} style={{ display: 'block', width: '100%' }}>
                <List.Item.Meta
                  avatar={<Avatar src={item.sender?.profile_img} />}
                  title={item.message}
                  description={formatDate(item.createdAt)}
                />
              </Link>
            </List.Item>
          )}
        />
      )}
    </div>
  );

  return (
    <Popover content={notificationContent} title="Notifications" trigger="click" placement="bottomRight">
      <Badge count={unreadCount}>
        <BellOutlined style={{ fontSize: '24px', cursor: 'pointer' }} />
      </Badge>
    </Popover>
  );
};

export default NotificationBell;
