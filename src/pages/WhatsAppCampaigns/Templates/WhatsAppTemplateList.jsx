import React, { useEffect } from "react";
import { Table, Button, Tag, Space, Popconfirm, message, Tooltip } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, CloudUploadOutlined, SyncOutlined } from "@ant-design/icons";
import useWhatsAppTemplateStore from "@/stores/WhatsAppTemplateStore";

const STATUS_COLORS = { draft: "default", pending: "gold", approved: "green", rejected: "red", disabled: "default" };

export default function WhatsAppTemplateList() {
  const { templates, loading, fetch, setModalOpen, setSelected, remove, submitToMeta, syncStatus } = useWhatsAppTemplateStore();

  useEffect(() => {
    fetch();
  }, []);

  const handleSubmit = async (id) => {
    try {
      await submitToMeta(id);
      message.success("Submitted to Meta for approval");
    } catch (error) {
      message.error(error?.message || "Failed to submit to Meta");
    }
  };

  const handleSync = async (id) => {
    try {
      await syncStatus(id);
      message.success("Status synced");
    } catch (error) {
      message.error(error?.message || "Failed to sync status");
    }
  };

  const columns = [
    { title: "Name", dataIndex: "name" },
    { title: "Language", dataIndex: "language", width: 90 },
    { title: "Category", dataIndex: "category", render: (v) => <Tag>{v}</Tag> },
    {
      title: "Header",
      dataIndex: "headerType",
      render: (v, record) => {
        if (!v || v === "none") return null;
        const missingImage = (v === "image" || v === "document") && !record.headerExampleUrl;
        return (
          <Space>
            <Tag>{v}</Tag>
            {missingImage && <Tag color="red">Missing header image</Tag>}
          </Space>
        );
      },
    },
    {
      title: "Approval",
      dataIndex: "approvalStatus",
      render: (v) => <Tag color={STATUS_COLORS[v]}>{v}</Tag>,
    },
    { title: "Active", dataIndex: "active", render: (v) => (v ? "Yes" : "No") },
    {
      title: "Actions",
      render: (_v, record) => (
        <Space>
          <Tooltip title="Submit to Meta for approval">
            <Button size="small" icon={<CloudUploadOutlined />} onClick={() => handleSubmit(record._id)} disabled={record.approvalStatus === "approved"} />
          </Tooltip>
          <Tooltip title="Sync approval status from Meta">
            <Button size="small" icon={<SyncOutlined />} onClick={() => handleSync(record._id)} disabled={!record.metaTemplateId} />
          </Tooltip>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setSelected(record);
              setModalOpen(true);
            }}
          />
          <Popconfirm title="Delete this template?" onConfirm={() => remove(record._id)}>
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
          New Template
        </Button>
      </div>
      <Table rowKey="_id" loading={loading} dataSource={templates} columns={columns} />
    </div>
  );
}
