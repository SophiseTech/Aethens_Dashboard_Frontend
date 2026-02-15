import { useState, useEffect } from "react";
import { Table, Button, Flex, Modal, Form, Input, message } from "antd";
import Title from "@components/layouts/Title";
import userStore from "@stores/UserStore";
import permissions from "@utils/permissions";
import artWorkService from "@services/ArtWork";
import { useStore } from "zustand";

function AdminArtWorks() {
  const { user } = useStore(userStore);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  const canView = permissions.adminArtWork?.view?.includes(user?.role);
  const canAdd = permissions.adminArtWork?.add?.includes(user?.role);
  const canEdit = permissions.adminArtWork?.edit?.includes(user?.role);
  const canDelete = permissions.adminArtWork?.delete?.includes(user?.role);

  useEffect(() => {
    if (canView) fetchList();
  }, [canView]);

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await artWorkService.getAll();
      const data = res?.data ?? res?.artWorks ?? (Array.isArray(res) ? res : []);
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      message.error("Failed to load art works");
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
    const artist = record.artist || {};
    form.setFieldsValue({
      subtitle: record.subtitle,
      shortDescription: record.shortDescription,
      longDescription: record.longDescription,
      slug: record.slug,
      artistName: artist.name,
      artistAge: artist.age,
      artistCourse: artist.course,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        subtitle: values.subtitle,
        shortDescription: values.shortDescription,
        longDescription: values.longDescription,
        slug: values.slug,
        artist: {
          name: values.artistName,
          age: values.artistAge,
          course: values.artistCourse,
        },
      };
      if (editingRecord) {
        await artWorkService.update(editingRecord._id, payload);
        message.success("Art work updated");
      } else {
        await artWorkService.create(payload);
        message.success("Art work created");
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
      title: "Delete art work?",
      content: "This cannot be undone.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await artWorkService.delete(record._id);
          message.success("Deleted");
          fetchList();
        } catch (e) {
          message.error("Delete failed");
        }
      },
    });
  };

  if (!canView) {
    return <div className="p-4 text-center">You don&apos;t have permission to view art works.</div>;
  }

  const columns = [
    { title: "Subtitle", dataIndex: "subtitle", key: "subtitle", ellipsis: true },
    {
      title: "Artist",
      key: "artist",
      render: (_, r) => r.artist?.name ?? "—",
    },
    { title: "Slug", dataIndex: "slug", key: "slug", ellipsis: true },
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
      title="Art Works (Admin)"
      button={canAdd ? <Button type="primary" onClick={openCreate}>Add Art Work</Button> : null}
    >
      <Table rowKey="_id" columns={columns} dataSource={list} loading={loading} pagination={{ pageSize: 10 }} />
      <Modal
        title={editingRecord ? "Edit Art Work" : "Add Art Work"}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText={editingRecord ? "Update" : "Create"}
        width={560}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="subtitle" label="Subtitle">
            <Input />
          </Form.Item>
          <Form.Item name="slug" label="Slug" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="shortDescription" label="Short description" rules={[{ required: true }]}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="longDescription" label="Long description" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="artistName" label="Artist name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="artistAge" label="Artist age">
            <Input type="number" />
          </Form.Item>
          <Form.Item name="artistCourse" label="Artist course">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Title>
  );
}

export default AdminArtWorks;
