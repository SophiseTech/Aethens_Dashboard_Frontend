import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Popconfirm, Table, Tag, Typography, Upload } from 'antd';
import { DeleteOutlined, InboxOutlined } from '@ant-design/icons';
import Title from '@components/layouts/Title';
import { usePaymentStatements } from '@hooks/usePaymentReconciliation';
import { formatDate, formatDateTime } from '@utils/helper';

const { Text } = Typography;

const rupees = (value) => `₹ ${Number(value || 0).toLocaleString('en-IN')}`;

function PaymentReconciliation() {
  const nav = useNavigate();
  const { statements, statementsLoading, uploading, getStatements, parseAndUpload, deleteStatement } = usePaymentStatements();

  useEffect(() => {
    getStatements();
  }, []);

  const handleUpload = async (file) => {
    const statement = await parseAndUpload(file);
    if (statement?._id) nav(`/manager/payment-reconciliation/${statement._id}`);
    return false; // handled manually — stop antd from posting the file
  };

  const columns = [
    { title: 'File', dataIndex: 'fileName', key: 'fileName', render: (name) => name || '-' },
    {
      title: 'Period',
      key: 'period',
      render: (_, record) => `${formatDate(record.periodFrom)} – ${formatDate(record.periodTo)}`,
    },
    { title: 'Transactions', dataIndex: 'rowCount', key: 'rowCount' },
    { title: 'Statement Total', key: 'total', render: (_, record) => rupees(record.summary?.statementTotal) },
    {
      title: 'Result',
      key: 'result',
      render: (_, { summary = {} }) => (
        <div className='flex flex-wrap gap-1'>
          <Tag color='green'>{summary.matchedCount || 0} matched</Tag>
          {summary.mismatchCount > 0 && <Tag color='orange'>{summary.mismatchCount} amount mismatch</Tag>}
          {summary.statementOnlyCount > 0 && <Tag color='red'>{summary.statementOnlyCount} not in ERP</Tag>}
          {summary.erpOnlyCount > 0 && <Tag color='volcano'>{summary.erpOnlyCount} not in statement</Tag>}
        </div>
      ),
    },
    {
      title: 'Uploaded',
      key: 'uploaded',
      render: (_, record) => (
        <span>
          {formatDateTime(record.createdAt)}
          {record.uploadedBy?.username && <Text type='secondary'> · {record.uploadedBy.username}</Text>}
        </span>
      ),
    },
    {
      title: '',
      key: 'actions',
      render: (_, record) => (
        <Popconfirm
          title='Delete statement?'
          description='Bills matched only by this statement lose their reconciled status.'
          onConfirm={(e) => { e?.stopPropagation(); deleteStatement(record._id); }}
          onCancel={(e) => e?.stopPropagation()}
        >
          <Button type='text' danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Title title='Payment Reconciliation'>
      <Card>
        <Upload.Dragger accept='.csv,.xlsx,.xls' showUploadList={false} beforeUpload={handleUpload} disabled={uploading}>
          <p className='ant-upload-drag-icon'><InboxOutlined /></p>
          <p className='ant-upload-text'>{uploading ? 'Uploading and matching…' : 'Upload a payment transactions statement'}</p>
          <p className='ant-upload-hint'>
            CSV downloaded from the payment gateway or bank dashboard. Transactions are matched to paid bills by their Transaction ID
            (transaction ID, order ID or UPI / card RRN).
          </p>
        </Upload.Dragger>
      </Card>
      <Card title='Uploaded Statements'>
        <Table
          rowKey='_id'
          columns={columns}
          dataSource={statements}
          loading={statementsLoading}
          scroll={{ x: true }}
          onRow={(record) => ({ onClick: () => nav(`/manager/payment-reconciliation/${record._id}`), className: 'cursor-pointer' })}
        />
      </Card>
    </Title>
  );
}

export default PaymentReconciliation;
