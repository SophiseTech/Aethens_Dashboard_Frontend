import React, { useState, useEffect } from "react";
import useAnnouncementStore from "@/stores/AnnouncementStore";
import { Button, DatePicker, Input, message, Modal, Switch } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

export default function AnnouncementForm() {
  const {
    modalOpen,
    setModalOpen,
    selected,
    create,
    update,
    loading,
  } = useAnnouncementStore();

  const isEdit = Boolean(selected);

  const [form, setForm] = useState({
    title: "",
    body: "",
    expires_at: "",
    is_published: false,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (modalOpen) {
      if (selected) {
        setForm({
          title: selected.title || "",
          body: selected.body || "",
          expires_at: selected.expires_at ? dayjs(selected.expires_at.slice(0, 10)) : "",
          is_published: !!selected.is_published,
        });
      } else {
        setForm({ title: "", body: "", expires_at: "", is_published: false });
      }
      setErrors({});
    }
  }, [modalOpen, selected]);

  const validate = () => {
    const errs = {};
    if (!form.title) errs.title = "Title is required";
    if (!form.body) errs.body = "Body is required";
    if (!form.expires_at) errs.expires_at = "Expiry date is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      if (isEdit) {
        await update(selected._id, form);
        message.success("Announcement updated", 2);
      } else {
        await create(form);
        message.success("Announcement created");
      }
      setModalOpen(false);
    } catch {
      message.error("Submission failed");
    }
  };

  return (
    <Modal
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      title={isEdit ? "Edit Announcement" : "New Announcement"}
      onCancel={() => setModalOpen(false)}
      onOk={handleSubmit}
      okButtonProps={{ disabled: loading }}

    >
      <div className="space-y-4">
        <Input
          label="Title"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          error={errors.title}
          required
        />
        <Input.TextArea
          label="Body"
          value={form.body}
          onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
          error={errors.body}
          required
          rows={5}
        />
        <DatePicker
          label="Expiry Date"
          value={form.expires_at}
          onChange={date => setForm(f => ({ ...f, expires_at: date }))}
          error={errors.expires_at}
          required
        />
        <div className="flex items-center gap-2">
          <Switch
            checked={form.is_published}
            onChange={checked => setForm(f => ({ ...f, is_published: checked }))}
          />
          <span>Publish</span>
        </div>
      </div>
    </Modal>
  );
}