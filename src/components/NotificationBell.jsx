import React, { useEffect, useState } from 'react';
import { Badge, Popover, List, Avatar, Spin, Empty, message } from 'antd';
import { BellOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useStore } from 'zustand';
import notificationStore from '@stores/notificationStore';
import { formatDate } from '@utils/helper';

const NotificationBell = () => {
  const { notifications, loading, getNotifications, markAsRead } = useStore(notificationStore);
  const [clickedId, setClickedId] = useState(null);
  const [markingRead, setMarkingRead] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    getNotifications();
  }, [getNotifications]);

  // Filter to show only unread notifications
  const unreadNotifications = notifications.filter(n => !n.is_read);
  const unreadCount = unreadNotifications.length;

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      setClickedId(notification._id);
      setMarkingRead(notification._id);

      try {
        await markAsRead(notification._id);
        message.success({ content: 'Marked as read', duration: 1.5, icon: <CheckCircleOutlined style={{ color: '#4F651E' }} /> });
      } catch (error) {
        message.error('Failed to mark as read');
      } finally {
        setMarkingRead(null);
        // Keep clicked effect for a moment before removing
        setTimeout(() => setClickedId(null), 500);
      }
    }
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
              onMouseEnter={() => setHoveredId(item._id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                backgroundColor: clickedId === item._id
                  ? '#D1E499'
                  : hoveredId === item._id
                    ? '#f5f5dc'
                    : '#F8F8F8',
                cursor: markingRead === item._id ? 'wait' : 'pointer',
                padding: '12px 16px',
                borderBottom: '1px solid #E7E7E7',
                borderLeft: hoveredId === item._id ? '3px solid #4F651E' : '3px solid transparent',
                transform: clickedId === item._id
                  ? 'scale(0.97)'
                  : hoveredId === item._id
                    ? 'translateX(4px)'
                    : 'translateX(0)',
                transition: 'all 0.2s ease-in-out',
                opacity: markingRead === item._id ? 0.6 : 1,
                boxShadow: hoveredId === item._id ? '0 2px 8px rgba(79,101,30,0.15)' : 'none',
              }}
            >
              <List.Item.Meta
                avatar={
                  markingRead === item._id ? (
                    <Spin size="small" />
                  ) : clickedId === item._id ? (
                    <Avatar style={{ backgroundColor: '#4F651E' }} icon={<CheckCircleOutlined />} />
                  ) : (
                    <Avatar
                      src={item.sender?.profile_img}
                      style={{
                        transform: hoveredId === item._id ? 'scale(1.1)' : 'scale(1)',
                        transition: 'transform 0.2s ease',
                        border: hoveredId === item._id ? '2px solid #C6A936' : '2px solid transparent'
                      }}
                    />
                  )
                }
                title={
                  <span
                    className="text-sm font-medium"
                    style={{
                      color: hoveredId === item._id ? '#4F651E' : '#333',
                      transition: 'color 0.2s ease'
                    }}
                  >
                    {item.message}
                  </span>
                }
                description={
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {formatDate(item.createdAt)}
                    </span>
                    {clickedId === item._id && (
                      <span style={{ color: '#4F651E', fontSize: '12px', fontWeight: 500 }}>
                        ✓ Read
                      </span>
                    )}
                  </div>
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
