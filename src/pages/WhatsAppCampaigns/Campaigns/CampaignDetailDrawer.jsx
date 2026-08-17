import React, { useEffect } from "react";
import { Drawer, Descriptions, Statistic, Row, Col, Empty } from "antd";
import PropTypes from "prop-types";
import EChart from "@pages/Dashboard/Chart/EChart";
import useWhatsAppAnalyticsStore from "@/stores/WhatsAppAnalyticsStore";

export default function CampaignDetailDrawer({ campaignId, open, onClose }) {
  const { funnel, fetchFunnel } = useWhatsAppAnalyticsStore();

  useEffect(() => {
    if (open && campaignId) fetchFunnel(campaignId);
  }, [open, campaignId]);

  const stats = funnel?.stats || {};

  const chartSeries = [
    {
      name: "Messages",
      data: [stats.queued || 0, stats.sent || 0, stats.delivered || 0, stats.read || 0, stats.failed || 0],
    },
  ];
  const chartOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 4, columnWidth: "50%" } },
    dataLabels: { enabled: true },
    xaxis: { categories: ["Queued", "Sent", "Delivered", "Read", "Failed"] },
    colors: ["#635bff"],
  };

  return (
    <Drawer open={open} onClose={onClose} title="Campaign delivery funnel" width={520}>
      {!funnel ? (
        <Empty />
      ) : (
        <div className="space-y-6">
          <Row gutter={16}>
            <Col span={8}>
              <Statistic title="Total recipients" value={stats.totalRecipients || 0} />
            </Col>
            <Col span={8}>
              <Statistic title="Delivery rate" value={((funnel.rates?.deliveryRate || 0) * 100).toFixed(1)} suffix="%" />
            </Col>
            <Col span={8}>
              <Statistic title="Read rate" value={((funnel.rates?.readRate || 0) * 100).toFixed(1)} suffix="%" />
            </Col>
          </Row>

          <EChart series={chartSeries} options={chartOptions} height={260} />

          <Descriptions title="Exclusions" column={1} size="small" bordered>
            <Descriptions.Item label="Missing phone">{stats.excludedMissingPhone || 0}</Descriptions.Item>
            <Descriptions.Item label="Invalid phone">{stats.excludedInvalidPhone || 0}</Descriptions.Item>
            <Descriptions.Item label="Duplicate">{stats.excludedDuplicate || 0}</Descriptions.Item>
            <Descriptions.Item label="Opted out">{stats.excludedOptedOut || 0}</Descriptions.Item>
          </Descriptions>
        </div>
      )}
    </Drawer>
  );
}

CampaignDetailDrawer.propTypes = {
  campaignId: PropTypes.string,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
