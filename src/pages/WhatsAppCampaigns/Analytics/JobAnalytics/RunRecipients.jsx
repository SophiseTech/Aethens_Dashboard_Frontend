import React, { useEffect, useMemo, useState } from "react";
import { Drawer, Table, Tag, Row, Col, Statistic, Select, Empty } from "antd";
import PropTypes from "prop-types";
import dayjs from "dayjs";
import EChart from "@pages/Dashboard/Chart/EChart";
import useJobAnalyticsStore from "@/stores/JobAnalyticsStore";
import { MESSAGE_STATUS_COLORS, MESSAGE_STATUSES, formatDuration } from "./statusMeta";

const PAGE_SIZE = 20;

const ts = (v) => (v ? dayjs(v).format("DD MMM, HH:mm:ss") : "—");

export default function RunRecipients({ runId, open, onClose }) {
  const {
    recipients,
    recipientsTotal,
    recipientsLoading,
    selectedRun,
    fetchRecipients,
    clearRecipients,
  } = useJobAnalyticsStore();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (open && runId) {
      setPage(1);
      setStatus(null);
    }
  }, [open, runId]);

  useEffect(() => {
    if (open && runId) {
      fetchRecipients({ runId, page, limit: PAGE_SIZE, status });
    }
  }, [open, runId, page, status]);

  const chart = useMemo(() => {
    // Job-level counters from the run's own stats; the per-status delivery
    // breakdown lives in the table below (webhook-updated per recipient).
    const stats = selectedRun?.stats || {};
    return {
      series: [
        {
          name: "Recipients",
          data: [
            stats.found ?? selectedRun?.recipientCount ?? 0,
            stats.sent ?? 0,
            stats.failed ?? 0,
          ],
        },
      ],
      options: {
        chart: { type: "bar", toolbar: { show: false } },
        plotOptions: { bar: { borderRadius: 4, columnWidth: "45%" } },
        dataLabels: { enabled: true },
        xaxis: { categories: ["Targeted", "Sent", "Failed"] },
        colors: ["#635bff"],
      },
    };
  }, [selectedRun]);

  const columns = [
    { title: "Name", dataIndex: "name", render: (v) => v || <span className="text-gray-400">—</span> },
    { title: "Phone", dataIndex: "toPhoneNumber" },
    { title: "Enquiry #", dataIndex: "enquiryNumber", render: (v) => v || "—" },
    {
      title: "Status",
      dataIndex: "status",
      render: (v) => <Tag color={MESSAGE_STATUS_COLORS[v]}>{v}</Tag>,
    },
    { title: "Sent", dataIndex: "sentAt", render: ts },
    { title: "Delivered", dataIndex: "deliveredAt", render: ts },
    { title: "Read", dataIndex: "readAt", render: ts },
    {
      title: "Error",
      dataIndex: "errorMessage",
      render: (v) => (v ? <span className="text-red-500">{v}</span> : "—"),
    },
  ];

  return (
    <Drawer open={open} onClose={onClose} afterOpenChange={(o) => !o && clearRecipients()} title="Job run — recipients" width={720}>
      {!selectedRun ? (
        <Empty />
      ) : (
        <div className="space-y-6">
          <Row gutter={16}>
            <Col span={8}>
              <Statistic title="Started" value={dayjs(selectedRun.startedAt).format("DD MMM YYYY, HH:mm")} />
            </Col>
            <Col span={8}>
              <Statistic title="Duration" value={formatDuration(selectedRun.durationMs)} />
            </Col>
            <Col span={8}>
              <Statistic title="Recipients" value={selectedRun.recipientCount || 0} />
            </Col>
          </Row>

          <EChart series={chart.series} options={chart.options} height={220} />

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Filter status</span>
            <Select
              allowClear
              placeholder="All"
              style={{ width: 180 }}
              value={status}
              onChange={(v) => {
                setStatus(v || null);
                setPage(1);
              }}
              options={MESSAGE_STATUSES.map((s) => ({ label: s, value: s }))}
            />
          </div>

          <Table
            rowKey="_id"
            size="small"
            dataSource={recipients}
            columns={columns}
            loading={recipientsLoading}
            pagination={{
              current: page,
              pageSize: PAGE_SIZE,
              total: recipientsTotal,
              onChange: setPage,
              showSizeChanger: false,
            }}
          />
        </div>
      )}
    </Drawer>
  );
}

RunRecipients.propTypes = {
  runId: PropTypes.string,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
