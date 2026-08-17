import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  Modal,
  Input,
  Select,
  Segmented,
  Checkbox,
  DatePicker,
  Button,
  Table,
  Upload,
  message,
  Tag,
  Divider,
} from "antd";
import { UploadOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useStore } from "zustand";
import dayjs from "dayjs";
import useRecipientGroupStore from "@/stores/RecipientGroupStore";
import centersStore from "@stores/CentersStore";
import courseStore from "@stores/CourseStore";
import diplomaCourseStore from "@stores/DiplomaCourseStore";
import diplomaBatchStore from "@stores/DiplomaBatchStore";
import diplomaIntakeStore from "@stores/DiplomaIntakeStore";

const EMPTY_FILTER = {
  center_ids: [],
  course_ids: [],
  courseType: null,
  diplomaCourse_ids: [],
  diplomaIntake_ids: [],
  diplomaBatch_ids: [],
  bookedSessionStatus: ["active"],
  userStatus: ["active"],
  enrollmentDateFrom: null,
  enrollmentDateTo: null,
  role: "student",
};

const EXCLUSION_LABELS = {
  missing_phone: "Missing phone",
  invalid_phone: "Invalid phone",
  duplicate_phone: "Duplicate",
};

export default function RecipientGroupForm() {
  const { modalOpen, setModalOpen, selected, create, update, loading, previewDraft, preview, previewLoading, clearPreview, importCsv } =
    useRecipientGroupStore();
  const { centers, getCenters } = useStore(centersStore);
  const { courses, getCoursesForAdmin } = useStore(courseStore);
  const { courses: diplomaCourses, getCoursesForAdmin: getDiplomaCourses } = useStore(diplomaCourseStore);
  const { batches: diplomaBatches, getBatchesForAdmin } = useStore(diplomaBatchStore);
  const { intakes: diplomaIntakes, getIntakesForAdmin } = useStore(diplomaIntakeStore);

  const isEdit = Boolean(selected);

  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "dynamic",
    filterDefinition: EMPTY_FILTER,
    staticMembers: [],
  });

  useEffect(() => {
    getCenters(0);
    getCoursesForAdmin(500, 1);
    getDiplomaCourses(500, 1);
    getBatchesForAdmin(500, 1);
    getIntakesForAdmin(500, 1);
  }, []);

  useEffect(() => {
    if (modalOpen) {
      if (selected) {
        setForm({
          name: selected.name || "",
          description: selected.description || "",
          type: selected.type || "dynamic",
          filterDefinition: { ...EMPTY_FILTER, ...(selected.filterDefinition || {}) },
          staticMembers: selected.staticMembers || [],
        });
      } else {
        setForm({ name: "", description: "", type: "dynamic", filterDefinition: EMPTY_FILTER, staticMembers: [] });
      }
      clearPreview();
    }
  }, [modalOpen, selected]);

  const centerOptions = useMemo(() => centers?.map((c) => ({ label: c.center_name, value: c._id })) || [], [centers]);
  const courseOptions = useMemo(() => courses?.map((c) => ({ label: c.course_name, value: c._id })) || [], [courses]);
  const diplomaCourseOptions = useMemo(() => diplomaCourses?.map((c) => ({ label: c.name, value: c._id })) || [], [diplomaCourses]);
  const diplomaBatchOptions = useMemo(() => diplomaBatches?.map((b) => ({ label: b.name, value: b._id })) || [], [diplomaBatches]);
  const diplomaIntakeOptions = useMemo(() => diplomaIntakes?.map((i) => ({ label: i.name, value: i._id })) || [], [diplomaIntakes]);

  const setFilter = (patch) => setForm((f) => ({ ...f, filterDefinition: { ...f.filterDefinition, ...patch } }));

  const handleSubmit = async () => {
    if (!form.name) return message.error("Name is required");
    try {
      const payload = {
        name: form.name,
        description: form.description,
        type: form.type,
        ...(form.type === "dynamic" ? { filterDefinition: form.filterDefinition } : { staticMembers: form.staticMembers }),
      };
      if (isEdit) {
        await update(selected._id, payload);
        message.success("Recipient group updated");
      } else {
        await create(payload);
        message.success("Recipient group created");
      }
    } catch {
      message.error("Failed to save recipient group");
    }
  };

  const handlePreview = async () => {
    try {
      await previewDraft({
        type: form.type,
        filterDefinition: form.filterDefinition,
        staticMembers: form.staticMembers,
      });
    } catch {
      message.error("Failed to resolve preview");
    }
  };

  const addManualMember = () => {
    setForm((f) => ({ ...f, staticMembers: [...f.staticMembers, { name: "", phone: "", source: "manual" }] }));
  };

  const updateMember = (index, patch) => {
    setForm((f) => ({
      ...f,
      staticMembers: f.staticMembers.map((m, i) => (i === index ? { ...m, ...patch } : m)),
    }));
  };

  const removeMember = (index) => {
    setForm((f) => ({ ...f, staticMembers: f.staticMembers.filter((_, i) => i !== index) }));
  };

  const handleCsvUpload = async (file) => {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      const parsedRows = rows
        .map((row) => ({
          name: String(row.name || row.Name || row.NAME || "").trim(),
          phone: String(row.phone || row.Phone || row.PHONE || row.mobile || row.Mobile || "").trim(),
        }))
        .filter((r) => r.name || r.phone);

      if (!parsedRows.length) {
        message.warning("No rows found in file. Expect columns 'name' and 'phone'.");
        return false;
      }

      const normalized = await importCsv(parsedRows);
      const errorCount = normalized.filter((r) => r.error).length;
      const newMembers = normalized.map((r) => ({ name: r.name, phone: r.phone, source: r.source, user_id: r.user_id }));
      setForm((f) => ({ ...f, staticMembers: [...f.staticMembers, ...newMembers] }));
      message.success(`Imported ${normalized.length} row(s)${errorCount ? `, ${errorCount} with invalid phone` : ""}`);
    } catch (error) {
      message.error("Failed to parse file: " + error.message);
    }
    return false;
  };

  const memberColumns = [
    {
      title: "Name",
      dataIndex: "name",
      render: (value, _row, index) => (
        <Input value={value} onChange={(e) => updateMember(index, { name: e.target.value })} placeholder="Name" />
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      render: (value, _row, index) => (
        <Input value={value} onChange={(e) => updateMember(index, { phone: e.target.value })} placeholder="+91XXXXXXXXXX" />
      ),
    },
    { title: "Source", dataIndex: "source", width: 90, render: (v) => <Tag>{v}</Tag> },
    {
      title: "",
      width: 50,
      render: (_v, _row, index) => <Button icon={<DeleteOutlined />} danger type="text" onClick={() => removeMember(index)} />,
    },
  ];

  return (
    <Modal
      open={modalOpen}
      onCancel={() => setModalOpen(false)}
      title={isEdit ? "Edit Recipient Group" : "New Recipient Group"}
      onOk={handleSubmit}
      okButtonProps={{ disabled: loading }}
      width={720}
      destroyOnClose
    >
      <div className="space-y-4">
        <Input placeholder="Group name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <Input.TextArea
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={2}
        />

        <Segmented
          disabled={isEdit}
          options={[
            { label: "Dynamic (rule-based)", value: "dynamic" },
            { label: "Static / CSV list", value: "static" },
          ]}
          value={form.type}
          onChange={(value) => setForm((f) => ({ ...f, type: value }))}
        />

        {form.type === "dynamic" ? (
          <div className="grid grid-cols-2 gap-3">
            <Select
              mode="multiple"
              placeholder="Centers (all if empty)"
              options={centerOptions}
              value={form.filterDefinition.center_ids}
              onChange={(v) => setFilter({ center_ids: v })}
            />
            <Select
              placeholder="Course type"
              allowClear
              options={[
                { label: "Short term", value: "short_term" },
                { label: "Diploma", value: "diploma" },
              ]}
              value={form.filterDefinition.courseType}
              onChange={(v) => setFilter({ courseType: v || null })}
            />
            <Select
              mode="multiple"
              placeholder="Courses (short-term)"
              options={courseOptions}
              value={form.filterDefinition.course_ids}
              onChange={(v) => setFilter({ course_ids: v })}
            />
            <Select
              mode="multiple"
              placeholder="Diploma courses"
              options={diplomaCourseOptions}
              value={form.filterDefinition.diplomaCourse_ids}
              onChange={(v) => setFilter({ diplomaCourse_ids: v })}
            />
            <Select
              mode="multiple"
              placeholder="Diploma batches"
              options={diplomaBatchOptions}
              value={form.filterDefinition.diplomaBatch_ids}
              onChange={(v) => setFilter({ diplomaBatch_ids: v })}
            />
            <Select
              mode="multiple"
              placeholder="Diploma intakes"
              options={diplomaIntakeOptions}
              value={form.filterDefinition.diplomaIntake_ids}
              onChange={(v) => setFilter({ diplomaIntake_ids: v })}
            />
            <div>
              <div className="text-xs text-gray-500 mb-1">Booking status</div>
              <Checkbox.Group
                options={["active", "completed", "migrated", "cancelled"]}
                value={form.filterDefinition.bookedSessionStatus}
                onChange={(v) => setFilter({ bookedSessionStatus: v })}
              />
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">User status</div>
              <Checkbox.Group
                options={["active", "inactive", "system-deactivated"]}
                value={form.filterDefinition.userStatus}
                onChange={(v) => setFilter({ userStatus: v })}
              />
            </div>
            <DatePicker
              placeholder="Enrolled from"
              value={form.filterDefinition.enrollmentDateFrom ? dayjs(form.filterDefinition.enrollmentDateFrom) : null}
              onChange={(d) => setFilter({ enrollmentDateFrom: d ? d.toISOString() : null })}
            />
            <DatePicker
              placeholder="Enrolled to"
              value={form.filterDefinition.enrollmentDateTo ? dayjs(form.filterDefinition.enrollmentDateTo) : null}
              onChange={(d) => setFilter({ enrollmentDateTo: d ? d.toISOString() : null })}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Upload beforeUpload={handleCsvUpload} showUploadList={false} accept=".csv,.xlsx,.xls">
                <Button icon={<UploadOutlined />}>Upload CSV/XLSX</Button>
              </Upload>
              <Button icon={<PlusOutlined />} onClick={addManualMember}>
                Add row
              </Button>
            </div>
            <Table
              dataSource={form.staticMembers}
              columns={memberColumns}
              rowKey={(_r, i) => i}
              size="small"
              pagination={{ pageSize: 5 }}
            />
          </div>
        )}

        <Divider className="!my-2" />

        <div className="flex items-center justify-between">
          <Button onClick={handlePreview} loading={previewLoading}>
            Preview recipients
          </Button>
          {preview && (
            <div className="text-sm">
              <b>{preview.included.length}</b> will receive messages
              {preview.excluded.length > 0 && (
                <span className="text-gray-500">
                  {" "}
                  · {preview.excluded.length} excluded (
                  {Object.entries(
                    preview.excluded.reduce((acc, e) => {
                      acc[e.reason] = (acc[e.reason] || 0) + 1;
                      return acc;
                    }, {})
                  )
                    .map(([reason, count]) => `${count} ${EXCLUSION_LABELS[reason] || reason}`)
                    .join(", ")}
                  )
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
