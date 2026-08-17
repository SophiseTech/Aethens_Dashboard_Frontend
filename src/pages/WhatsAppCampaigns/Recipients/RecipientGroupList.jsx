import React, { useEffect } from "react";
import { Table, Button, Tag, Space, Popconfirm, message } from "antd";
import { PlusOutlined, ReloadOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import useRecipientGroupStore from "@/stores/RecipientGroupStore";

export default function RecipientGroupList() {
  const { groups, loading, fetch, setModalOpen, setSelected, remove, previewSaved } = useRecipientGroupStore();

  useEffect(() => {
    fetch();
  }, []);

  const handleRefreshCount = async (id) => {
    try {
      const data = await previewSaved(id);
      message.success(`${data.included.length} recipients resolved`);
      fetch();
    } catch {
      message.error("Failed to resolve group");
    }
  };

  const columns = [
    { title: "Name", dataIndex: "name" },
    {
      title: "Type",
      dataIndex: "type",
      render: (v) => <Tag color={v === "dynamic" ? "blue" : "purple"}>{v}</Tag>,
    },
    { title: "Members (cached)", dataIndex: "memberCountCache", render: (v) => v ?? "—" },
    {
      title: "Active",
      dataIndex: "active",
      render: (v) => <Tag color={v ? "green" : "default"}>{v ? "Active" : "Inactive"}</Tag>,
    },
    {
      title: "Actions",
      render: (_v, record) => (
        <Space>
          <Button size="small" icon={<ReloadOutlined />} onClick={() => handleRefreshCount(record._id)}>
            Resolve
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setSelected(record);
              setModalOpen(true);
            }}
          />
          <Popconfirm title="Delete this group?" onConfirm={() => remove(record._id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setSelected(null);
            setModalOpen(true);
          }}
        >
          New Recipient Group
        </Button>
      </div>
      <Table rowKey="_id" loading={loading} dataSource={groups} columns={columns} />
    </div>
  );
}
