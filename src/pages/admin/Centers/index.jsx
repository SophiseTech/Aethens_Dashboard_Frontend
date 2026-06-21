import { useState, useEffect, useCallback } from "react";
import { Table, Button, Flex, Modal, Form, Input, InputNumber, Switch, Tag, message, Row, Col, Tooltip } from "antd";
import Title from "@components/layouts/Title";
import userStore from "@stores/UserStore";
import permissions from "@utils/permissions";
import centersService from "@services/Centers";
import { useStore } from "zustand";

function AdminCenters() {
  const { user } = useStore(userStore);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  const canView = permissions.adminCenters?.view?.includes(user?.role);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const filters = search.trim() ? { search: search.trim() } : {};
      const res = await centersService.getCenters(filters, 0, 500);
      setList(res?.centers ?? []);
    } catch (e) {
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    if (canView) load();
  }, [canView, load]);

  const openCreate = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      rescheduleAutoApprovalMaxCount: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
    });
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingRecord(record);
    
    // Normalize rescheduleAutoApprovalMaxCount
    let autoApproval = {};
    if (record.rescheduleAutoApprovalMaxCount && typeof record.rescheduleAutoApprovalMaxCount === 'object') {
      autoApproval = { ...record.rescheduleAutoApprovalMaxCount };
    } else if (typeof record.rescheduleAutoApprovalMaxCount === 'number') {
      const oldVal = record.rescheduleAutoApprovalMaxCount;
      autoApproval = { 0: oldVal, 1: oldVal, 2: oldVal, 3: oldVal, 4: oldVal, 5: oldVal, 6: oldVal };
    } else {
      autoApproval = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    }

    form.setFieldsValue({
      center_name: record.center_name,
      location: record.location,
      center_initial: record.center_initial,
      maxCount: record.maxCount,
      rescheduleAutoApprovalMaxCount: autoApproval,
      autoReject: record.autoReject ?? false,
    });
    setModalOpen(true);
  };

  const validateLimit = ({ getFieldValue }) => ({
    validator(_, value) {
      const max = getFieldValue('maxCount');
      if (value === undefined || value === null || typeof max !== 'number' || value <= max) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('Cannot exceed Max Count'));
    },
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingRecord) {
        await centersService.update(editingRecord._id, values);
        message.success("Center updated");
      } else {
        await centersService.create(values);
        message.success("Center created");
      }
      setModalOpen(false);
      load();
    } catch (e) {
      if (e.errorFields) return;
      message.error(e?.message || "Request failed");
    }
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Delete center?",
      content: `Delete "${record.center_name}"? This may affect existing data.`,
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await centersService.delete(record._id);
          message.success("Center deleted");
          load();
        } catch (e) {
          message.error(e?.message || "Delete failed");
        }
      },
    });
  };

  const handleResetLimit = (record) => {
    Modal.confirm({
      title: "Reset limit?",
      content: `Reset "${record.center_name}" limit?`,
      okText: "Reset",
      okType: "danger",
      onOk: async () => {
        try {
          await centersService.resetLimitForCenter(record._id);
          message.success("Limit reset");
          load();
        } catch (e) {
          message.error(e?.message || "Reset failed");
        }
      },
    });
  };

  if (!canView) {
    return <div className="p-4 text-center">You don&apos;t have permission to view centers.</div>;
  }

  const columns = [
    { title: "Center name", dataIndex: "center_name", key: "center_name" },
    { title: "Location", dataIndex: "location", key: "location" },
    { title: "Initial", dataIndex: "center_initial", key: "center_initial" },
    { title: "Max Count", dataIndex: "maxCount", key: "maxCount", render: (val) => val ?? "—" },
    {
      title: "Auto Approve Limit",
      dataIndex: "rescheduleAutoApprovalMaxCount",
      key: "rescheduleAutoApprovalMaxCount",
      render: (val) => {
        if (!val || typeof val !== "object") {
          return typeof val === "number" ? val : "—";
        }
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const values = Object.values(val);
        const uniqueValues = [...new Set(values)];
        if (uniqueValues.length === 1) {
          return `${uniqueValues[0]} (All days)`;
        }

        const tooltipContent = (
          <div className="p-1">
            {days.map((day, idx) => {
              const count = val[idx] ?? 0;
              return (
                <div key={day} style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
                  <span className="font-semibold">{day}:</span>
                  <span>{count}</span>
                </div>
              );
            })}
          </div>
        );

        const summary = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
          .map(d => {
            const idx = d === "Sun" ? 0 : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(d);
            return `${d.slice(0, 1)}:${val[idx] ?? 0}`;
          })
          .join(" ");

        return (
          <Tooltip title={tooltipContent} placement="topLeft">
            <span className="cursor-pointer border-b border-dashed border-gray-400">
              {summary}
            </span>
          </Tooltip>
        );
      }
    },
    { title: "Auto Reject", dataIndex: "autoReject", key: "autoReject", render: (val) => <Tag color={val ? "red" : "default"}>{val ? "Enabled" : "Disabled"}</Tag> },
    {
      title: "Actions",
      key: "actions",
      render: (_, rec) => (
        <Flex gap={8}>
          <Button size="small" onClick={() => openEdit(rec)}>Edit</Button>
          <Button size="small" danger onClick={() => handleDelete(rec)}>Delete</Button>
          <Button size="small" danger onClick={() => handleResetLimit(rec)}>Reset Limit</Button>
        </Flex>
      ),
    },
  ];

  return (
    <Title
      title="Centers (Admin)"
      button={
        <Flex gap={8}>
          <Button type="primary" onClick={openCreate}>Add Center</Button>
        </Flex>
      }
    >
      <Flex className="mb-4">
        <Input.Search
          placeholder="Search by center name or location"
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={load}
          style={{ width: 320 }}
        />
      </Flex>
      <Table rowKey="_id" columns={columns} dataSource={list} loading={loading} pagination={false} />
      <Modal
        title={editingRecord ? "Edit Center" : "Add Center"}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText={editingRecord ? "Update" : "Create"}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="center_name" label="Center name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="location" label="Location">
            <Input />
          </Form.Item>
          <Form.Item name="center_initial" label="Center initial" rules={[{ max: 5 }]}>
            <Input placeholder="e.g. SOA" maxLength={5} />
          </Form.Item>
          <Form.Item name="maxCount" label="Max Count" rules={[{ type: "number", min: 0, message: "Must be a positive number" }]}>
            <InputNumber min={0} placeholder="e.g. 30" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Auto Approve Limit (per Weekday)" style={{ marginBottom: 8 }}>
            <Row gutter={[8, 8]}>
              {[
                { label: "Monday", key: "1" },
                { label: "Tuesday", key: "2" },
                { label: "Wednesday", key: "3" },
                { label: "Thursday", key: "4" },
                { label: "Friday", key: "5" },
                { label: "Saturday", key: "6" },
                { label: "Sunday", key: "0" }
              ].map(day => (
                <Col span={8} key={day.key}>
                  <Form.Item
                    name={["rescheduleAutoApprovalMaxCount", day.key]}
                    label={day.label}
                    dependencies={['maxCount']}
                    rules={[
                      { required: true, type: "number", min: 0, message: "Required" },
                      validateLimit
                    ]}
                    style={{ marginBottom: 12 }}
                  >
                    <InputNumber min={0} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              ))}
            </Row>
          </Form.Item>
          <Form.Item name="autoReject" label="Enable Auto Reject" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Title>
  );
}

export default AdminCenters;
