import { useState, useEffect } from "react";
import { Table, Button, Flex, Modal, Form, Input, message } from "antd";
import Title from "@components/layouts/Title";
import userStore from "@stores/UserStore";
import permissions from "@utils/permissions";
import latestVideosService from "@services/LatestVideos";
import { useStore } from "zustand";

function AdminLatestVideos() {
  const { user } = useStore(userStore);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  const canView = permissions.adminLatestVideos?.view?.includes(user?.role);
  const canAdd = permissions.adminLatestVideos?.add?.includes(user?.role);
  const canEdit = permissions.adminLatestVideos?.edit?.includes(user?.role);
  const canDelete = permissions.adminLatestVideos?.delete?.includes(user?.role);

  useEffect(() => {
    if (canView) fetchList();
  }, [canView]);

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await latestVideosService.getAll();
      const data = res?.data ?? res?.videos ?? (Array.isArray(res) ? res : []);
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      message.error("Failed to load latest videos");
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
    form.setFieldsValue({ youtubeKey: record.youtubeKey });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingRecord) {
        await latestVideosService.update(editingRecord._id, values);
        message.success("Video updated");
      } else {
        await latestVideosService.create(values);
        message.success("Video added");
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
      title: "Remove this video?",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await latestVideosService.delete(record._id);
          message.success("Deleted");
          fetchList();
        } catch (e) {
          message.error("Delete failed");
        }
      },
    });
  };

  if (!canView) {
    return <div className="p-4 text-center">You don&apos;t have permission to view latest videos.</div>;
  }

  const columns = [
    {
      title: "YouTube key",
      dataIndex: "youtubeKey",
      key: "youtubeKey",
      render: (key) => (
        <a href={`https://www.youtube.com/watch?v=${key}`} target="_blank" rel="noopener noreferrer">
          {key}
        </a>
      ),
    },
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
      title="Latest Videos (Admin)"
      button={canAdd ? <Button type="primary" onClick={openCreate}>Add Video</Button> : null}
    >
      <Table rowKey="_id" columns={columns} dataSource={list} loading={loading} pagination={{ pageSize: 10 }} />
      <Modal
        title={editingRecord ? "Edit Video" : "Add Latest Video"}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText={editingRecord ? "Update" : "Create"}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="youtubeKey"
            label="YouTube video ID"
            rules={[{ required: true }]}
            extra="e.g. from https://www.youtube.com/watch?v=ABC123 use ABC123"
          >
            <Input placeholder="e.g. dQw4w9WgXcQ" />
          </Form.Item>
        </Form>
      </Modal>
    </Title>
  );
}

export default AdminLatestVideos;
