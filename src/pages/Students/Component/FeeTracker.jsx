import React, { useEffect, useState } from 'react';
import { Modal, Table, Spin, Alert, Row, Col, Statistic, Tag, Button, InputNumber, Form, DatePicker, Select } from 'antd';
import { useStore } from 'zustand';
import feeStore from '@stores/FeeStore';
import { formatDate } from '@utils/helper';

const FeeTracker = ({ student, visible, onCancel }) => {
  const { feeDetails, loading, error, getFeeDetailsByStudent, markAsPaid, markPartialPayment } = useStore(feeStore);
  const [paymentModal, setPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [form] = Form.useForm();
  const isPartialPayment = feeDetails?.feeAccount?.type === 'partial';

  useEffect(() => {
    if (student?._id) {
      getFeeDetailsByStudent(student._id);
    }
  }, [student, getFeeDetailsByStudent]);

  const handleMarkAsPaid = async (bill) => {
    setSelectedBill(bill);
    form.resetFields();
    setPaymentModal(true);
  };

  const handlePaymentSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (isPartialPayment) {
        // Partial payment: custom amount
        const payload = {
          paidAmount: values.paidAmount,
          bill_id: selectedBill._id,
          payment_method: values.payment_method,
          payment_date: values.payment_date?.toISOString(),
        };
        await markPartialPayment(feeDetails.feeAccount._id, payload);
      } else {
        // Full payment: standard mark as paid with payment details
        const payload = {
          payment_method: values.payment_method,
          payment_date: values.payment_date?.toISOString(),
        };
        await markAsPaid(selectedBill._id, payload);
      }

      setPaymentModal(false);
      getFeeDetailsByStudent(student._id);
      form.resetFields();
      setSelectedBill(null);
    } catch (error) {
      console.error('Error processing payment:', error);
    }
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
            onClick={() => handleMarkAsPaid(record)}
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
    <>
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

            <div className='bg-[#fff1f0] flex gap-3 p-3 justify-evenly mb-[20px] rounded-lg'>
              <div className='flex flex-col gap-1 items-center'>
                <p className='text-stone-500'>Course Fee</p>
                <p className='font-bold text-lg'>{feeDetails.summary?.total_course_fee?.toFixed(2)}</p>
              </div>
              <div className='flex flex-col gap-1 items-center'>
                <p className='text-stone-500'>Course Registration Fee</p>
                <p className='font-bold text-lg'>{feeDetails.summary?.courseRegFee?.toFixed(2)}</p>
              </div>
              <div className='flex flex-col gap-1 items-center'>
                <p className='text-stone-500'>Total Tax</p>
                <p className='font-bold text-lg'>{feeDetails.summary?.totalTax?.toFixed(2)}</p>
              </div>
            </div>

            <Table columns={columns} dataSource={feeDetails.bills} rowKey="_id" />

            <h3 style={{ }}>Installment Status</h3>
            {feeDetails.feeAccount?.isInstallment ? (
              <Alert message="This fee is an installment." type="success" showIcon />
            ) : (
              <Alert message="This fee is not an installment." type="info" showIcon />
            )}
          </div>
        ) : (
          <Alert message="No fee details found for this student." type="info" />
        )}
      </Modal>

      <Modal
        title={`Payment - Invoice ${selectedBill?.invoiceNo}`}
        visible={paymentModal}
        onCancel={() => {
          setPaymentModal(false);
          form.resetFields();
          setSelectedBill(null);
        }}
        onOk={handlePaymentSubmit}
        okText="Submit Payment"
        loading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            paidAmount: selectedBill?.total,
          }}
        >
          {isPartialPayment && (
            <Form.Item
              label="Paid Amount"
              name="paidAmount"
              rules={[
                { required: true, message: 'Please enter paid amount' },
                {
                  validator: (_, value) => {
                    if (value > selectedBill?.total) {
                      return Promise.reject(new Error(`Amount cannot exceed balance of ${selectedBill?.total}`));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <InputNumber
                min={0}
                max={selectedBill?.total}
                step={0.01}
                precision={2}
                style={{ width: '100%' }}
              />
            </Form.Item>
          )}

          <Form.Item
            label="Payment Method"
            name="payment_method"
          >
            <Select
              placeholder="Select payment method (optional)"
              allowClear
              options={[
                { label: 'Cash', value: 'cash' },
                { label: 'Bank Transfer', value: 'bank_transfer' },
                { label: 'Card', value: 'card' },
                { label: 'Cheque', value: 'cheque' },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Payment Date"
            name="payment_date"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default FeeTracker;
