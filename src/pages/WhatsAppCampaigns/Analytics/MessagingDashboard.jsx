import React, { useEffect, useMemo } from "react";
import { Row, Col, Table, Tag } from "antd";
import { SendOutlined, CheckCircleOutlined, EyeOutlined } from "@ant-design/icons";
import DataDisplay from "@pages/Dashboard/Components/DataDisplay";
import EChart from "@pages/Dashboard/Chart/EChart";
import useWhatsAppAnalyticsStore from "@/stores/WhatsAppAnalyticsStore";

export default function MessagingDashboard() {
  const { kpis, templatePerformance, loading, fetchDashboard } = useWhatsAppAnalyticsStore();

  useEffect(() => {
    fetchDashboard({});
  }, []);

  const totals = kpis?.totals || {};
  const sent = (totals.sent || 0) + (totals.delivered || 0) + (totals.read || 0);
  const delivered = (totals.delivered || 0) + (totals.read || 0);
  const read = totals.read || 0;

  const trendSeries = useMemo(
    () => [{ name: "Messages sent", data: (kpis?.trend || []).map((t) => t.count) }],
    [kpis]
  );
  const trendOptions = useMemo(
    () => ({
      chart: { type: "line", toolbar: { show: false } },
      xaxis: { categories: (kpis?.trend || []).map((t) => t.date) },
      stroke: { curve: "smooth", width: 2 },
      colors: ["#635bff"],
    }),
    [kpis]
  );

  const templateColumns = [
    { title: "Template", dataIndex: "name" },
    { title: "Category", dataIndex: "category", render: (v) => <Tag>{v}</Tag> },
    { title: "Sent", dataIndex: "sent" },
    { title: "Delivered", dataIndex: "delivered" },
    { title: "Read", dataIndex: "read" },
    { title: "Failed", dataIndex: "failed" },
    { title: "Delivery rate", dataIndex: "deliveryRate", render: (v) => `${(v * 100).toFixed(1)}%` },
    { title: "Read rate", dataIndex: "readRate", render: (v) => `${(v * 100).toFixed(1)}%` },
  ];

  return (
    <div className="space-y-4">
      <Row gutter={16}>
        <Col span={6}>
          <DataDisplay title="Campaigns" count={kpis?.totalCampaigns || 0} icon={<SendOutlined className="text-white" />} loading={loading} />
        </Col>
        <Col span={6}>
          <DataDisplay title="Messages sent" count={sent} icon={<SendOutlined className="text-white" />} loading={loading} />
        </Col>
        <Col span={6}>
          <DataDisplay
            title="Delivery rate"
            count={sent ? Number(((delivered / sent) * 100).toFixed(1)) : 0}
            suffix="%"
            icon={<CheckCircleOutlined className="text-white" />}
            loading={loading}
          />
        </Col>
        <Col span={6}>
          <DataDisplay
            title="Read rate"
            count={delivered ? Number(((read / delivered) * 100).toFixed(1)) : 0}
            suffix="%"
            icon={<EyeOutlined className="text-white" />}
            loading={loading}
          />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <div className="bg-white rounded p-4 border border-border">
            <div className="font-medium mb-2">Message volume over time</div>
            <EChart series={trendSeries} options={trendOptions} height={280} />
          </div>
        </Col>
      </Row>

      <div>
        <div className="font-medium mb-2">Template performance</div>
        <Table rowKey="templateId" dataSource={templatePerformance} columns={templateColumns} loading={loading} pagination={false} />
      </div>
    </div>
  );
}
