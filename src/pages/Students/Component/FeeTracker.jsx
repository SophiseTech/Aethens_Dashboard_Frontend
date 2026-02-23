import React, { useEffect, useState, useMemo } from 'react';
import { Modal, Table, Spin, Alert, Row, Col, Statistic, Tag, Button, InputNumber, Form, DatePicker, Select, Card, Checkbox, Space, Divider, Flex, Popconfirm, message } from 'antd';
import { WalletOutlined, DollarOutlined, CheckCircleOutlined, FileDoneOutlined, CheckSquareOutlined } from '@ant-design/icons';
import { useStore } from 'zustand';
import feeStore from '@stores/FeeStore';
import { formatDate } from '@utils/helper';
import CustomInput from '@components/form/CustomInput';
import { paymentMethods } from '@utils/constants';
import permissions from '@utils/permissions';
import userStore from '@stores/UserStore';

const FeeTracker = ({ student, visible, onCancel }) => {
  const {
    feeDetails,
    loading,
    error,
    getFeeDetailsByStudent,
    markAsPaid,
    markPartialPayment,
    generateInstallmentBill,
    generatePartialBalanceBill,
    markInstallmentAsPaid,
  } = useStore(feeStore);

  const { user } = useStore(userStore);
  const [paymentModal, setPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [form] = Form.useForm();
  const [useWallet, setUseWallet] = useState(false);
  const paidAmount = Form.useWatch('paidAmount', form);
  const isPartialPayment = feeDetails?.feeAccount?.type === 'partial';
  const isInstallment = feeDetails?.feeAccount?.isInstallment;

  // Build items array for partial payments
  const partialItems = useMemo(() => {
    if (!feeDetails || !isPartialPayment) return [];
    const items = [...(feeDetails.feeAccount?.installments || [])];
    // Use summary.balance (derived from paid bills) rather than the raw DB field
    // which can be stale when the initial paidAmount was set on account creation.
    const remainingBalance = feeDetails.summary?.balance ?? 0;
    if (remainingBalance > 0) {
      items.push({
        _id: 'balance',
        isBalance: true,
        amount: remainingBalance,
        status: 'pending'
      });
    }
    return items;
  }, [feeDetails, isPartialPayment]);

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

  const refreshFeeDetails = () => {
    if (student?._id) getFeeDetailsByStudent(student._id);
  };

  const handleMarkAsPaid = async (bill) => {
    setSelectedBill(bill);
    setUseWallet(false);
    form.resetFields();
    setPaymentModal(true);
    form.setFieldValue('paidAmount', bill.total);
  };

  const handlePaymentSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (isPartialPayment) {
        const payload = {
          paidAmount: values.paidAmount,
          bill_id: selectedBill._id,
          payment_method: values.payment_method,
          payment_date: values.payment_date?.toISOString(),
          useWallet,
          walletDeduction,
          excessPayment,
          newWalletBalance: walletBalance + excessPayment - walletDeduction,
          walletId: student?.wallet?._id || null,
        };
        await markPartialPayment(feeDetails.feeAccount._id, payload);
      } else {
        const payload = {
          payment_method: values.payment_method,
          payment_date: values.payment_date?.toISOString(),
          useWallet,
          walletDeduction,
          excessPayment,
          newWalletBalance: walletBalance + excessPayment - walletDeduction,
          walletId: student?.wallet?._id || null,
        };
        await markAsPaid(selectedBill._id, payload);
      }
      setPaymentModal(false);
      refreshFeeDetails();
      form.resetFields();
      setSelectedBill(null);
      setUseWallet(false);
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  // Find the bill corresponding to an installment.
  // For partial payment history: installment.month is set to the exact generated_on of the bill,
  // so we match at day-level (year+month+day) to distinguish same-month payments.
  // For monthly installments: month-level match is fine since months are unique.
  const getBillForInstallment = (installment) => {
    if (!feeDetails?.bills) return null;
    const instDate = new Date(installment.month);
    // Try exact day-level match first (handles multiple partial payments in same month)
    const dayMatch = feeDetails.bills.find((bill) => {
      const billDate = new Date(bill.generated_on);
      return (
        billDate.getFullYear() === instDate.getFullYear() &&
        billDate.getMonth() === instDate.getMonth() &&
        billDate.getDate() === instDate.getDate()
      );
    });
    if (dayMatch) return dayMatch;
    // Fallback: month-level match for monthly installments (unique months guaranteed)
    return feeDetails.bills.find((bill) => {
      const billDate = new Date(bill.generated_on);
      return (
        billDate.getFullYear() === instDate.getFullYear() &&
        billDate.getMonth() === instDate.getMonth()
      );
    }) || null;
  };

  const handleGenerateInstallmentBill = async (installment) => {
    try {
      await generateInstallmentBill(feeDetails.feeAccount._id, installment._id);
      message.success('Bill generated successfully');
      refreshFeeDetails();
    } catch (err) {
      message.error(err?.message || 'Failed to generate bill');
    }
  };

  const handleMarkInstallmentAsPaid = async (installment) => {
    try {
      await markInstallmentAsPaid(feeDetails.feeAccount._id, installment._id, {});
      message.success('Installment marked as paid');
      refreshFeeDetails();
    } catch (err) {
      message.error(err?.message || 'Failed to mark installment as paid');
    }
  };

  const handleGeneratePartialBill = async () => {
    try {
      await generatePartialBalanceBill(feeDetails.feeAccount._id);
      message.success('Balance bill generated successfully');
      refreshFeeDetails();
    } catch (err) {
      message.error(err?.message || 'Failed to generate bill');
    }
  };

  // Columns for INSTALLMENT fee accounts — shows installments, not bills
  const installmentColumns = [
    {
      title: 'No.',
      key: 'index',
      render: (_, __, index) => index + 1,
      width: 50,
    },
    {
      title: 'Due Month',
      dataIndex: 'month',
      key: 'month',
      render: (date) => formatDate(date, 'MMM YYYY'),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amt) => `₹${amt?.toFixed(2)}`,
    },
    {
      title: 'Invoice No.',
      key: 'invoiceNo',
      render: (_, record) => {
        const bill = getBillForInstallment(record);
        return bill ? `${bill.center_initial || ''}${bill.invoiceNo}` : '—';
      },
    },
    {
      title: 'Bill Status',
      key: 'billStatus',
      render: (_, record) => {
        const bill = getBillForInstallment(record);
        if (!bill) return <Tag color="default">No Bill</Tag>;
        return (
          <Tag color={bill.status === 'paid' ? 'green' : 'orange'}>
            {bill.status === 'paid' ? 'Paid' : 'Unpaid'}
          </Tag>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'paid' ? 'green' : status === 'billed' ? 'orange' : 'blue'}>
          {status === 'paid' ? 'Paid' : status === 'billed' ? 'Billed' : 'Pending'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => {

        if (!permissions.fee_tracker.edit.includes(user?.role)) return;

        if (record.status === 'paid') {
          return <Tag color="green" icon={<CheckCircleOutlined />}>Paid</Tag>;
        }

        const bill = getBillForInstallment(record);

        return (
          <Space>
            {/* If a bill exists and is unpaid, allow marking the bill as paid */}
            {bill && bill.status !== 'paid' && (
              <Button
                type="primary"
                size="small"
                icon={<CheckSquareOutlined />}
                onClick={() => handleMarkAsPaid(bill)}
              >
                Mark Bill Paid
              </Button>
            )}

            {/* If no bill exists yet, show Generate Bill */}
            {!bill && (
              <Button
                type="default"
                size="small"
                icon={<FileDoneOutlined />}
                onClick={() => handleGenerateInstallmentBill(record)}
                loading={loading}
              >
                Generate Bill
              </Button>
            )}

            {/* Mark installment as paid directly (no bill) — only shown when no bill has been generated yet */}
            {record.status === 'pending' && (
              <Popconfirm
                title="Mark as Paid (No Bill)"
                description={
                  <div style={{ maxWidth: 280 }}>
                    <p>⚠️ <strong>Warning:</strong> This will mark the installment as paid <strong>without generating a bill</strong>.</p>
                    <p>No invoice will be created for this action. Proceed?</p>
                  </div>
                }
                onConfirm={() => handleMarkInstallmentAsPaid(record)}
                okText="Yes, Mark Paid"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Button
                  size="small"
                  danger
                  icon={<CheckCircleOutlined />}
                >
                  Mark Paid
                </Button>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  // Columns for PARTIAL fee accounts - history of payments and a single balance
  const partialColumns = [
    {
      title: 'No.',
      key: 'index',
      render: (_, __, index) => index + 1,
      width: 50,
    },
    {
      title: 'Date/Month',
      dataIndex: 'month',
      key: 'month',
      render: (date, record) => record.isBalance ? 'Remaining Balance' : formatDate(date, 'MMM DD YYYY'),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amt) => `₹${amt?.toFixed(2)}`,
    },
    {
      title: 'Invoice No.',
      key: 'invoiceNo',
      render: (_, record) => {
        if (record.isBalance) {
          // Unpaid bill check for balance
          const unpaidBill = feeDetails?.bills?.find(b => b.status === "unpaid" && b.subject === 'course');
          return unpaidBill ? `${unpaidBill.center_initial || ''}${unpaidBill.invoiceNo}` : '—';
        }
        // Historical check
        const bill = getBillForInstallment(record);
        return bill ? `${bill.center_initial || ''}${bill.invoiceNo}` : '—';
      },
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        if (record.isBalance) {
          return <Tag color="blue">Pending</Tag>;
        }
        return <Tag color="green">Paid</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => {
        if (!record.isBalance) {
          return <Tag color="green" icon={<CheckCircleOutlined />}>Paid</Tag>;
        }

        if (!permissions.fee_tracker.edit.includes(user?.role)) return null;

        const unpaidBill = feeDetails?.bills?.find(b => b.status === "unpaid" && b.subject === 'course');

        return (
          <Space>
            {unpaidBill ? (
              <Button
                type="primary"
                size="small"
                icon={<CheckSquareOutlined />}
                onClick={() => handleMarkAsPaid(unpaidBill)}
              >
                Mark Bill Paid
              </Button>
            ) : (
              <Button
                type="default"
                size="small"
                icon={<FileDoneOutlined />}
                onClick={handleGeneratePartialBill}
                loading={loading}
              >
                Generate Bill
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  // Columns for SINGLE / PARTIAL fee accounts — shows bills
  const billColumns = [
    {
      title: 'No.',
      key: 'index',
      render: (_, __, index) => index + 1,
      width: 50,
    },
    {
      title: 'Invoice No.',
      key: 'invoiceNo',
      render: (_, record) => `${record.center_initial || ''}${record.invoiceNo}`,
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
      render: (amt) => `₹${amt?.toFixed(2)}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'paid' ? 'green' : 'orange'}>
          {status === 'paid' ? 'Paid' : 'Unpaid'}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => {
        if (!permissions.fee_tracker.edit.includes(user?.role)) return null;
        if (record.subject !== 'course') return null;
        return (
          <Button
            type="primary"
            size="small"
            onClick={() => handleMarkAsPaid(record)}
            disabled={record.status === 'paid'}
          >
            Mark as Paid
          </Button>
        );
      },
    },
  ];

  return (
    <>
      <Modal
        title="Fee Tracker"
        visible={visible}
        onCancel={onCancel}
        footer={null}
        width={950}
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

            {/* Show installment-based table for monthly fee types */}
            {isInstallment ? (
              <>
                <Alert
                  message="Installment Fee Account"
                  description="Bills are generated per installment. Use 'Generate Bill' to create an invoice, or 'Mark Paid' to directly mark an installment as paid without generating an invoice."
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                <Table
                  columns={installmentColumns}
                  dataSource={feeDetails.feeAccount?.installments || []}
                  rowKey="_id"
                  size="small"
                />
              </>
            ) : isPartialPayment ? (
              <>
                <Alert
                  message="Partial Fee Account"
                  description="Generate a bill to pay your remaining balance. The history of paid partial payments will be displayed."
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                <Table
                  columns={partialColumns}
                  dataSource={partialItems}
                  rowKey="_id"
                  size="small"
                />
              </>
            ) : (
              <Table columns={billColumns} dataSource={feeDetails.bills} rowKey="_id" />
            )}
          </div>
        ) : (
          <Alert message="No fee details found for this student." type="info" />
        )}
      </Modal>

      {/* Payment Modal */}
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
          initialValues={{ paidAmount: selectedBill?.total }}
        >
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

          {(paidAmount > 0) && (
            <div className="space-y-3 mb-4">
              <Alert
                message={
                  paidAmount < (selectedBill?.total || 0) && feeDetails?.feeAccount?.type !== 'partial' ? "Insufficient Payment" :
                    paidAmount === (selectedBill?.total || 0) ? "Exact Payment" :
                      `Excess Payment: ₹${excessPayment.toFixed(2)}`
                }
                description={
                  paidAmount < (selectedBill?.total || 0) && feeDetails?.feeAccount?.type !== 'partial'
                    ? `Amount due: ₹${((selectedBill?.total || 0) - paidAmount).toFixed(2)}`
                    : paidAmount > (selectedBill?.total || 0)
                      ? `This amount will be credited to the wallet`
                      : ""
                }
                type={paidAmount < (selectedBill?.total || 0) && feeDetails?.feeAccount?.type !== 'partial' ? "error" : paidAmount > (selectedBill?.total || 0) ? "warning" : "success"}
                showIcon
                icon={paidAmount > (selectedBill?.total || 0) && feeDetails?.feeAccount?.type !== 'partial' ? <WalletOutlined /> : undefined}
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
                    if (e.target.checked) {
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

          <Form.Item label="Payment Method" name="payment_method">
            <Select placeholder="Select payment method (optional)" allowClear options={paymentMethods} />
          </Form.Item>

          <Form.Item label="Payment Date" name="payment_date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default FeeTracker;
