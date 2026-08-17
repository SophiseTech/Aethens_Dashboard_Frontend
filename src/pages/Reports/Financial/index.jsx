import { Card, DatePicker, Button, Typography } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import Title from '@components/layouts/Title';
import useReports from '@hooks/useReports';

const { Text } = Typography;

function FinancialReports() {
  const { selectedMonth, loading, setSelectedMonth, downloadFinancialAuditReport } = useReports();

  const handleMonthChange = (date) => {
    if (date) setSelectedMonth(date.toDate());
  };

  return (
    <Title title="Financial Reports">
      <Card title="Audit Report">
        <Text type="secondary">
          Active students, opening balance, current due, total paid, and closing balance for the selected month.
        </Text>
        <div className="flex flex-wrap gap-3 items-end mt-4">
          <div>
            <label className="text-sm font-semibold block mb-2">Select Month</label>
            <DatePicker
              picker="month"
              value={dayjs(selectedMonth)}
              onChange={handleMonthChange}
              format="MMMM YYYY"
              style={{ width: 200 }}
            />
          </div>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            loading={loading}
            onClick={downloadFinancialAuditReport}
          >
            Download Audit Report
          </Button>
        </div>
      </Card>
    </Title>
  );
}

export default FinancialReports;
