import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Flex, Modal, Image, Input, message } from "antd";
import Title from "@components/layouts/Title";
import userStore from "@stores/UserStore";
import permissions from "@utils/permissions";
import shopItemService from "@services/ShopItem";
import { useStore } from "zustand";

function AdminShopItems() {
  const { user } = useStore(userStore);
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

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
    {
      title: "Image",
      key: "artImage",
      width: 80,
      render: (_, r) =>
        r.artImage ? (
          <Image
            src={r.artImage}
            alt={r.title || "Shop item"}
            width={50}
            height={50}
            style={{ objectFit: "cover", borderRadius: 4 }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P/BfwAJhAPkEl0jSAAAAABJRU5ErkJggg=="
          />
        ) : (
          "—"
        ),
    },
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
              {canEdit && (
                <Button size="small" onClick={() => navigate(`/admin/shop-items/edit/${rec._id}`)}>
                  Edit
                </Button>
              )}
              {canDelete && (
                <Button size="small" danger onClick={() => handleDelete(rec)}>
                  Delete
                </Button>
              )}
            </Flex>
          ),
        },
      ]
      : []),
  ];

  return (
    <Title
      title="Shop Items (Admin)"
      button={canAdd ? <Button type="primary" onClick={() => navigate("/admin/shop-items/create")}>Add Shop Item</Button> : null}
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
    </Title>
  );
}

export default AdminShopItems;
