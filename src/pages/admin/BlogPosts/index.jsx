import { useState, useEffect } from "react";
import { Table, Button, Flex, Modal, Form, Input, InputNumber, Switch, message, Tag } from "antd";
import Title from "@components/layouts/Title";
import userStore from "@stores/UserStore";
import permissions from "@utils/permissions";
import blogService from "@services/Blog";
import { useStore } from "zustand";

function AdminBlogPosts() {
  const { user } = useStore(userStore);
  const [result, setResult] = useState({ posts: [], total: 0, page: 1, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  const canView = permissions.adminBlogPost?.view?.includes(user?.role);
  const canAdd = permissions.adminBlogPost?.add?.includes(user?.role);
  const canEdit = permissions.adminBlogPost?.edit?.includes(user?.role);
  const canDelete = permissions.adminBlogPost?.delete?.includes(user?.role);

  useEffect(() => {
    if (canView) fetchList();
  }, [canView, result.page, search]);

  const fetchList = async () => {
    try {
      setLoading(true);
      const params = { page: result.page, limit: 10 };
      if (search?.trim()) params.search = search.trim();
      const res = await blogService.getAll(params);
      const data = res?.data ?? res;
      const posts = data?.posts ?? data?.data ?? (Array.isArray(data) ? data : []);
      const total = data?.total ?? posts?.length ?? 0;
      setResult((r) => ({ ...r, posts, total, totalPages: data?.totalPages ?? Math.ceil(total / 10) }));
    } catch (e) {
      message.error("Failed to load blog posts");
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
      slug: record.slug,
      readTime: record.readTime,
      is_published: record.is_published,
      image: record.image,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingRecord) {
        await blogService.update(editingRecord._id, values);
        message.success("Blog post updated");
      } else {
        await blogService.create(values);
        message.success("Blog post created");
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
      title: "Delete blog post?",
      content: `Delete "${record.title}"?`,
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await blogService.delete(record._id);
          message.success("Deleted");
          fetchList();
        } catch (e) {
          message.error("Delete failed");
        }
      },
    });
  };

  if (!canView) {
    return <div className="p-4 text-center">You don&apos;t have permission to view blog posts.</div>;
  }

  const columns = [
    { title: "Title", dataIndex: "title", key: "title", ellipsis: true },
    { title: "Author", dataIndex: "author", key: "author" },
    { title: "Slug", dataIndex: "slug", key: "slug", ellipsis: true },
    { title: "Read (min)", dataIndex: "readTime", key: "readTime", width: 90 },
    {
      title: "Published",
      dataIndex: "is_published",
      key: "is_published",
      render: (v) => <Tag color={v ? "green" : "default"}>{v ? "Yes" : "No"}</Tag>,
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
      title="Blog Posts (Admin)"
      button={canAdd ? <Button type="primary" onClick={openCreate}>Add Blog Post</Button> : null}
    >
      <Flex className="mb-4">
        <Input.Search
          placeholder="Search by title or author"
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={() => setResult((r) => ({ ...r, page: 1 }))}
          style={{ width: 280 }}
        />
      </Flex>
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={result.posts}
        loading={loading}
        pagination={{
          current: result.page,
          pageSize: 10,
          total: result.total,
          onChange: (p) => setResult((r) => ({ ...r, page: p })),
        }}
      />
      <Modal
        title={editingRecord ? "Edit Blog Post" : "Add Blog Post"}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText={editingRecord ? "Update" : "Create"}
        width={520}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="author" label="Author" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="slug" label="Slug" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="readTime" label="Read time (minutes)" rules={[{ required: true }]}>
            <InputNumber min={1} className="w-full" />
          </Form.Item>
          <Form.Item name="image" label="Image URL">
            <Input />
          </Form.Item>
          <Form.Item name="is_published" label="Published" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Title>
  );
}

export default AdminBlogPosts;
