import React, { useEffect } from "react";
import { Table, Button, Tag, Space, Popconfirm, message, Progress } from "antd";
import { PlusOutlined, SendOutlined, PauseOutlined, PlayCircleOutlined, StopOutlined, BarChartOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import useCampaignStore from "@/stores/CampaignStore";

const STATUS_COLORS = {
  draft: "default",
  scheduled: "gold",
  sending: "processing",
  paused: "orange",
  completed: "green",
  completed_with_errors: "volcano",
  cancelled: "default",
  failed: "red",
};

export default function CampaignList({ onViewDetail }) {
  const { campaigns, loading, fetch, setModalOpen, queue, pause, resume, cancel } = useCampaignStore();

  useEffect(() => {
    fetch();
  }, []);

  const handleAction = async (action, id, label) => {
    try {
      await action(id);
      message.success(label);
    } catch (error) {
      message.error(error?.message || `Failed to ${label.toLowerCase()}`);
    }
  };

  const columns = [
    { title: "Name", dataIndex: "name" },
    { title: "Template", render: (_v, r) => r.template?.name || "—" },
    { title: "Recipient group", render: (_v, r) => r.recipientGroup?.name || "—" },
    {
      title: "Status",
      dataIndex: "status",
      render: (v) => <Tag color={STATUS_COLORS[v]}>{v.replace(/_/g, " ")}</Tag>,
    },
    {
      title: "Progress",
      render: (_v, r) => {
        const total = r.stats?.totalRecipients || 0;
        const done = (r.stats?.sent || 0) + (r.stats?.failed || 0);
        return total ? <Progress percent={Math.round((done / total) * 100)} size="small" /> : "—";
      },
    },
    {
      title: "Actions",
      render: (_v, record) => (
        <Space>
          <Button size="small" icon={<BarChartOutlined />} onClick={() => onViewDetail(record._id)} />
          {record.status === "draft" && (
            <Button size="small" type="primary" icon={<SendOutlined />} onClick={() => handleAction(queue, record._id, "Campaign queued")}>
              Queue
            </Button>
          )}
          {record.status === "sending" && (
            <Button size="small" icon={<PauseOutlined />} onClick={() => handleAction(pause, record._id, "Campaign paused")} />
          )}
          {record.status === "paused" && (
            <Button size="small" icon={<PlayCircleOutlined />} onClick={() => handleAction(resume, record._id, "Campaign resumed")} />
          )}
          {["draft", "scheduled", "sending", "paused"].includes(record.status) && (
            <Popconfirm title="Cancel this campaign?" onConfirm={() => handleAction(cancel, record._id, "Campaign cancelled")}>
              <Button size="small" danger icon={<StopOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          New Campaign
        </Button>
      </div>
      <Table rowKey="_id" loading={loading} dataSource={campaigns} columns={columns} />
    </div>
  );
}

CampaignList.propTypes = {
  onViewDetail: PropTypes.func.isRequired,
};
