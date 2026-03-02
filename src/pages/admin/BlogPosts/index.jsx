import { useState, useEffect } from "react";
import { Table, Button, Flex, Modal, Image, Input, message, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import Title from "@components/layouts/Title";
import userStore from "@stores/UserStore";
import permissions from "@utils/permissions";
import blogService from "@services/Blog";
import { useStore } from "zustand";

function AdminBlogPosts() {
  const { user } = useStore(userStore);
  const navigate = useNavigate();
  const [result, setResult] = useState({ posts: [], total: 0, page: 1, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

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
    navigate("/admin/blog-posts/create");
  };

  const openEdit = (record) => {
    navigate(`/admin/blog-posts/edit/${record._id}`);
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
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      width: 80,
      render: (imageUrl) => (
        imageUrl ? (
          <Image
            src={imageUrl}
            alt="Blog thumbnail"
            width={50}
            height={50}
            className="object-cover rounded"
            preview={{ src: imageUrl }}
          />
        ) : (
          <span className="text-gray-400">No image</span>
        )
      ),
    },
    { title: "Title", dataIndex: "title", key: "title", ellipsis: true },
    { title: "Author", dataIndex: "author", key: "author" },
    { title: "Read Time (min)", dataIndex: "readTime", key: "readTime", width: 120 },
    { title: "Likes", dataIndex: "likes", key: "likes", width: 80 },
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
    </Title>
  );
}

export default AdminBlogPosts;
