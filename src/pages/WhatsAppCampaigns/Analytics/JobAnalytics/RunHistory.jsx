import React, { useEffect, useState } from "react";
import { Table, Tag, Button } from "antd";
import PropTypes from "prop-types";
import dayjs from "dayjs";
import useJobAnalyticsStore from "@/stores/JobAnalyticsStore";
import { RUN_STATUS_COLORS, formatDuration } from "./statusMeta";

const PAGE_SIZE = 20;

export default function RunHistory({ jobName, onViewRecipients }) {
  const { runs, runsTotal, runsLoading, fetchRuns } = useJobAnalyticsStore();
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [jobName]);

  useEffect(() => {
    fetchRuns({ jobName, page, limit: PAGE_SIZE });
  }, [jobName, page]);

  const columns = [
    {
      title: "Started",
      dataIndex: "startedAt",
      key: "startedAt",
      render: (v) => (v ? dayjs(v).format("DD MMM YYYY, HH:mm:ss") : "—"),
    },
    {
      title: "Trigger",
      dataIndex: "trigger",
      key: "trigger",
      render: (v) => <Tag>{v}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (v) => <Tag color={RUN_STATUS_COLORS[v]}>{v}</Tag>,
    },
    {
      title: "Duration",
      dataIndex: "durationMs",
      key: "durationMs",
      render: formatDuration,
    },
    {
      title: "Found / Sent / Failed",
      key: "stats",
      render: (_, row) => {
        const s = row.stats || {};
        if (s.found == null && s.sent == null) return <span className="text-gray-400">—</span>;
        return `${s.found ?? 0} / ${s.sent ?? 0} / ${s.failed ?? 0}`;
      },
    },
    {
      title: "Delivery (sent / delivered / read / failed)",
      key: "messageStats",
      render: (_, row) => {
        const s = row.messageStats || {};
        const sent = (s.sent || 0) + (s.delivered || 0) + (s.read || 0);
        const delivered = (s.delivered || 0) + (s.read || 0);
        const failed = (s.failed || 0) + (s.undeliverable || 0);
        if (!row.recipientCount) return <span className="text-gray-400">—</span>;
        return `${sent} / ${delivered} / ${s.read || 0} / ${failed}`;
      },
    },
    {
      title: "",
      key: "action",
      render: (_, row) =>
        row.recipientCount ? (
          <Button type="link" size="small" onClick={() => onViewRecipients(row._id)}>
            Recipients ({row.recipientCount})
          </Button>
        ) : null,
    },
  ];

  return (
    <Table
      rowKey="_id"
      dataSource={runs}
      columns={columns}
      loading={runsLoading}
      pagination={{
        current: page,
        pageSize: PAGE_SIZE,
        total: runsTotal,
        onChange: setPage,
        showSizeChanger: false,
      }}
    />
  );
}

RunHistory.propTypes = {
  jobName: PropTypes.string.isRequired,
  onViewRecipients: PropTypes.func.isRequired,
};
