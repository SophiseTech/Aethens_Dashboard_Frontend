import { useEffect } from 'react';
import { Card, DatePicker, Table, Typography, Tag, Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import Title from '@components/layouts/Title';
import useReports from '@hooks/useReports';
import { formatDate } from '@utils/helper';
import { STUDENT_DEACTIVATION_REASONS } from '@utils/constants';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const resolveReasonLabel = (record) => {
  if (!record.deactivation_reason) return '-';
  if (record.deactivation_reason === 'other') {
    return record.deactivation_reason_other || 'Other';
  }
  return STUDENT_DEACTIVATION_REASONS.find((r) => r.value === record.deactivation_reason)?.label
    || record.deactivation_reason;
};

const columns = [
  { title: 'Name', dataIndex: 'username', key: 'username' },
  { title: 'Admission Number', dataIndex: 'admissionNumber', key: 'admissionNumber' },
  { title: 'Phone', dataIndex: 'phone', key: 'phone' },
  { title: 'Center', dataIndex: 'centerName', key: 'centerName' },
  { title: 'Course', dataIndex: 'courseName', key: 'courseName' },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status) => <Tag color="red">{status}</Tag>,
  },
  {
    title: 'Deactivation Reason',
    key: 'deactivation_reason',
    render: (_, record) => resolveReasonLabel(record),
  },
  {
    title: 'Deactivated At',
    dataIndex: 'deactivated_at',
    key: 'deactivated_at',
    render: (date) => formatDate(date),
  },
];

function StudentReports() {
  const {
    deactivatedStudents,
    deactivatedStudentsTotal,
    deactivatedStudentsLoading,
    deactivatedStudentsDownloading,
    deactivatedDateRange,
    setDeactivatedDateRange,
    getDeactivatedStudentsReport,
    downloadDeactivatedStudentsReport,
  } = useReports();

  useEffect(() => {
    getDeactivatedStudentsReport();
  }, []);

  const handleRangeChange = (range) => {
    setDeactivatedDateRange(range || []);
    if (range && range[0] && range[1]) {
      getDeactivatedStudentsReport();
    }
  };

  return (
    <Title title="Student Reports">
      <Card title="Deactivated Students">
        <Text type="secondary">
          Students deactivated within the selected date range.
        </Text>
        <div className="flex flex-wrap gap-3 items-end mt-4 mb-4">
          <div>
            <label className="text-sm font-semibold block mb-2">Select Date Range</label>
            <RangePicker
              value={deactivatedDateRange}
              onChange={handleRangeChange}
              format="DD MMM YYYY"
              allowClear={false}
            />
          </div>
          <Button
            icon={<DownloadOutlined />}
            loading={deactivatedStudentsDownloading}
            disabled={!deactivatedStudents.length}
            onClick={downloadDeactivatedStudentsReport}
          >
            Download
          </Button>
        </div>
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={deactivatedStudents}
          loading={deactivatedStudentsLoading}
          pagination={{ pageSize: 20, total: deactivatedStudentsTotal }}
          scroll={{ x: true }}
        />
      </Card>
    </Title>
  );
}

export default StudentReports;
