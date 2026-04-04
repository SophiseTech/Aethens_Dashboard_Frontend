import React, { useEffect, useState, useMemo } from 'react';
import { Modal, Table, Spin, Alert, Row, Col, Statistic, Tag, Button, InputNumber, Form, DatePicker, Select, Card, Checkbox, Space, Divider, Flex, Popconfirm, message } from 'antd';
import { WalletOutlined, DollarOutlined, CheckCircleOutlined, FileDoneOutlined, CheckSquareOutlined, PrinterOutlined, DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import InvoicePdf from '@pages/Bills/Components/Invoice';
import { isAndroid } from 'react-device-detect';
import { useStore } from 'zustand';
import feeStore from '@stores/FeeStore';
import { formatDate, toISTStartOfDayISO } from '@utils/helper';
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
    recreateInstallments,
    addAdditionalFee,
  } = useStore(feeStore);

  const { user } = useStore(userStore);
  const [paymentModal, setPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [form] = Form.useForm();
  const [useWallet, setUseWallet] = useState(false);
  const [viewBill, setViewBill] = useState(null);
  const [additionalFeeModal, setAdditionalFeeModal] = useState(false);
  const [additionalFeeForm] = Form.useForm();
  const additionalAmount = Form.useWatch('amount', additionalFeeForm);
  const [useWalletForAdditional, setUseWalletForAdditional] = useState(false);
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

  const additionalWalletDeduction = useMemo(() => {
    return useWalletForAdditional && walletBalance > 0 ? Math.min(walletBalance, additionalAmount || 0) : 0;
  }, [useWalletForAdditional, walletBalance, additionalAmount]);

  const additionalExcessPayment = useMemo(() => {
    return Math.max(0, (additionalAmount || 0) - additionalAmount); // This is always 0 unless we allow overpaying additional fees
    // Actually, let's keep it simple: no overpayment for additional fees via UI for now.
    return 0;
  }, [additionalAmount]);

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
          payment_date: values.payment_date ? toISTStartOfDayISO(values.payment_date) : undefined,
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
          payment_date: values.payment_date ? toISTStartOfDayISO(values.payment_date) : undefined,
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

  // Build map of installments to bills, ensuring 1-to-1 mapping
  const installmentBillMap = useMemo(() => {
    const map = new Map();
    if (!feeDetails?.bills || !feeDetails?.feeAccount?.installments) return map;

    // Use a cloned array so we can remove matched bills and prevent duplicate mappings
    const availableBills = [...feeDetails.bills];

    feeDetails.feeAccount.installments.forEach((installment) => {
      const instDate = new Date(installment.month);

      // Find all bills matching the same year and month
      const eligibleIndices = availableBills
        .map((bill, index) => {
          const billDate = new Date(bill.generated_on);
          if (
            billDate.getFullYear() === instDate.getFullYear() &&
            billDate.getMonth() === instDate.getMonth()
          ) {
            return index;
          }
          return -1;
        })
        .filter((i) => i !== -1);

      if (eligibleIndices.length > 0) {
        // First try to match by exact amount (to differentiate Registration vs Course Fee)
        let exactMatchIdx = eligibleIndices.find(
          (idx) => Math.abs(availableBills[idx].total - installment.amount) < 0.1
        );

        // If no exact amount match, try exact day match
        if (exactMatchIdx === undefined) {
          exactMatchIdx = eligibleIndices.find((idx) => {
            const billDate = new Date(availableBills[idx].generated_on);
            return billDate.getDate() === instDate.getDate();
          });
        }

        // If still no match, just take the first eligible bill
        if (exactMatchIdx === undefined) {
          exactMatchIdx = eligibleIndices[0];
        }

        map.set(installment._id, availableBills[exactMatchIdx]);

        // Remove the matched bill so it isn't assigned to another installment
        availableBills.splice(exactMatchIdx, 1);
      }
    });

    return map;
  }, [feeDetails]);

  // Find the bill corresponding to an installment.
  const getBillForInstallment = (installment) => {
    return installmentBillMap.get(installment._id) || null;
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
  const handleRecreateInstallments = async () => {
    try {
      await recreateInstallments(student._id);
      message.success('Installments recreated successfully');
      refreshFeeDetails();
    } catch (err) {
      message.error(err?.message || 'Failed to recreate installments');
    }
  };
  const handleAdditionalFeeSubmit = async () => {
    try {
      const values = await additionalFeeForm.validateFields();
      const payload = {
        amount: values.amount,
        description: values.description,
        payment_method: values.payment_method,
        payment_date: values.payment_date ? toISTStartOfDayISO(values.payment_date) : undefined,
        useWallet: useWalletForAdditional,
        walletDeduction: additionalWalletDeduction,
        excessPayment: 0, // No overpayment for additional fees for now
        walletId: student?.wallet?._id || null,
      };
      await addAdditionalFee(feeDetails.feeAccount._id, payload);
      message.success('Additional fee added and bill generated successfully');
      setAdditionalFeeModal(false);
      additionalFeeForm.resetFields();
      setUseWalletForAdditional(false);
      refreshFeeDetails();
    } catch (error) {
      console.error('Error adding additional fee:', error);
      message.error(error?.message || 'Failed to add additional fee');
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

        const bill = getBillForInstallment(record);

        if (record.status === 'paid') {
          return (
            <Space>
              <Tag color="green" icon={<CheckCircleOutlined />}>Paid</Tag>
              {bill && (
                <Button
                  type="primary"
                  size="small"
                  ghost
                  icon={<PrinterOutlined />}
                  onClick={() => setViewBill(bill)}
                >
                  View / Print
                </Button>
              )}
            </Space>
          );
        }

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
          const historicalBill = getBillForInstallment(record);
          return (
            <Space>
              <Tag color="green" icon={<CheckCircleOutlined />}>Paid</Tag>
              {historicalBill && (
                <Button
                  type="primary"
                  size="small"
                  ghost
                  icon={<PrinterOutlined />}
                  onClick={() => setViewBill(historicalBill)}
                >
                  View / Print
                </Button>
              )}
            </Space>
          );
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

        if (record.status === 'paid') {
          return (
            <Button
              type="primary"
              size="small"
              ghost
              icon={<PrinterOutlined />}
              onClick={() => setViewBill(record)}
            >
              View / Print
            </Button>
          );
        }

        return (
          <Button
            type="primary"
            size="small"
            onClick={() => handleMarkAsPaid(record)}
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
              <Col span={6}>
                <div style={{ background: '#fff7d6', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                  <Statistic title="Total Fees" value={feeDetails.summary.totalFees?.toFixed(2)} />
                </div>
              </Col>
              <Col span={6}>
                <div style={{ background: '#e6ffed', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                  <Statistic title="Amount Paid" value={feeDetails.summary.amountPaid?.toFixed(2)} />
                </div>
              </Col>
              <Col span={6}>
                <div style={{ background: '#fff1f0', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                  <Statistic title="Balance" value={feeDetails.summary.balance?.toFixed(2)} />
                </div>
              </Col>
              <Col span={6}>
                 <Flex vertical align="center" justify="center" style={{ height: '100%', gap: '8px' }}>
                    {isInstallment && permissions.fee_tracker.edit.includes(user?.role) && (
                      <Popconfirm
                        title="Recreate Installments?"
                        description="This will delete future unpaid installments and re-create them starting from today. Proceed?"
                        onConfirm={handleRecreateInstallments}
                        okText="Yes, Recreate"
                        cancelText="No"
                        okButtonProps={{ danger: true }}
                      >
                        <Button 
                          type="primary" 
                          danger 
                          ghost 
                          icon={<ReloadOutlined />} 
                          loading={loading}
                          size="small"
                        >
                          Recreate Installments
                        </Button>
                      </Popconfirm>
                    )}
                    {permissions.fee_tracker.edit.includes(user?.role) && (
                      <Button
                        type="primary"
                        icon={<DollarOutlined />}
                        onClick={() => setAdditionalFeeModal(true)}
                        size="small"
                      >
                        Add Additional Fee
                      </Button>
                    )}
                 </Flex>
              </Col>
            </Row>

            <div className='bg-[#fff1f0] flex gap-2 p-3 justify-evenly mb-[20px] rounded-lg text-sm'>
              <div className='flex flex-col gap-1 items-center'>
                <p className='text-stone-500'>Course Fee</p>
                <p className='font-bold text-base'>{feeDetails.summary?.total_course_fee?.toFixed(2)}</p>
              </div>
              <div className='flex flex-col gap-1 items-center'>
                <p className='text-stone-500'>Registration Fee</p>
                <p className='font-bold text-base'>{feeDetails.summary?.courseRegFee?.toFixed(2)}</p>
              </div>
              <div className='flex flex-col gap-1 items-center'>
                <p className='text-stone-500'>Additional Fees</p>
                <p className='font-bold text-base'>{(feeDetails.feeAccount?.totalAdditionalAmount || 0).toFixed(2)}</p>
              </div>
              <div className='flex flex-col gap-1 items-center'>
                <p className='text-stone-500'>Total Tax</p>
                <p className='font-bold text-base'>{feeDetails.summary?.totalTax?.toFixed(2)}</p>
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

            {(feeDetails.feeAccount?.additionalFees?.length > 0) && (
              <div style={{ marginTop: 24 }}>
                <Divider orientation="left">Additional Fees</Divider>
                <Table
                  columns={[
                    { title: 'Date', dataIndex: 'payment_date', key: 'date', render: (date) => formatDate(date) },
                    { title: 'Description', dataIndex: 'description', key: 'desc' },
                    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (amt) => `₹${amt?.toFixed(2)}` },
                    { title: 'Method', dataIndex: 'payment_method', key: 'method' },
                    { title: 'Invoice', dataIndex: 'invoiceNo', key: 'inv' },
                    { 
                      title: 'Action', 
                      key: 'action', 
                      render: (_, record) => (
                        <Button 
                          type="link" 
                          icon={<PrinterOutlined />} 
                          onClick={() => {
                            const bill = feeDetails.bills?.find(b => b._id === record.bill_id);
                            if (bill) setViewBill(bill);
                            else message.error("Bill not found");
                          }}
                        >
                          Print
                        </Button>
                      ) 
                    }
                  ]}
                  dataSource={feeDetails.feeAccount.additionalFees}
                  rowKey="_id"
                  size="small"
                  pagination={false}
                />
              </div>
            )}
          </div>
        ) : (
          <Alert message="No fee details found for this student." type="info" />
        )}
      </Modal>

      {/* View Bill Modal */}
      <Modal
        title={`Invoice ${viewBill?.center_initial || ''}${viewBill?.invoiceNo || ''}`}
        visible={!!viewBill}
        onCancel={() => setViewBill(null)}
        footer={null}
        width={1000}
        style={{ top: 20 }}
        destroyOnClose
      >
        {viewBill && (
          <div style={{ height: isAndroid ? 'auto' : '80vh' }}>
            {isAndroid ? (
              <div className="flex flex-col items-center justify-center py-10 gap-4">
                <Alert
                  message="Preview Not Available"
                  description="PDF preview is not supported on Android browsers. Please download the invoice to view it."
                  type="info"
                  showIcon
                />
                <PDFDownloadLink
                  document={<InvoicePdf bill={viewBill} />}
                  fileName={`INV-${viewBill?.center_initial || ''}${viewBill?.invoiceNo || 'Untitled'}.pdf`}
                >
                  {({ loading: pdfLoading }) => (
                    <Button type="primary" size="large" loading={pdfLoading} icon={<DownloadOutlined />}>
                      {pdfLoading ? 'Preparing PDF...' : 'Download Invoice'}
                    </Button>
                  )}
                </PDFDownloadLink>
              </div>
            ) : (
              <PDFViewer width="100%" height="100%">
                <InvoicePdf bill={viewBill} />
              </PDFViewer>
            )}
          </div>
        )}
      </Modal >

      {/* Payment Modal */}
      < Modal
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
      </Modal >

      {/* Additional Fee Modal */}
      <Modal
        title="Add Additional Fee"
        visible={additionalFeeModal}
        onCancel={() => {
          setAdditionalFeeModal(false);
          additionalFeeForm.resetFields();
          setUseWalletForAdditional(false);
        }}
        onOk={handleAdditionalFeeSubmit}
        okText="Add Fee & Generate Bill"
        confirmLoading={loading}
        width={600}
      >
        <Form
          form={additionalFeeForm}
          layout="vertical"
        >
          <CustomInput 
            name="amount" 
            label="Amount (₹)" 
            type="number"
            rules={[{ required: true, message: 'Please enter amount' }]}
          />
          <CustomInput 
            name="description" 
            label="Description / Reason" 
            rules={[{ required: true, message: 'Please enter description' }]}
          />

          {walletBalance > 0 && additionalAmount > 0 && (
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 mb-4" size="small">
               <Checkbox
                  checked={useWalletForAdditional}
                  onChange={(e) => {
                    setUseWalletForAdditional(e.target.checked);
                    if (e.target.checked) additionalFeeForm.setFieldValue("payment_method", "wallet");
                  }}
                >
                  Apply Wallet Balance (Available: ₹{walletBalance.toFixed(2)})
                </Checkbox>
                {useWalletForAdditional && (
                  <Alert
                    message={`₹${additionalWalletDeduction.toFixed(2)} will be deducted from wallet`}
                    type="success"
                    showIcon
                    style={{ marginTop: 8, fontSize: '12px' }}
                  />
                )}
            </Card>
          )}

          <Form.Item label="Payment Method" name="payment_method">
            <Select placeholder="Select payment method" options={paymentMethods} />
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
