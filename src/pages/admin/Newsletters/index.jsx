import { useState, useEffect } from "react";
import { Table, Button, Flex, Modal, Form, Input, message } from "antd";
import Title from "@components/layouts/Title";
import userStore from "@stores/UserStore";
import permissions from "@utils/permissions";
import newsletterService from "@services/Newsletter";
import { useStore } from "zustand";

function AdminNewsletters() {
  const { user } = useStore(userStore);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  const canView = permissions.adminNewsletter?.view?.includes(user?.role);
  const canAdd = permissions.adminNewsletter?.add?.includes(user?.role);
  const canEdit = permissions.adminNewsletter?.edit?.includes(user?.role);
  const canDelete = permissions.adminNewsletter?.delete?.includes(user?.role);

  useEffect(() => {
    if (canView) fetchList();
  }, [canView, search, eventTypeFilter]);

  const fetchList = async () => {
    try {
      setLoading(true);
      const params = { limit: 100 };
      if (search?.trim()) params.search = search.trim();
      if (eventTypeFilter?.trim()) params.eventType = eventTypeFilter.trim();
      const res = await newsletterService.getAll(params);
      const data = res?.data ?? res;
      const newsletters = data?.newsletters ?? data?.data ?? (Array.isArray(data) ? data : []);
      setList(Array.isArray(newsletters) ? newsletters : []);
    } catch (e) {
      message.error("Failed to load newsletters");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      title: record.title,
      author: record.author,
      eventType: record.eventType,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingRecord) {
        await newsletterService.update(editingRecord._id, values);
        message.success("Newsletter updated");
      } else {
        await newsletterService.create(values);
        message.success("Newsletter created");
      }
      setModalOpen(false);
      fetchList();
    } catch (e) {
      if (e.errorFields) return;
      message.error(e?.message || "Request failed");
    }
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Delete newsletter?",
      content: `Delete "${record.title}"?`,
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await newsletterService.delete(record._id);
          message.success("Deleted");
          fetchList();
        } catch (e) {
          message.error("Delete failed");
        }
      },
    });
  };

  if (!canView) {
    return <div className="p-4 text-center">You don&apos;t have permission to view newsletters.</div>;
  }

  const columns = [
    { title: "Title", dataIndex: "title", key: "title", ellipsis: true },
    { title: "Author", dataIndex: "author", key: "author" },
    { title: "Event type", dataIndex: "eventType", key: "eventType" },
    ...(canEdit || canDelete
      ? [
          {
            title: "Actions",
            key: "actions",
            render: (_, rec) => (
              <Flex gap={8}>
                {canEdit && <Button size="small" onClick={() => openEdit(rec)}>Edit</Button>}
                {canDelete && <Button size="small" danger onClick={() => handleDelete(rec)}>Delete</Button>}
              </Flex>
            ),
          },
        ]
      : []),
  ];

  return (
    <Title
      title="Newsletters (Admin)"
      button={canAdd ? <Button type="primary" onClick={openCreate}>Add Newsletter</Button> : null}
    >
      <Flex className="mb-4 gap-3 flex-wrap">
        <Input.Search
          placeholder="Search by title"
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={fetchList}
          style={{ width: 240 }}
        />
        <Input
          placeholder="Filter by event type"
          allowClear
          value={eventTypeFilter}
          onChange={(e) => setEventTypeFilter(e.target.value)}
          style={{ width: 200 }}
        />
        <Button type="primary" onClick={fetchList}>Apply</Button>
      </Flex>
      <Table rowKey="_id" columns={columns} dataSource={list} loading={loading} pagination={{ pageSize: 10 }} />
      <Modal
        title={editingRecord ? "Edit Newsletter" : "Add Newsletter"}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText={editingRecord ? "Update" : "Create"}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="author" label="Author" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="eventType" label="Event type">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Title>
  );
}

export default AdminNewsletters;
