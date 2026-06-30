import { Table, Button, Tag, Space } from "antd";
import dayjs from "dayjs";
import PropTypes from "prop-types";

const STATUS_COLORS = {
  pending: "orange",
  confirmed: "green",
  rejected: "red",
};

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Approved",
  rejected: "Rejected",
};

function ApplicationsTable({
  applications,
  loading,
  pagination,
  activeStatus,
  onPageChange,
  onApprove,
  onReject,
  onRowClick,
}) {
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name) => <span className="font-medium">{name}</span>,
    },
    {
      title: "Phone",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "Preferred Batch",
      dataIndex: "preferredBatch",
      key: "preferredBatch",
      render: (batch) => batch?.name ?? "—",
    },
    {
      title: "Applied On",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={STATUS_COLORS[status] ?? "default"}>
          {STATUS_LABELS[status] ?? status}
        </Tag>
      ),
    },
    ...(activeStatus === "pending"
      ? [
          {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
              <Space size="small">
                <Button type="primary" size="small" onClick={() => onApprove(record)}>
                  Approve
                </Button>
                <Button danger size="small" onClick={() => onReject(record)}>
                  Reject
                </Button>
              </Space>
            ),
          },
        ]
      : []),
  ];

  return (
    <Table
      rowKey="_id"
      columns={columns}
      dataSource={applications}
      loading={loading}
      pagination={{
        current: pagination.page,
        pageSize: pagination.limit,
        total: pagination.total,
        showSizeChanger: false,
        onChange: onPageChange,
      }}
      onRow={(record) => ({
        onClick: (e) => {
          if (e.target.closest("button")) return;
          onRowClick(record);
        },
        className: "cursor-pointer",
      })}
      scroll={{ x: 800 }}
    />
  );
}

ApplicationsTable.propTypes = {
  applications: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  pagination: PropTypes.shape({
    page: PropTypes.number,
    limit: PropTypes.number,
    total: PropTypes.number,
  }).isRequired,
  activeStatus: PropTypes.string,
  onPageChange: PropTypes.func.isRequired,
  onApprove: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
  onRowClick: PropTypes.func.isRequired,
};

export default ApplicationsTable;
