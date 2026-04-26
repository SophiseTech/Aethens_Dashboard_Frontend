import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Modal, Table, Button, Form, InputNumber, DatePicker, Select,
  Space, Tag, Popconfirm, message, Typography, Statistic, Row, Col, Divider,
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useStore } from 'zustand';
import feeStore from '@stores/FeeStore';
import { formatDate } from '@utils/helper';
import permissions from '@utils/permissions';
import userStore from '@stores/UserStore';

const { Text } = Typography;

const STATUS_COLOR = { paid: 'green', billed: 'orange', pending: 'blue' };
const STATUS_LABEL = { paid: 'Paid', billed: 'Billed', pending: 'Pending' };
const TYPE_OPTIONS = [
  { value: 'course', label: 'Course' },
  { value: 'registration', label: 'Registration' },
];

function InstallmentManager({ feeAccountId, visible, onCancel, onSaved }) {
  const { feeDetails, loading, getFeeDetailsByStudent, updateInstallment, addInstallment, deleteInstallment } = useStore(feeStore);
  const { user } = useStore(userStore);

  const [editingId, setEditingId] = useState(null);
  const [editForm] = Form.useForm();
  const [addForm] = Form.useForm();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [adding, setAdding] = useState(false);

  const canEdit = permissions.fee_tracker.edit.includes(user?.role);
  const feeAccount = feeDetails?.feeAccount;
  const installments = feeAccount?.installments || [];

  const refresh = useCallback(() => {
    if (feeAccount?.user_id) getFeeDetailsByStudent(feeAccount.user_id);
  }, [feeAccount?.user_id, getFeeDetailsByStudent]);

  useEffect(() => {
    if (visible) setEditingId(null);
  }, [visible]);

  const summary = useMemo(() => {
    const total = installments.reduce((s, i) => s + (i.amount || 0), 0);
    const paid = installments.filter(i => i.status === 'paid').reduce((s, i) => s + (i.amount || 0), 0);
    const pending = installments.filter(i => i.status !== 'paid').reduce((s, i) => s + (i.amount || 0), 0);
    return { total, paid, pending };
  }, [installments]);

  const startEdit = (record) => {
    setEditingId(record._id);
    editForm.setFieldsValue({
      amount: record.amount,
      month: record.month ? dayjs(record.month) : null,
      type: record.type || 'course',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    editForm.resetFields();
  };

  const saveEdit = async (record) => {
    try {
      const values = await editForm.validateFields();
      setSavingId(record._id);
      await updateInstallment(feeAccountId, record._id, {
        amount: values.amount,
        month: values.month ? values.month.toISOString() : undefined,
        type: values.type,
      });
      message.success('Installment updated');
      setEditingId(null);
      editForm.resetFields();
      refresh();
      onSaved?.();
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.message || 'Failed to update installment');
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (record) => {
    try {
      setDeletingId(record._id);
      await deleteInstallment(feeAccountId, record._id);
      message.success('Installment deleted');
      refresh();
      onSaved?.();
    } catch (err) {
      message.error(err?.message || 'Failed to delete installment');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAdd = async () => {
    try {
      const values = await addForm.validateFields();
      setAdding(true);
      await addInstallment(feeAccountId, {
        amount: values.amount,
        month: values.month ? values.month.toISOString() : undefined,
        type: values.type || 'course',
      });
      message.success('Installment added');
      setAddModalOpen(false);
      addForm.resetFields();
      refresh();
      onSaved?.();
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.message || 'Failed to add installment');
    } finally {
      setAdding(false);
    }
  };

  const columns = [
    {
      title: '#',
      key: 'index',
      width: 48,
      render: (_, __, idx) => idx + 1,
    },
    {
      title: 'Month',
      dataIndex: 'month',
      key: 'month',
      render: (date, record) => {
        if (editingId === record._id) {
          return (
            <Form.Item name="month" style={{ margin: 0 }} rules={[{ required: true, message: 'Required' }]}>
              <DatePicker picker="month" style={{ width: 140 }} />
            </Form.Item>
          );
        }
        return <Text>{formatDate(date, 'MMM YYYY')}</Text>;
      },
    },
    {
      title: 'Amount (₹)',
      dataIndex: 'amount',
      key: 'amount',
      render: (amt, record) => {
        if (editingId === record._id) {
          return (
            <Form.Item name="amount" style={{ margin: 0 }} rules={[{ required: true, message: 'Required' }, { type: 'number', min: 1, message: 'Must be > 0' }]}>
              <InputNumber min={1} style={{ width: 120 }} />
            </Form.Item>
          );
        }
        return <Text>₹{amt?.toFixed(2)}</Text>;
      },
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type, record) => {
        if (editingId === record._id) {
          return (
            <Form.Item name="type" style={{ margin: 0 }}>
              <Select options={TYPE_OPTIONS} style={{ width: 130 }} />
            </Form.Item>
          );
        }
        return <Tag>{type === 'registration' ? 'Registration' : 'Course'}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={STATUS_COLOR[status] || 'default'}>
          {STATUS_LABEL[status] || status}
        </Tag>
      ),
    },
    canEdit && {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_, record) => {
        if (record.status === 'paid') {
          return <Tag color="green">Paid — locked</Tag>;
        }

        if (editingId === record._id) {
          return (
            <Space>
              <Button
                size="small"
                type="primary"
                icon={<SaveOutlined />}
                loading={savingId === record._id}
                onClick={() => saveEdit(record)}
              >
                Save
              </Button>
              <Button size="small" icon={<CloseOutlined />} onClick={cancelEdit}>
                Cancel
              </Button>
            </Space>
          );
        }

        return (
          <Space>
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => startEdit(record)}
              disabled={!!editingId}
            >
              Edit
            </Button>
            <Popconfirm
              title="Delete this installment?"
              description="This will reduce the total fee amount."
              onConfirm={() => handleDelete(record)}
              okText="Delete"
              okButtonProps={{ danger: true }}
              cancelText="Cancel"
            >
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                loading={deletingId === record._id}
                disabled={!!editingId}
              >
                Delete
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ].filter(Boolean);

  return (
    <>
      <Modal
        title="Manage Installments"
        open={visible}
        onCancel={onCancel}
        footer={
          canEdit ? (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setAddModalOpen(true)}
              disabled={!!editingId}
            >
              Add Installment
            </Button>
          ) : null
        }
        width={800}
        destroyOnClose
      >
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <div style={{ background: '#f0f5ff', padding: 12, borderRadius: 8, textAlign: 'center' }}>
              <Statistic title="Total Installments" value={installments.length} />
            </div>
          </Col>
          <Col span={8}>
            <div style={{ background: '#e6ffed', padding: 12, borderRadius: 8, textAlign: 'center' }}>
              <Statistic title="Paid" prefix="₹" value={summary.paid.toFixed(2)} />
            </div>
          </Col>
          <Col span={8}>
            <div style={{ background: '#fff1f0', padding: 12, borderRadius: 8, textAlign: 'center' }}>
              <Statistic title="Pending" prefix="₹" value={summary.pending.toFixed(2)} />
            </div>
          </Col>
        </Row>

        <Divider style={{ margin: '12px 0' }} />

        <Form form={editForm} component={false}>
          <Table
            columns={columns}
            dataSource={[...installments].sort((a, b) => new Date(a.month) - new Date(b.month))}
            rowKey="_id"
            size="small"
            loading={loading}
            pagination={false}
            scroll={{ y: 400 }}
          />
        </Form>
      </Modal>

      <Modal
        title="Add New Installment"
        open={addModalOpen}
        onCancel={() => { setAddModalOpen(false); addForm.resetFields(); }}
        onOk={handleAdd}
        okText="Add"
        confirmLoading={adding}
        destroyOnClose
      >
        <Form form={addForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="month"
            label="Month"
            rules={[{ required: true, message: 'Please select a month' }]}
          >
            <DatePicker picker="month" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="amount"
            label="Amount (₹)"
            rules={[
              { required: true, message: 'Please enter an amount' },
              { type: 'number', min: 1, message: 'Must be greater than 0' },
            ]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="type" label="Type" initialValue="course">
            <Select options={TYPE_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default InstallmentManager;
