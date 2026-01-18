import React, { useEffect } from 'react';
import { Modal, Table, Spin, Alert, Row, Col, Statistic, Tag, Button } from 'antd';
import { useStore } from 'zustand';
import feeStore from '@stores/FeeStore';
import { formatDate } from '@utils/helper';

const FeeTracker = ({ student, visible, onCancel }) => {
  const { feeDetails, loading, error, getFeeDetailsByStudent, markAsPaid } = useStore(feeStore);

  useEffect(() => {
    if (student?._id) {
      getFeeDetailsByStudent(student._id);
    }
  }, [student, getFeeDetailsByStudent]);

  const handleMarkAsPaid = async (billId) => {
    await markAsPaid(billId);
    getFeeDetailsByStudent(student._id);
  };

  const columns = [
    {
      title: 'Invoice No',
      dataIndex: 'invoiceNo',
      key: 'invoiceNo',
    },
    {
      title: 'Generated On',
      dataIndex: 'generated_on',
      key: 'generated_on',
      render: (date) => formatDate(date),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        record.subject === 'course' && (
          <Button
            type="primary"
            onClick={() => handleMarkAsPaid(record._id)}
            disabled={record.status === 'paid'}
          >
            Mark as Paid
          </Button>
        )
      ),
    },
  ];

  const renderMonthStatus = () => {
    if (!feeDetails?.feeAccount?.installments) {
      return null;
    }

    return (
      <div style={{ display: 'flex', overflowX: 'auto', padding: '10px 0' }}>
        {feeDetails.feeAccount.installments.map((installment) => (
          <Tag
            key={installment.month}
            color={installment.status === 'paid' ? 'green' : 'red'}
            style={{ marginRight: 8, flexShrink: 0 }}
          >
            {formatDate(installment.month, 'MMM YYYY')} - {installment.amount}
          </Tag>
        ))}
      </div>
    );
  };

  return (
    <Modal
      title="Fee Tracker"
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      {loading ? (
        <Spin />
      ) : error ? (
        <Alert message="Error" description={error} type="error" />
      ) : feeDetails ? (
        <div>
          <Row gutter={16} style={{ marginBottom: 20 }}>
            <Col span={8}>
              <div style={{ background: '#fff7d6', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                <Statistic title="Total Fees" value={feeDetails.summary.totalFees} />
              </div>
            </Col>
            <Col span={8}>
              <div style={{ background: '#e6ffed', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                <Statistic title="Amount Paid" value={feeDetails.summary.amountPaid} />
              </div>
            </Col>
            <Col span={8}>
              <div style={{ background: '#fff1f0', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                <Statistic title="Balance" value={feeDetails.summary.balance} />
              </div>
            </Col>
          </Row>

          <Table columns={columns} dataSource={feeDetails.bills} rowKey="_id" />

          <h3 style={{ marginTop: "2rem" }}>Installment Status</h3>
          {feeDetails.feeAccount?.isInstallment ? (
            renderMonthStatus()
          ) : (
            <Alert message="This fee is not an installment." type="info" showIcon />
          )}
        </div>
      ) : (
        <Alert message="No fee details found for this student." type="info" />
      )}
    </Modal>
  );
};

export default FeeTracker;
