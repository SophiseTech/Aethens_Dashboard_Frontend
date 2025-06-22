import React from "react";
import useAnnouncementStore from "@/stores/AnnouncementStore";
import { Button, message, Modal } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

export default function DeleteModal() {
  const {
    deleteModalOpen,
    setDeleteModalOpen,
    selected,
    remove,
    loading,
  } = useAnnouncementStore();

  const handleDelete = async () => {
    try {
      await remove(selected._id);
      message.success("Announcement deleted");
    } catch {
      message.error("Could not delete announcement");
    }
  };

  return (
    <Modal
      open={deleteModalOpen}
      onClose={() => setDeleteModalOpen(false)}
      title="Delete Announcement"
      onCancel={() => setDeleteModalOpen(false)}
      onOk={handleDelete}
      okButtonProps={{ disabled: loading }}
      okText={loading ? <LoadingOutlined className="animate-spin" size="sm" /> : "Confirm"}
    >
      <p>Are you sure you want to delete this announcement?</p>
    </Modal>
  );
}