import React, { useEffect, useState } from "react";
import { Modal, Input, Select, Switch, Button, Table, Upload, Space, message } from "antd";
import { PlusOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import useEnquiryDocumentSetStore from "@/stores/EnquiryDocumentSetStore";
import useCourse from "@/hooks/useCourse";
import s3Service from "@/services/S3Service";

const EMPTY_FORM = {
  matchType: "course",
  courseId: "",
  ageCategory: "",
  documents: [],
  active: true,
};

export default function EnquiryDocumentSetForm() {
  const { modalOpen, setModalOpen, selected, create, update, loading } = useEnquiryDocumentSetStore();
  const { courseOptions, getCourses, courses, loading: coursesLoading } = useCourse();
  const isEdit = Boolean(selected);

  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!courses || courses.length === 0) {
      getCourses(0);
    }
  }, []);

  useEffect(() => {
    if (modalOpen) {
      if (selected) {
        setForm({
          matchType: selected.courseId ? "course" : "ageCategory",
          courseId: selected.courseId?._id || selected.courseId || "",
          ageCategory: selected.ageCategory || "",
          documents: selected.documents || [],
          active: selected.active !== false,
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [modalOpen, selected]);

  const addDocument = () => {
    setForm((f) => ({
      ...f,
      documents: [...f.documents, { name: "", fileUrl: "", fileName: "" }],
    }));
  };

  const updateDocument = (i, patch) => {
    setForm((f) => ({
      ...f,
      documents: f.documents.map((d, idx) => (idx === i ? { ...d, ...patch } : d)),
    }));
  };

  const removeDocument = (i) => {
    setForm((f) => ({ ...f, documents: f.documents.filter((_, idx) => idx !== i) }));
  };

  const handleSubmit = async () => {
    if (form.matchType === "course" && !form.courseId) return message.error("Select a course");
    if (form.matchType === "ageCategory" && !form.ageCategory.trim()) return message.error("Enter an age category");
    if (form.documents.some((d) => !d.name || !d.fileUrl)) {
      return message.error("Every document needs a name and an uploaded file");
    }

    const payload = {
      courseId: form.matchType === "course" ? form.courseId : null,
      ageCategory: form.matchType === "ageCategory" ? form.ageCategory.trim() : null,
      documents: form.documents.map((d, idx) => ({ ...d, order: idx })),
      active: form.active,
    };

    try {
      if (isEdit) {
        await update(selected._id, payload);
        message.success("Document set updated");
      } else {
        await create(payload);
        message.success("Document set created");
      }
    } catch {
      message.error("Failed to save document set");
    }
  };

  const documentColumns = [
    {
      title: "Name",
      dataIndex: "name",
      render: (v, _r, i) => (
        <Input value={v} onChange={(e) => updateDocument(i, { name: e.target.value })} placeholder="e.g. Brochure" />
      ),
    },
    {
      title: "File",
      render: (_v, record, i) => (
        <Space>
          <Upload
            showUploadList={false}
            accept="application/pdf,image/*"
            customRequest={async ({ file, onSuccess, onError }) => {
              try {
                const reader = new FileReader();
                reader.onload = async () => {
                  try {
                    const [url] = await s3Service.uploadFiles({
                      files: [{ data: reader.result, fileName: file.name, fileType: file.type, path: "enquiry-documents" }],
                    });
                    if (!url) throw new Error("Upload failed");
                    updateDocument(i, { fileUrl: url, fileName: file.name });
                    onSuccess(url);
                  } catch (error) {
                    message.error("File upload failed");
                    onError(error);
                  }
                };
                reader.readAsDataURL(file);
              } catch (error) {
                onError(error);
              }
            }}
          >
            <Button size="small" icon={<UploadOutlined />}>
              {record.fileUrl ? "Reupload" : "Upload"}
            </Button>
          </Upload>
          {record.fileUrl && (
            <a href={record.fileUrl} target="_blank" rel="noreferrer">
              {record.fileName || "View"}
            </a>
          )}
        </Space>
      ),
    },
    {
      title: "",
      width: 50,
      render: (_v, _r, i) => <Button icon={<DeleteOutlined />} danger type="text" onClick={() => removeDocument(i)} />,
    },
  ];

  return (
    <Modal
      open={modalOpen}
      onCancel={() => setModalOpen(false)}
      title={isEdit ? "Edit Document Set" : "New Document Set"}
      onOk={handleSubmit}
      okButtonProps={{ disabled: loading }}
      width={680}
      destroyOnClose
    >
      <div className="space-y-3">
        <Select
          value={form.matchType}
          onChange={(v) => setForm((f) => ({ ...f, matchType: v }))}
          options={[
            { label: "Match by course", value: "course" },
            { label: "Match by age category", value: "ageCategory" },
          ]}
        />

        {form.matchType === "course" ? (
          <Select
            placeholder="Select course"
            value={form.courseId || undefined}
            loading={coursesLoading}
            onChange={(v) => setForm((f) => ({ ...f, courseId: v }))}
            options={courseOptions}
            showSearch
            optionFilterProp="label"
          />
        ) : (
          <Input
            placeholder="Age category (e.g. 6-9 yrs)"
            value={form.ageCategory}
            onChange={(e) => setForm((f) => ({ ...f, ageCategory: e.target.value }))}
          />
        )}

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Documents</span>
            <Button size="small" icon={<PlusOutlined />} onClick={addDocument}>
              Add document
            </Button>
          </div>
          <Table dataSource={form.documents} columns={documentColumns} rowKey={(_r, i) => i} size="small" pagination={false} />
        </div>

        <div className="flex items-center gap-2">
          <Switch checked={form.active} onChange={(v) => setForm((f) => ({ ...f, active: v }))} />
          <span>Active</span>
        </div>
      </div>
    </Modal>
  );
}
