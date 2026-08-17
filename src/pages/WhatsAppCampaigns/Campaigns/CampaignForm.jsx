import React, { useEffect, useMemo, useState } from "react";
import { Modal, Input, Select, DatePicker, message } from "antd";
import dayjs from "dayjs";
import useCampaignStore from "@/stores/CampaignStore";
import useWhatsAppTemplateStore from "@/stores/WhatsAppTemplateStore";
import useRecipientGroupStore from "@/stores/RecipientGroupStore";
import VariableMappingEditor from "./VariableMappingEditor";

const EMPTY_FORM = { name: "", description: "", template: "", recipientGroup: "", variableMapping: [], scheduledAt: null };

export default function CampaignForm() {
  const { modalOpen, setModalOpen, selected, create, loading } = useCampaignStore();
  const { templates, fetch: fetchTemplates } = useWhatsAppTemplateStore();
  const { groups, fetch: fetchGroups } = useRecipientGroupStore();

  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    fetchTemplates();
    fetchGroups();
  }, []);

  useEffect(() => {
    if (modalOpen) {
      setForm(
        selected
          ? {
              name: selected.name || "",
              description: selected.description || "",
              template: selected.template?._id || selected.template || "",
              recipientGroup: selected.recipientGroup?._id || selected.recipientGroup || "",
              variableMapping: selected.variableMapping || [],
              scheduledAt: selected.scheduledAt || null,
            }
          : EMPTY_FORM
      );
    }
  }, [modalOpen, selected]);

  const approvedTemplates = useMemo(() => templates.filter((t) => t.approvalStatus === "approved" && t.active), [templates]);
  const selectedTemplate = useMemo(() => templates.find((t) => t._id === form.template), [templates, form.template]);

  const handleTemplateChange = (templateId) => {
    const template = templates.find((t) => t._id === templateId);
    const mapping = (template?.variables || [])
      .slice()
      .sort((a, b) => a.index - b.index)
      .map((v) => ({ index: v.index, sourceType: "field", field: undefined, staticValue: "", fallbackValue: "" }));
    setForm((f) => ({ ...f, template: templateId, variableMapping: mapping }));
  };

  const handleSubmit = async () => {
    if (!form.name) return message.error("Name is required");
    if (!form.template) return message.error("Template is required");
    if (!form.recipientGroup) return message.error("Recipient group is required");
    try {
      await create({
        ...form,
        scheduledAt: form.scheduledAt ? dayjs(form.scheduledAt).toISOString() : null,
      });
      message.success("Campaign created as draft — queue it from the list when ready");
    } catch {
      message.error("Failed to create campaign");
    }
  };

  return (
    <Modal
      open={modalOpen}
      onCancel={() => setModalOpen(false)}
      title="New Campaign"
      onOk={handleSubmit}
      okButtonProps={{ disabled: loading }}
      width={720}
      destroyOnClose
    >
      <div className="space-y-3">
        <Input placeholder="Campaign name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <Input.TextArea
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={2}
        />

        <div className="grid grid-cols-2 gap-2">
          <Select
            placeholder="Approved template"
            value={form.template || undefined}
            onChange={handleTemplateChange}
            options={approvedTemplates.map((t) => ({ label: `${t.name} (${t.language})`, value: t._id }))}
          />
          <Select
            placeholder="Recipient group"
            value={form.recipientGroup || undefined}
            onChange={(v) => setForm((f) => ({ ...f, recipientGroup: v }))}
            options={groups.map((g) => ({ label: `${g.name} (${g.type})`, value: g._id }))}
          />
        </div>

        {selectedTemplate && (
          <div>
            <div className="text-sm font-medium mb-1">Variable mapping</div>
            <div className="text-xs text-gray-500 mb-2 bg-gray-50 p-2 rounded">{selectedTemplate.bodyText}</div>
            <VariableMappingEditor
              templateVariables={selectedTemplate.variables || []}
              mapping={form.variableMapping}
              onChange={(mapping) => setForm((f) => ({ ...f, variableMapping: mapping }))}
            />
          </div>
        )}

        <DatePicker
          showTime
          placeholder="Schedule for later (leave empty to send as soon as queued)"
          value={form.scheduledAt ? dayjs(form.scheduledAt) : null}
          onChange={(d) => setForm((f) => ({ ...f, scheduledAt: d ? d.toISOString() : null }))}
          style={{ width: "100%" }}
        />
      </div>
    </Modal>
  );
}
