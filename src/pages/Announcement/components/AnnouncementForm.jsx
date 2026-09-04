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
  const canTargetCenters = [ROLES.ADMIN, ROLES.OPERATIONS_MANAGER, ROLES.ACADEMIC_MANAGER].includes(user.role);

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
    is_all_centers: false,
    center_ids: [],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!centers || centers.length <= 0) {
      getCenters(0);
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
          is_all_centers: !!selected.is_all_centers,
          center_ids: (selected.center_ids || []).map((c) => (typeof c === "object" ? c._id : c)),
        });
      } else {
        setForm({ title: "", body: "", expires_at: "", is_published: false, is_all_centers: false, center_ids: [] });
      }
      setErrors({});
    }
  }, [modalOpen, selected]);

  const validate = () => {
    const errs = {};
    if (!form.title) errs.title = "Title is required";
    if (!form.body) errs.body = "Body is required";
    if (!form.expires_at) errs.expires_at = "Expiry date is required";
    if (canTargetCenters && !form.is_all_centers && form.center_ids.length === 0) {
      errs.center_ids = "Select at least one center, or choose All Centers";
    }
    setErrors(errs);
    if (errs.center_ids) message.warning(errs.center_ids);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      let finalData = { ...form };
      if (!canTargetCenters) {
        delete finalData.center_ids;
        delete finalData.is_all_centers;
      } else if (finalData.is_all_centers) {
        finalData.center_ids = [];
      }
      if (isEdit) {
        await update(selected._id, finalData);
        message.success("Announcement updated", 2);
      } else {
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
        {canTargetCenters && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={form.is_all_centers}
                onChange={(checked) =>
                  setForm((f) => ({ ...f, is_all_centers: checked, center_ids: checked ? [] : f.center_ids }))
                }
              />
              <span>All Centers</span>
            </div>
            {!form.is_all_centers && (
              <Select
                mode="multiple"
                style={{ width: "100%" }}
                options={centerOptions}
                value={form.center_ids}
                placeholder="Select Centers"
                onChange={(value) => setForm((f) => ({ ...f, center_ids: value }))}
              />
            )}
          </div>
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
