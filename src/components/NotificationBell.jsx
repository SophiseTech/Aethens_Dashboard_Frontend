import React, { useEffect } from 'react';
import { Badge, Popover, List, Avatar, Spin, Empty } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useStore } from 'zustand';
import { useNavigate } from 'react-router-dom';
import notificationStore from '@stores/notificationStore';
import userStore from '@stores/UserStore';
import { formatDate } from '@utils/helper';

const NotificationBell = () => {
  const { notifications, loading, getNotifications, markAsRead } = useStore(notificationStore);
  const { user } = useStore(userStore);
  const navigate = useNavigate();

  useEffect(() => {
    getNotifications();
  }, [getNotifications]);

  // Filter to show only unread notifications
  const unreadNotifications = notifications.filter(n => !n.is_read);
  const unreadCount = unreadNotifications.length;

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification._id);
    }

    // Only redirect for SlotRequest module type and only for managers
    if (notification.module_type === 'slot_request' && user?.role === 'manager') {
      navigate('/manager/students');
    }
    // For other types, just mark as read and remove from list (no redirect)
  };

  const notificationContent = (
    <div style={{ width: 350, maxHeight: '50vh', overflowY: 'auto' }}>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
          <Spin />
        </div>
      ) : unreadNotifications.length === 0 ? (
        <Empty
          description="No unread notifications"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: '20px 0' }}
        />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={unreadNotifications}
          renderItem={item => (
            <List.Item
              onClick={() => handleNotificationClick(item)}
              style={{
                backgroundColor: '#f0f8ff',
                cursor: 'pointer',
                padding: '12px 16px',
                borderBottom: '1px solid #f0f0f0'
              }}
              className="hover:bg-blue-50 transition-colors"
            >
              <List.Item.Meta
                avatar={<Avatar src={item.sender?.profile_img} />}
                title={
                  <span className="text-sm font-medium text-gray-800">
                    {item.message}
                  </span>
                }
                description={
                  <span className="text-xs text-gray-500">
                    {formatDate(item.createdAt)}
                  </span>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );

  return (
    <Popover content={notificationContent} title="Unread Notifications" trigger="click" placement="bottomRight">
      <Badge count={unreadCount}>
        <BellOutlined style={{ fontSize: '24px', cursor: 'pointer' }} className='border border-stone-200 p-3 rounded-full' />
      </Badge>
    </Popover>
  );
};

export default NotificationBell;
