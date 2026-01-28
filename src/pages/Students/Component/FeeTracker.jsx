import React, { useEffect, useState, useMemo } from 'react';
import { Modal, Table, Spin, Alert, Row, Col, Statistic, Tag, Button, InputNumber, Form, DatePicker, Select, Card, Checkbox, Space, Divider, Flex } from 'antd';
import { WalletOutlined, DollarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useStore } from 'zustand';
import feeStore from '@stores/FeeStore';
import { formatDate } from '@utils/helper';
import CustomInput from '@components/form/CustomInput';
import { paymentMethods } from '@utils/constants';

const FeeTracker = ({ student, visible, onCancel }) => {
  const { feeDetails, loading, error, getFeeDetailsByStudent, markAsPaid, markPartialPayment } = useStore(feeStore);
  const [paymentModal, setPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [form] = Form.useForm();
  const [useWallet, setUseWallet] = useState(false);
  const paidAmount = Form.useWatch('paidAmount', form);
  const isPartialPayment = feeDetails?.feeAccount?.type === 'partial';

  const walletBalance = useMemo(() => {
    return student?.wallet?.balance || 0;
  }, [student?.wallet?.balance]);

  const excessPayment = useMemo(() => {
    return Math.max(0, paidAmount - (selectedBill?.total || 0));
  }, [paidAmount, selectedBill?.total]);

  const walletDeduction = useMemo(() => {
    return useWallet && walletBalance > 0 ? Math.min(walletBalance, selectedBill?.total || 0) : 0;
  }, [useWallet, walletBalance, selectedBill?.total]);

  useEffect(() => {
    if (student?._id) {
      getFeeDetailsByStudent(student._id);
    }
  }, [student, getFeeDetailsByStudent]);

  const handleMarkAsPaid = async (bill) => {
    setSelectedBill(bill);
    setUseWallet(false);
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
          useWallet: useWallet,
          walletDeduction: walletDeduction,
          excessPayment: excessPayment,
          newWalletBalance: walletBalance + excessPayment - walletDeduction,
          walletId: student?.wallet?._id || null,
        };
        await markPartialPayment(feeDetails.feeAccount._id, payload);
      } else {
        // Full payment: standard mark as paid with payment details
        const payload = {
          payment_method: values.payment_method,
          payment_date: values.payment_date?.toISOString(),
          useWallet: useWallet,
          walletDeduction: walletDeduction,
          excessPayment: excessPayment,
          newWalletBalance: walletBalance + excessPayment - walletDeduction,
          walletId: student?.wallet?._id || null,
        };
        await markAsPaid(selectedBill._id, payload);
      }

      setPaymentModal(false);
      getFeeDetailsByStudent(student._id);
      form.resetFields();
      setSelectedBill(null);
      setUseWallet(false);
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
                  <Statistic title="Total Fees" value={feeDetails.summary.totalFees?.toFixed(2)} />
                </div>
              </Col>
              <Col span={8}>
                <div style={{ background: '#e6ffed', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                  <Statistic title="Amount Paid" value={feeDetails.summary.amountPaid?.toFixed(2)} />
                </div>
              </Col>
              <Col span={8}>
                <div style={{ background: '#fff1f0', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                  <Statistic title="Balance" value={feeDetails.summary.balance?.toFixed(2)} />
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

            <h3 style={{}}>Installment Status</h3>
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
          setUseWallet(false);
        }}
        onOk={handlePaymentSubmit}
        okText="Submit Payment"
        loading={loading}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            paidAmount: selectedBill?.total,
          }}
        >
          {isPartialPayment && (
            <CustomInput name={"paidAmount"} label={"Paid Amount"} rules={[
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
              type='number'
            />
          )}

          <CustomInput name={"paidAmount"} label={"Paid Amount"} rules={[
            { required: true, message: 'Please enter paid amount' },
            {
              validator: (_, value) => {
                if (!value || value <= 0) {
                  return Promise.reject(new Error('Please enter a valid payment amount'));
                }
                return Promise.resolve();
              }
            }
          ]}
            type='number'
          />

          {paidAmount > 0 && (
            <div className="space-y-3 mb-4">
              <Alert
                message={
                  paidAmount < (selectedBill?.total || 0) ? "Insufficient Payment" :
                    paidAmount === (selectedBill?.total || 0) ? "Exact Payment" :
                      `Excess Payment: ₹${excessPayment.toFixed(2)}`
                }
                description={
                  paidAmount < (selectedBill?.total || 0)
                    ? `Amount due: ₹${((selectedBill?.total || 0) - paidAmount).toFixed(2)}`
                    : paidAmount > (selectedBill?.total || 0)
                      ? `This amount will be credited to the wallet`
                      : ""
                }
                type={paidAmount < (selectedBill?.total || 0) ? "error" : paidAmount > (selectedBill?.total || 0) ? "warning" : "success"}
                showIcon
                icon={paidAmount > (selectedBill?.total || 0) ? <WalletOutlined /> : undefined}
                style={{ fontSize: "12px" }}
              />
            </div>
          )}

          {walletBalance > 0 && paidAmount > 0 && paidAmount <= (selectedBill?.total || 0) && (
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 mb-4" style={{ borderLeft: "4px solid #1890ff" }}>
              <Space direction="vertical" className="w-full" size="middle">
                <div className="flex items-center justify-between">
                  <Flex vertical>
                    <p className="text-sm text-gray-600 mb-1">Available Wallet Balance</p>
                    <div className='flex gap-2 items-center'>
                      <WalletOutlined className="text-2xl text-blue-600" />
                      <p className="text-2xl font-bold text-blue-600">₹{walletBalance.toFixed(2)}</p>
                    </div>
                  </Flex>
                  {useWallet && (
                    <Tag color="success" icon={<CheckCircleOutlined />}>
                      Applied
                    </Tag>
                  )}
                </div>

                <Divider className="my-0" />

                <Checkbox
                  checked={useWallet}
                  onChange={(e) => {
                    setUseWallet(e.target.checked)
                    if(e.target.checked){
                      form.setFieldValue("payment_method", "wallet");
                    }
                  }}
                  className="text-base"
                >
                  <span className="font-medium text-sm">Use wallet balance to reduce bill amount</span>
                </Checkbox>

                {useWallet && walletBalance > 0 && (
                  <Alert
                    message={`₹${walletDeduction.toFixed(2)} will be deducted from wallet`}
                    description={`Remaining payment required: ₹${((selectedBill?.total || 0) - walletDeduction).toFixed(2)} (Remaining wallet: ₹${(walletBalance - walletDeduction).toFixed(2)})`}
                    type="success"
                    showIcon
                    icon={<DollarOutlined />}
                    style={{ fontSize: "12px" }}
                  />
                )}

                {walletBalance < (selectedBill?.total || 0) && walletBalance > 0 && (
                  <p className="text-xs text-gray-500 italic">
                    💡 Wallet balance is less than bill total. Remaining amount: ₹{((selectedBill?.total || 0) - walletBalance).toFixed(2)}
                  </p>
                )}
              </Space>
            </Card>
          )}

          <Form.Item
            label="Payment Method"
            name="payment_method"
          >
            <Select
              placeholder="Select payment method (optional)"
              allowClear
              options={paymentMethods}
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
