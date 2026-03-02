import { useState, useEffect } from "react";
import { Table, Button, Flex, Modal, Image, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import Title from "@components/layouts/Title";
import userStore from "@stores/UserStore";
import permissions from "@utils/permissions";
import newsletterService from "@services/Newsletter";
import { useStore } from "zustand";

function AdminNewsletters() {
  const { user } = useStore(userStore);
  const navigate = useNavigate();
  const [result, setResult] = useState({ newsletters: [], total: 0, page: 1, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("");

  const canView = permissions.adminNewsletter?.view?.includes(user?.role);
  const canAdd = permissions.adminNewsletter?.add?.includes(user?.role);
  const canEdit = permissions.adminNewsletter?.edit?.includes(user?.role);
  const canDelete = permissions.adminNewsletter?.delete?.includes(user?.role);

  useEffect(() => {
    if (canView) fetchList();
  }, [canView, result.page, search, eventTypeFilter]);

  const fetchList = async () => {
    try {
      setLoading(true);
      const params = { page: result.page, limit: 10 };
      if (search?.trim()) params.search = search.trim();
      if (eventTypeFilter?.trim()) params.eventType = eventTypeFilter.trim();
      const res = await newsletterService.getAll(params);
      const data = res?.data ?? res;
      const newsletters = data?.newsletters ?? data?.data ?? (Array.isArray(data) ? data : []);
      const total = data?.total ?? newsletters?.length ?? 0;
      setResult((r) => ({ ...r, newsletters, total, totalPages: data?.totalPages ?? Math.ceil(total / 10) }));
    } catch (e) {
      message.error("Failed to load newsletters");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    navigate("/admin/newsletters/create");
  };

  const openEdit = (record) => {
    navigate(`/admin/newsletters/edit/${record._id}`);
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
    {
      title: "Banner",
      dataIndex: ["bannerImage", "url"],
      key: "banner",
      width: 80,
      render: (imageUrl) => (
        imageUrl ? (
          <Image
            src={imageUrl}
            alt="Newsletter banner"
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
    { title: "Event Type", dataIndex: "eventType", key: "eventType" },
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
          placeholder="Search by title or author"
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={() => setResult((r) => ({ ...r, page: 1 }))}
          style={{ width: 280 }}
        />
        <Input
          placeholder="Filter by event type"
          allowClear
          value={eventTypeFilter}
          onChange={(e) => setEventTypeFilter(e.target.value)}
          style={{ width: 200 }}
        />
      </Flex>
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={result.newsletters}
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

export default AdminNewsletters;
