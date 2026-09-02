import React from "react";
import { Table, Tag, Tooltip } from "antd";
import PropTypes from "prop-types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import useJobAnalyticsStore from "@/stores/JobAnalyticsStore";
import { RUN_STATUS_COLORS } from "./statusMeta";

dayjs.extend(relativeTime);

export default function JobList({ onSelectJob }) {
  const { jobs, jobsLoading } = useJobAnalyticsStore();

  const columns = [
    { title: "Job", dataIndex: "jobName", key: "jobName" },
    {
      title: "Last run",
      key: "lastRun",
      render: (_, row) =>
        row.lastRun?.startedAt ? (
          <Tooltip title={dayjs(row.lastRun.startedAt).format("DD MMM YYYY, HH:mm")}>
            {dayjs(row.lastRun.startedAt).fromNow()}
          </Tooltip>
        ) : (
          <span className="text-gray-400">Never</span>
        ),
    },
    {
      title: "Last status",
      key: "lastStatus",
      render: (_, row) =>
        row.lastRun ? (
          <Tag color={RUN_STATUS_COLORS[row.lastRun.status]}>{row.lastRun.status}</Tag>
        ) : (
          "—"
        ),
    },
    { title: "Total runs", dataIndex: "totalRuns", key: "totalRuns" },
    {
      title: "Errored runs",
      dataIndex: "errorRuns",
      key: "errorRuns",
      render: (v) => (v ? <span className="text-red-500">{v}</span> : v),
    },
    {
      title: "Messages (sent / delivered / read / failed)",
      key: "messageStats",
      render: (_, row) => {
        const s = row.messageStats || {};
        const sent = (s.sent || 0) + (s.delivered || 0) + (s.read || 0);
        const delivered = (s.delivered || 0) + (s.read || 0);
        const failed = (s.failed || 0) + (s.undeliverable || 0);
        if (!sent && !failed) return <span className="text-gray-400">—</span>;
        return `${sent} / ${delivered} / ${s.read || 0} / ${failed}`;
      },
    },
  ];

  return (
    <Table
      rowKey="jobName"
      dataSource={jobs}
      columns={columns}
      loading={jobsLoading}
      pagination={false}
      onRow={(row) => ({
        onClick: () => onSelectJob(row.jobName),
        style: { cursor: "pointer" },
      })}
    />
  );
}

JobList.propTypes = {
  onSelectJob: PropTypes.func.isRequired,
};
