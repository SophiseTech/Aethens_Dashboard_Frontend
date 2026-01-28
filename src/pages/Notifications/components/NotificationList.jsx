import React from "react";
import { Table, Avatar, Tag, Tooltip } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { formatDate } from "@utils/helper";

export default function NotificationList({ notifications, loading, pagination, handleTableChange }) {
  const columns = [
    {
      title: "Sender",
      dataIndex: "sender",
      key: "sender",
      render: (sender) => (
        <div className="flex items-center gap-2">
          <Avatar src={sender?.profile_img} icon={<UserOutlined />} size="small" />
          <span>{sender?.username || "System"}</span>
        </div>
      ),
    },
    {
      title: "Recipient",
      dataIndex: "recipient",
      key: "recipient",
      render: (recipient) => (
        <div className="flex items-center gap-2">
          <Avatar src={recipient?.profile_img} icon={<UserOutlined />} size="small" />
          <span>{recipient?.username || "All"}</span>
        </div>
      ),
    },
    {
      title: "Module",
      dataIndex: "module_type",
      key: "module_type",
      render: (type) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      render: (text) => (
        <Tooltip title={text}>
          <div className="truncate max-w-xs">{text}</div>
        </Tooltip>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => formatDate(new Date(date)),
    },
    {
      title: "Status",
      dataIndex: "is_read",
      key: "is_read",
      render: (isRead) => (
        <Tag color={isRead ? "green" : "orange"}>
          {isRead ? "Read" : "Unread"}
        </Tag>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={notifications}
      rowKey="_id"
      loading={loading}
      pagination={pagination}
      onChange={handleTableChange}
    />
  );
}
