import React, { useState, useEffect, useMemo } from "react";
import useAnnouncementStore from "@/stores/AnnouncementStore";
import {
  Button,
  DatePicker,
  Input,
  message,
  Modal,
  Switch,
  Select,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { ROLES } from "@utils/constants";
import { useStore } from "zustand";
import userStore from "@stores/UserStore";
import centersStore from "@stores/CentersStore";

export default function AnnouncementForm() {
  const { modalOpen, setModalOpen, selected, create, update, loading } =
    useAnnouncementStore();
  const { centers, getCenters } = useStore(centersStore);
  const { user } = userStore();

  const isEdit = Boolean(selected);

  const centerOptions = useMemo(
    () =>
      centers?.map((center) => ({
        label: center.center_name,
        value: center._id,
      })),
    [centers]
  );

  const [form, setForm] = useState({
    title: "",
    body: "",
    expires_at: "",
    is_published: false,
    center_id: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!centers || centers.length <= 0) {
      getCenters();
    }
  }, []);

  useEffect(() => {
    if (modalOpen) {
      if (selected) {
        setForm({
          title: selected.title || "",
          body: selected.body || "",
          expires_at: selected.expires_at
            ? dayjs(selected.expires_at.slice(0, 10))
            : "",
          is_published: !!selected.is_published,
          center_id: selected.center_id
        });
      } else {
        setForm({ title: "", body: "", expires_at: "", is_published: false, center_id: "" });
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
        let finalData = form;
        if (user.role === ROLES.MANAGER) {
          delete finalData.center_id;
        }
        await create(finalData);
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
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          error={errors.title}
          required
        />
        <Input.TextArea
          label="Body"
          value={form.body}
          onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          error={errors.body}
          required
          rows={5}
        />
        <DatePicker
          label="Expiry Date"
          value={form.expires_at}
          onChange={(date) => setForm((f) => ({ ...f, expires_at: date }))}
          error={errors.expires_at}
          required
        />
        {(user.role === ROLES.ADMIN || user.role === ROLES.OPERATIONS_MANAGER) && (
          <Select
            style={{ width: 150 }}
            options={centerOptions}
            value={form.center_id}
            placeholder="Select Center"
            onChange={(value) => setForm((f) => ({ ...f, center_id: value }))}
          />
        )}
        <div className="flex items-center gap-2">
          <Switch
            checked={form.is_published}
            onChange={(checked) =>
              setForm((f) => ({ ...f, is_published: checked }))
            }
          />
          <span>Publish</span>
        </div>
      </div>
    </Modal>
  );
}
