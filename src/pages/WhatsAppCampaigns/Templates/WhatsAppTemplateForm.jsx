import React, { useEffect, useState } from "react";
import { Modal, Input, Select, Switch, Button, Table, message } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import useWhatsAppTemplateStore from "@/stores/WhatsAppTemplateStore";

export default function WhatsAppTemplateForm() {
  const { modalOpen, setModalOpen, selected, create, update, loading } = useWhatsAppTemplateStore();
  const isEdit = Boolean(selected);

  const [form, setForm] = useState({
    name: "",
    language: "en",
    category: "UTILITY",
    bodyText: "",
    headerType: "none",
    headerText: "",
    footerText: "",
    variables: [],
    active: true,
  });

  useEffect(() => {
    if (modalOpen) {
      if (selected) {
        setForm({
          name: selected.name || "",
          language: selected.language || "en",
          category: selected.category || "UTILITY",
          bodyText: selected.bodyText || "",
          headerType: selected.headerType || "none",
          headerText: selected.headerText || "",
          footerText: selected.footerText || "",
          variables: selected.variables || [],
          active: selected.active !== false,
        });
      } else {
        setForm({
          name: "",
          language: "en",
          category: "UTILITY",
          bodyText: "",
          headerType: "none",
          headerText: "",
          footerText: "",
          variables: [],
          active: true,
        });
      }
    }
  }, [modalOpen, selected]);

  const addVariable = () => {
    const nextIndex = (form.variables[form.variables.length - 1]?.index || 0) + 1;
    setForm((f) => ({ ...f, variables: [...f.variables, { index: nextIndex, name: "", example: "" }] }));
  };

  const updateVariable = (i, patch) => {
    setForm((f) => ({ ...f, variables: f.variables.map((v, idx) => (idx === i ? { ...v, ...patch } : v)) }));
  };

  const removeVariable = (i) => {
    setForm((f) => ({ ...f, variables: f.variables.filter((_, idx) => idx !== i) }));
  };

  const handleSubmit = async () => {
    if (!form.name) return message.error("Name is required");
    if (!form.bodyText) return message.error("Body text is required");
    try {
      if (isEdit) {
        await update(selected._id, form);
        message.success("Template updated");
      } else {
        await create({ ...form, hasHeader: form.headerType !== "none", hasButtons: false });
        message.success("Template created");
      }
    } catch {
      message.error("Failed to save template. Name + language must be unique.");
    }
  };

  const variableColumns = [
    {
      title: "Index",
      dataIndex: "index",
      width: 70,
      render: (v, _r, i) => <Input type="number" value={v} onChange={(e) => updateVariable(i, { index: Number(e.target.value) })} />,
    },
    {
      title: "Name",
      dataIndex: "name",
      render: (v, _r, i) => <Input value={v} onChange={(e) => updateVariable(i, { name: e.target.value })} placeholder="e.g. student_name" />,
    },
    {
      title: "Example",
      dataIndex: "example",
      render: (v, _r, i) => <Input value={v} onChange={(e) => updateVariable(i, { example: e.target.value })} placeholder="e.g. Aarav" />,
    },
    { title: "", width: 50, render: (_v, _r, i) => <Button icon={<DeleteOutlined />} danger type="text" onClick={() => removeVariable(i)} /> },
  ];

  return (
    <Modal
      open={modalOpen}
      onCancel={() => setModalOpen(false)}
      title={isEdit ? "Edit Template" : "New Template"}
      onOk={handleSubmit}
      okButtonProps={{ disabled: loading }}
      width={680}
      destroyOnClose
    >
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <Input placeholder="Template name (as in Meta)" value={form.name} disabled={isEdit} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input placeholder="Language (e.g. en)" value={form.language} disabled={isEdit} onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))} />
          <Select
            value={form.category}
            onChange={(v) => setForm((f) => ({ ...f, category: v }))}
            options={["UTILITY", "MARKETING", "AUTHENTICATION"].map((v) => ({ label: v, value: v }))}
          />
        </div>

        <Select
          value={form.headerType}
          onChange={(v) => setForm((f) => ({ ...f, headerType: v }))}
          options={["none", "text", "image", "document"].map((v) => ({ label: `Header: ${v}`, value: v }))}
        />
        {form.headerType === "text" && (
          <Input placeholder="Header text" value={form.headerText} onChange={(e) => setForm((f) => ({ ...f, headerText: e.target.value }))} />
        )}

        <Input.TextArea
          placeholder="Body text — use {{1}}, {{2}}, ... for variables"
          value={form.bodyText}
          onChange={(e) => setForm((f) => ({ ...f, bodyText: e.target.value }))}
          rows={4}
        />
        <Input placeholder="Footer text (optional)" value={form.footerText} onChange={(e) => setForm((f) => ({ ...f, footerText: e.target.value }))} />

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Variables</span>
            <Button size="small" icon={<PlusOutlined />} onClick={addVariable}>
              Add variable
            </Button>
          </div>
          <Table dataSource={form.variables} columns={variableColumns} rowKey={(_r, i) => i} size="small" pagination={false} />
        </div>

        <div className="flex items-center gap-2">
          <Switch checked={form.active} onChange={(v) => setForm((f) => ({ ...f, active: v }))} />
          <span>Active</span>
        </div>
      </div>
    </Modal>
  );
}
