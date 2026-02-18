import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Flex, Modal, Image, message } from "antd";
import Title from "@components/layouts/Title";
import userStore from "@stores/UserStore";
import permissions from "@utils/permissions";
import artWorkService from "@services/ArtWork";
import { useStore } from "zustand";

function AdminArtWorks() {
  const { user } = useStore(userStore);
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

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
    {
      title: "Image",
      key: "artImage",
      width: 80,
      render: (_, r) =>
        r.artImage ? (
          <Image
            src={r.artImage}
            alt={r.subtitle || "Art work"}
            width={50}
            height={50}
            style={{ objectFit: "cover", borderRadius: 4 }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P/BfwAJhAPkEl0jSAAAAABJRU5ErkJggg=="
          />
        ) : (
          "—"
        ),
    },
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
              {canEdit && (
                <Button size="small" onClick={() => navigate(`/admin/art-works/edit/${rec._id}`)}>
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
      title="Art Works (Admin)"
      button={canAdd ? <Button type="primary" onClick={() => navigate("/admin/art-works/create")}>Add Art Work</Button> : null}
    >
      <Table rowKey="_id" columns={columns} dataSource={list} loading={loading} pagination={{ pageSize: 10 }} />
    </Title>
  );
}

export default AdminArtWorks;
