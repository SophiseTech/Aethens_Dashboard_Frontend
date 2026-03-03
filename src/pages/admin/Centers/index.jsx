import { useState, useEffect, useCallback } from "react";
import { Table, Button, Flex, Modal, Form, Input, message } from "antd";
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
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      center_name: record.center_name,
      location: record.location,
      center_initial: record.center_initial,
    });
    setModalOpen(true);
  };

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

  if (!canView) {
    return <div className="p-4 text-center">You don&apos;t have permission to view centers.</div>;
  }

  const columns = [
    { title: "Center name", dataIndex: "center_name", key: "center_name" },
    { title: "Location", dataIndex: "location", key: "location" },
    { title: "Initial", dataIndex: "center_initial", key: "center_initial" },
    {
      title: "Actions",
      key: "actions",
      render: (_, rec) => (
        <Flex gap={8}>
          <Button size="small" onClick={() => openEdit(rec)}>Edit</Button>
          <Button size="small" danger onClick={() => handleDelete(rec)}>Delete</Button>
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
        </Form>
      </Modal>
    </Title>
  );
}

export default AdminCenters;
