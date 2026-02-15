import { useState, useEffect } from "react";
import { Table, Button, Flex, Modal, Form, Input, InputNumber, message } from "antd";
import Title from "@components/layouts/Title";
import userStore from "@stores/UserStore";
import permissions from "@utils/permissions";
import shopItemService from "@services/ShopItem";
import { useStore } from "zustand";

function AdminShopItems() {
  const { user } = useStore(userStore);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  const canView = permissions.adminShopItem?.view?.includes(user?.role);
  const canAdd = permissions.adminShopItem?.add?.includes(user?.role);
  const canEdit = permissions.adminShopItem?.edit?.includes(user?.role);
  const canDelete = permissions.adminShopItem?.delete?.includes(user?.role);

  useEffect(() => {
    if (canView) fetchList();
  }, [canView, search]);

  const fetchList = async () => {
    try {
      setLoading(true);
      const params = { limit: 100 };
      if (search?.trim()) params.search = search.trim();
      const res = await shopItemService.getAll(params);
      const data = res?.data ?? res;
      const shopItems = data?.shopItems ?? data?.data ?? (Array.isArray(data) ? data : []);
      setList(Array.isArray(shopItems) ? shopItems : []);
    } catch (e) {
      message.error("Failed to load shop items");
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
      artist: record.artist,
      price: record.price,
      yearPublished: record.yearPublished,
      size: record.size,
      subject: record.subject,
      description: record.description,
      slug: record.slug,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingRecord) {
        await shopItemService.update(editingRecord._id, values);
        message.success("Shop item updated");
      } else {
        await shopItemService.create(values);
        message.success("Shop item created");
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
      title: "Delete shop item?",
      content: `Delete "${record.title}"?`,
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await shopItemService.delete(record._id);
          message.success("Deleted");
          fetchList();
        } catch (e) {
          message.error("Delete failed");
        }
      },
    });
  };

  if (!canView) {
    return <div className="p-4 text-center">You don&apos;t have permission to view shop items.</div>;
  }

  const columns = [
    { title: "Title", dataIndex: "title", key: "title", ellipsis: true },
    { title: "Artist", dataIndex: "artist", key: "artist" },
    { title: "Price", dataIndex: "price", key: "price", render: (v) => v != null ? `₹${v}` : "—" },
    { title: "Year", dataIndex: "yearPublished", key: "yearPublished", width: 80 },
    { title: "Size", dataIndex: "size", key: "size" },
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
      title="Shop Items (Admin)"
      button={canAdd ? <Button type="primary" onClick={openCreate}>Add Shop Item</Button> : null}
    >
      <Flex className="mb-4">
        <Input.Search
          placeholder="Search by title or artist"
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={fetchList}
          style={{ width: 280 }}
        />
      </Flex>
      <Table rowKey="_id" columns={columns} dataSource={list} loading={loading} pagination={{ pageSize: 10 }} />
      <Modal
        title={editingRecord ? "Edit Shop Item" : "Add Shop Item"}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText={editingRecord ? "Update" : "Create"}
        width={560}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="artist" label="Artist" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="slug" label="Slug" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Price" rules={[{ required: true }]}>
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item name="yearPublished" label="Year published" rules={[{ required: true }]}>
            <InputNumber min={1900} max={2100} className="w-full" />
          </Form.Item>
          <Form.Item name="size" label="Size" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="subject" label="Subject" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="artImage" label="Image URL">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Title>
  );
}

export default AdminShopItems;
