import { Button, Flex, Form, Input, InputNumber, Modal, Popconfirm, Table, Typography } from "antd";
import { useStore } from "zustand";
import Title from "@components/layouts/Title";
import userStore from "@stores/UserStore";
import permissions from "@utils/permissions";
import usePaymentLinks from "@hooks/usePaymentLinks";

const formatAmount = (amount) => `₹${Number(amount).toLocaleString("en-IN")}`;

// Amount → payment link list (shared by all centers). The fee reminder dialog fills
// in the link for the reminder's amount from here.
function AdminPaymentLinks() {
  const { user } = useStore(userStore);
  const canView = permissions.adminPaymentLinks?.view?.includes(user?.role);
  const { links, loading, saving, form, modalOpen, isEdit, openAdd, openEdit, close, submit, remove } = usePaymentLinks();

  if (!canView) {
    return <div className="p-4 text-center">You don&apos;t have permission to view payment links.</div>;
  }

  const columns = [
    { title: "Amount", dataIndex: "amount", key: "amount", width: 160, render: formatAmount },
    {
      title: "Payment Link",
      dataIndex: "link",
      key: "link",
      render: (link) => (
        <Typography.Link href={link} target="_blank" rel="noopener noreferrer" copyable={{ text: link }} ellipsis>
          {link}
        </Typography.Link>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 160,
      render: (_, record) => (
        <Flex gap={8}>
          <Button size="small" onClick={() => openEdit(record)}>Edit</Button>
          <Popconfirm
            title="Delete payment link?"
            description={`Reminders for ${formatAmount(record.amount)} will no longer get a link automatically.`}
            okText="Delete"
            okType="danger"
            onConfirm={() => remove(record)}
          >
            <Button size="small" danger>Delete</Button>
          </Popconfirm>
        </Flex>
      ),
    },
  ];

  return (
    <Title title="Payment Links" button={<Button type="primary" onClick={openAdd}>Add Payment Link</Button>}>
      <Typography.Paragraph type="secondary">
        One link per fee amount, used by all centers. When a fee reminder is sent, the link for its amount is filled in automatically.
      </Typography.Paragraph>
      <Table rowKey="_id" columns={columns} dataSource={links} loading={loading} pagination={false} scroll={{ x: 600 }} />

      <Modal
        title={isEdit ? "Edit Payment Link" : "Add Payment Link"}
        open={modalOpen}
        onCancel={close}
        onOk={() => form.submit()}
        okText={isEdit ? "Update" : "Add"}
        confirmLoading={saving}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={submit} preserve={false}>
          <Form.Item
            name="amount"
            label="Amount (₹)"
            rules={[{ required: true, message: "Enter the fee amount" }, { type: "number", min: 1, message: "Must be a positive amount" }]}
          >
            <InputNumber min={1} precision={0} placeholder="e.g. 8260" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="link"
            label="Payment Link"
            rules={[{ required: true, message: "Enter the payment link" }, { type: "url", message: "Enter a valid link (https://…)" }]}
          >
            <Input placeholder="https://…" />
          </Form.Item>
        </Form>
      </Modal>
    </Title>
  );
}

export default AdminPaymentLinks;
