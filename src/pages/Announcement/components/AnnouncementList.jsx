import React, { useMemo } from "react";
import useAnnouncementStore from "@/stores/AnnouncementStore";
import { formatDate } from "@utils/helper";
import { Button, Empty, Input, Select, Switch, Tooltip } from "antd";
import { EditOutlined, LoadingOutlined, RestOutlined } from "@ant-design/icons";

const statusOptions = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "unpublished", label: "Unpublished" },
];

export default function AnnouncementList() {
  const {
    announcements,
    loading,
    filter,
    setFilter,
    setModalOpen,
    setSelected,
    setDeleteModalOpen,
    update,
  } = useAnnouncementStore();

  const filtered = useMemo(() => {
    let filtered = announcements;
    if (filter.status !== "all") {
      filtered = filtered.filter((a) =>
        filter.status === "published" ? a.is_published : !a.is_published
      );
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      filtered = filtered.filter((a) => a.title.toLowerCase().includes(q));
    }
    return filtered.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [announcements, filter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="flex gap-2">
          <Select
            options={statusOptions}
            value={filter.status}
            onChange={(e) => setFilter({ status: e.target.value })}
            className="w-32"
          />
          <Input
            placeholder="Search by title"
            value={filter.search}
            onChange={(e) => setFilter({ search: e.target.value })}
            className="w-48"
          />
        </div>
        <Button onClick={() => { setSelected(null); setModalOpen(true); }}>+ Add Announcement</Button>
      </div>
      {loading ? (
        <div className="flex justify-center py-8"><LoadingOutlined className="animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Empty title="No Announcements" description="Create your first announcement." />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="text-left text-gray-700 border-b">
                <th className="p-3">Title</th>
                <th className="p-3">Created At</th>
                <th className="p-3">Expiry Date</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{a.title}</td>
                  <td className="p-3">{formatDate(new Date(a.created_at))}</td>
                  <td className="p-3">{a.expires_at ? formatDate(new Date(a.expires_at)) : "-"}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        a.is_published
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {a.is_published ? "Published" : "Unpublished"}
                    </span>
                  </td>
                  <td className="p-3 flex gap-2 items-center">
                    <Tooltip content="Edit">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelected(a);
                          setModalOpen(true);
                        }}
                      >
                        <EditOutlined />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Delete">
                      <Button
                        variant="ghost"
                        size="sm"
                        color="danger"
                        onClick={() => {
                          setSelected(a);
                          setDeleteModalOpen(true);
                        }}
                      >
                        <RestOutlined />
                      </Button>
                    </Tooltip>
                    <Tooltip content={a.is_published ? "Unpublish" : "Publish"}>
                      <Switch
                        checked={a.is_published}
                        onChange={() =>
                          update(a._id, { is_published: !a.is_published })
                        }
                        aria-label="Toggle Publish"
                      />
                    </Tooltip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}