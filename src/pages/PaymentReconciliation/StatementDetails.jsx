import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert, Button, Card, Col, Input, Row, Spin, Statistic, Table, Tabs, Typography } from 'antd';
import { ArrowLeftOutlined, DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import Title from '@components/layouts/Title';
import { usePaymentStatementDetail } from '@hooks/usePaymentReconciliation';
import { formatDate, formatDateTime } from '@utils/helper';

const { Text } = Typography;

const rupees = (value) => `₹ ${Number(value || 0).toLocaleString('en-IN')}`;

// Bill pages open in a new tab so the reconciliation view keeps its place.
const billLink = (billId, label) => (
  <Link to={`/manager/bills/${billId}`} target='_blank' rel='noopener noreferrer'>{label}</Link>
);

const txnColumns = [
  { title: 'Date', dataIndex: 'txnDate', key: 'txnDate', width: 170 },
  { title: 'Transaction ID', dataIndex: 'transactionId', key: 'transactionId' },
  { title: 'RRN / UPI Ref', dataIndex: 'rrn', key: 'rrn' },
  { title: 'Mode', dataIndex: 'mode', key: 'mode' },
  { title: 'Customer', dataIndex: 'customer', key: 'customer' },
  { title: 'Amount', dataIndex: 'amount', key: 'amount', align: 'right', render: rupees },
];

const matchColumns = [
  { title: 'Date', dataIndex: 'txnDate', key: 'txnDate', width: 170 },
  { title: 'RRN / UPI Ref', dataIndex: 'rrn', key: 'rrn' },
  { title: 'Mode', dataIndex: 'mode', key: 'mode' },
  {
    title: 'Bill(s)',
    key: 'bills',
    render: (_, record) => (
      <div className='flex flex-col'>
        {record.bills.map((bill) => (
          <span key={bill.billId}>{billLink(bill.billId, bill.invoice)} <Text type='secondary'>{bill.student}</Text></span>
        ))}
      </div>
    ),
  },
  { title: 'Statement', dataIndex: 'amount', key: 'amount', align: 'right', render: rupees },
  { title: 'ERP', dataIndex: 'erpAmount', key: 'erpAmount', align: 'right', render: rupees },
  {
    title: 'Difference',
    dataIndex: 'difference',
    key: 'difference',
    align: 'right',
    render: (value) => <Text type={Math.abs(value) > 1 ? 'danger' : undefined}>{rupees(value)}</Text>,
  },
];

const billColumns = [
  { title: 'Invoice', key: 'invoice', render: (_, record) => billLink(record.billId, record.invoice) },
  { title: 'Student', dataIndex: 'student', key: 'student' },
  { title: 'Center', dataIndex: 'center', key: 'center' },
  { title: 'Paid On', dataIndex: 'paymentDate', key: 'paymentDate' },
  { title: 'Method', dataIndex: 'method', key: 'method', className: 'capitalize' },
  { title: 'Transaction ID', dataIndex: 'transactionId', key: 'transactionId', render: (value) => value || <Text type='secondary'>—</Text> },
  { title: 'Amount', dataIndex: 'amount', key: 'amount', align: 'right', render: rupees },
];

const TABS = [
  {
    key: 'statementOnly',
    label: 'In statement, not in ERP',
    columns: txnColumns,
    hint: 'The gateway or bank recorded these payments but no paid bill carries their transaction ID. Find the bill and add the ID, or record the payment.',
  },
  {
    key: 'erpOnly',
    label: 'In ERP, not in statement',
    columns: billColumns,
    hint: 'Bills paid in this period whose transaction ID is not in the statement — check for a typo or a payment that never settled. Cash bills are excluded.',
  },
  {
    key: 'mismatched',
    label: 'Amount mismatch',
    columns: matchColumns,
    hint: 'The transaction ID matched, but the bill amount differs from what was received in the statement.',
  },
  {
    key: 'missingTxnId',
    label: 'Paid without transaction ID',
    columns: billColumns,
    hint: 'Non-cash bills paid in this period with no transaction ID, so they cannot be matched. Add the ID on the bill, then re-run matching.',
  },
  { key: 'matched', label: 'Matched', columns: matchColumns, hint: 'Transaction ID and amount both agree.' },
];

function StatementDetails() {
  const { id } = useParams();
  const { statement, lists, detailLoading, reconciling, search, setSearch, getStatement, reconcile, exportList } = usePaymentStatementDetail();

  useEffect(() => {
    if (id) getStatement(id);
  }, [id]);

  if (!statement || !lists) {
    return (
      <Title title='Payment Statement'>
        <div className='flex justify-center p-10'>{detailLoading ? <Spin /> : <Text type='secondary'>Statement not found</Text>}</div>
      </Title>
    );
  }

  const summary = statement.summary || {};

  return (
    <Title title='Payment Statement'>
      <div className='flex flex-wrap gap-3 justify-between items-center'>
        <div>
          <Link to='/manager/payment-reconciliation'><ArrowLeftOutlined /> All statements</Link>
          <p className='mt-1 font-semibold'>{statement.fileName}</p>
          <Text type='secondary'>
            {formatDate(statement.periodFrom)} – {formatDate(statement.periodTo)} · {statement.rowCount} transactions
            {statement.skippedCount > 0 && ` · ${statement.skippedCount} non-success rows skipped`}
            {statement.reconciledAt && ` · matched ${formatDateTime(statement.reconciledAt)}`}
          </Text>
        </div>
        <Button icon={<ReloadOutlined />} loading={reconciling} onClick={() => reconcile(id)}>
          Re-run matching
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={12} md={8} xl={4}><Card><Statistic title='Statement total' value={rupees(summary.statementTotal)} /></Card></Col>
        <Col xs={12} md={8} xl={4}><Card><Statistic title={`Matched (${summary.matchedCount || 0})`} value={rupees(summary.matchedAmount)} valueStyle={{ color: '#16a34a' }} /></Card></Col>
        <Col xs={12} md={8} xl={4}><Card><Statistic title='Amount mismatch' value={summary.mismatchCount || 0} valueStyle={{ color: '#ea580c' }} /></Card></Col>
        <Col xs={12} md={8} xl={4}><Card><Statistic title={`Not in ERP (${summary.statementOnlyCount || 0})`} value={rupees(summary.statementOnlyAmount)} valueStyle={{ color: '#dc2626' }} /></Card></Col>
        <Col xs={12} md={8} xl={4}><Card><Statistic title={`Not in statement (${summary.erpOnlyCount || 0})`} value={rupees(summary.erpOnlyAmount)} valueStyle={{ color: '#dc2626' }} /></Card></Col>
        <Col xs={12} md={8} xl={4}><Card><Statistic title='Paid without txn ID' value={summary.missingTxnIdCount || 0} /></Card></Col>
      </Row>

      <Card>
        <Tabs
          tabBarExtraContent={
            <Input.Search allowClear placeholder='Search ID, invoice, name…' value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 240 }} />
          }
          items={TABS.map((tab) => ({
            key: tab.key,
            label: `${tab.label} (${lists[tab.key].length})`,
            children: (
              <div className='flex flex-col gap-3'>
                <div className='flex flex-wrap gap-3 justify-between items-center'>
                  <Alert type='info' showIcon message={tab.hint} className='flex-1' />
                  <Button icon={<DownloadOutlined />} onClick={() => exportList(tab.key, tab.label)}>Export</Button>
                </div>
                <Table
                  columns={tab.columns}
                  dataSource={lists[tab.key]}
                  loading={detailLoading || reconciling}
                  pagination={{ pageSize: 50, showSizeChanger: false }}
                  scroll={{ x: true }}
                  size='small'
                />
              </div>
            ),
          }))}
        />
      </Card>
    </Title>
  );
}

export default StatementDetails;
