import { useState, useEffect } from "react";
import { Table, Button, Flex, Modal, Form, Input, DatePicker, message } from "antd";
import dayjs from "dayjs";
import Title from "@components/layouts/Title";
import userStore from "@stores/UserStore";
import permissions from "@utils/permissions";
import studentOfTheWeekService from "@services/StudentOfTheWeek";
import { useStore } from "zustand";

function AdminStudentOfTheWeek() {
  const { user } = useStore(userStore);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  const canView = permissions.adminStudentOfTheWeek?.view?.includes(user?.role);
  const canAdd = permissions.adminStudentOfTheWeek?.add?.includes(user?.role);
  const canEdit = permissions.adminStudentOfTheWeek?.edit?.includes(user?.role);
  const canDelete = permissions.adminStudentOfTheWeek?.delete?.includes(user?.role);

  useEffect(() => {
    if (canView) fetchList();
  }, [canView, search, dateRange]);

  const fetchList = async () => {
    try {
      setLoading(true);
      const params = { limit: 100 };
      if (search?.trim()) params.search = search.trim();
      if (dateRange?.[0]) params.fromDate = dayjs(dateRange[0]).format("YYYY-MM-DD");
      if (dateRange?.[1]) params.toDate = dayjs(dateRange[1]).format("YYYY-MM-DD");
      const res = await studentOfTheWeekService.getAll(params);
      const data = res?.data ?? res;
      const entries = data?.entries ?? data?.data ?? (Array.isArray(data) ? data : []);
      setList(Array.isArray(entries) ? entries : []);
    } catch (e) {
      message.error("Failed to load student of the week");
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
    const sid = record.student_id?._id ?? record.student_id;
    form.setFieldsValue({
      body: record.body,
      image: record.image,
      student_id: sid,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingRecord) {
        await studentOfTheWeekService.update(editingRecord._id, values);
        message.success("Updated");
      } else {
        await studentOfTheWeekService.create(values);
        message.success("Created");
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
      title: "Delete student of the week?",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await studentOfTheWeekService.delete(record._id);
          message.success("Deleted");
          fetchList();
        } catch (e) {
          message.error("Delete failed");
        }
      },
    });
  };

  if (!canView) {
    return <div className="p-4 text-center">You don&apos;t have permission to view student of the week.</div>;
  }

  const columns = [
    { title: "Body", dataIndex: "body", key: "body", ellipsis: true },
    { title: "Student ID", dataIndex: "student_id", key: "student_id", render: (v) => (typeof v === "object" ? v?._id ?? "—" : v) },
    { title: "Awarded at", dataIndex: "awarded_at", key: "awarded_at", render: (v) => v ? new Date(v).toLocaleDateString() : "—" },
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
      title="Student of the Week (Admin)"
      button={canAdd ? <Button type="primary" onClick={openCreate}>Add</Button> : null}
    >
      <Flex className="mb-4 gap-3 flex-wrap">
        <Input.Search
          placeholder="Search by body text"
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={fetchList}
          style={{ width: 240 }}
        />
        <DatePicker.RangePicker
          value={dateRange}
          onChange={(dates) => setDateRange(dates)}
          allowClear
        />
        <Button type="primary" onClick={fetchList}>Apply</Button>
      </Flex>
      <Table rowKey="_id" columns={columns} dataSource={list} loading={loading} pagination={{ pageSize: 10 }} />
      <Modal
        title={editingRecord ? "Edit" : "Add Student of the Week"}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText={editingRecord ? "Update" : "Create"}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="body" label="Body" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="image" label="Image URL" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="student_id" label="Student ID (Mongo ObjectId)" rules={[{ required: true }]}>
            <Input placeholder="User _id of the student" />
          </Form.Item>
        </Form>
      </Modal>
    </Title>
  );
}

export default AdminStudentOfTheWeek;
