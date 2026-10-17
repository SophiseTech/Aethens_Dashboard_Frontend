import { useEffect, useMemo, useState } from "react";
import { Form } from "antd";
import { useStore } from "zustand";
import useWhatsAppInboxStore from "@stores/WhatsAppInboxStore";
import useWhatsAppTemplateStore from "@stores/WhatsAppTemplateStore";
import useAlert from "@hooks/useAlert";
import { isSendableTemplate, substituteTemplate } from "@utils/whatsappTemplate";

const templateKey = (template) => `${template.name}:${template.language}`;
const NO_VALUES = {};

// The reply box: free text while the 24-hour window is open, otherwise (or on
// request) an approved template with its variables filled in.
function useWhatsAppReply({ windowOpen, conversationId }) {
  const sending = useStore(useWhatsAppInboxStore, (s) => s.sending);
  const sendReply = useStore(useWhatsAppInboxStore, (s) => s.sendReply);
  const sendTemplate = useStore(useWhatsAppInboxStore, (s) => s.sendTemplate);
  const templates = useStore(useWhatsAppTemplateStore, (s) => s.templates);
  const templatesLoading = useStore(useWhatsAppTemplateStore, (s) => s.loading);
  const fetchTemplates = useStore(useWhatsAppTemplateStore, (s) => s.fetch);
  const alert = useAlert();
  const [templateForm] = Form.useForm();

  const [text, setText] = useState("");
  const [templateMode, setTemplateMode] = useState(!windowOpen);
  const [selectedKey, setSelectedKey] = useState(null);
  const variableValues = Form.useWatch((values) => values, templateForm) || NO_VALUES;

  // Each conversation starts in the mode its window allows, with an empty draft.
  // The variables form is keyed by conversation + template (templateFormKey), so
  // switching either remounts it empty.
  useEffect(() => {
    setText("");
    setSelectedKey(null);
  }, [conversationId]);

  useEffect(() => {
    setTemplateMode(!windowOpen);
  }, [windowOpen, conversationId]);

  useEffect(() => {
    if (templateMode && !templates.length) fetchTemplates();
  }, [templateMode, templates.length, fetchTemplates]);

  const sendableTemplates = useMemo(() => templates.filter(isSendableTemplate), [templates]);
  const templateOptions = useMemo(
    () => sendableTemplates.map((t) => ({ value: templateKey(t), label: `${t.name} (${t.language})` })),
    [sendableTemplates]
  );
  const selectedTemplate = sendableTemplates.find((t) => templateKey(t) === selectedKey) || null;
  const templateVariables = useMemo(
    () => [...(selectedTemplate?.variables || [])].sort((a, b) => a.index - b.index),
    [selectedTemplate]
  );

  const templatePreview = useMemo(() => {
    if (!selectedTemplate) return "";
    const values = {};
    for (const variable of templateVariables) {
      const value = variableValues[`v${variable.index}`];
      if (value) values[variable.index] = value;
    }
    return substituteTemplate(selectedTemplate.bodyText, values);
  }, [selectedTemplate, templateVariables, variableValues]);

  const selectTemplate = (key) => setSelectedKey(key);

  const submitText = async () => {
    const body = text.trim();
    if (!body || sending) return;
    try {
      await sendReply(body);
      setText("");
    } catch (error) {
      alert.error(error.message || "Failed to send message");
    }
  };

  // Enter sends; Shift+Enter adds a new line.
  const onTextKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitText();
    }
  };

  const submitTemplate = async () => {
    if (!selectedTemplate || sending) return;
    const values = await templateForm.validateFields();
    const variables = {};
    for (const variable of templateVariables) variables[variable.index] = values[`v${variable.index}`]?.trim();
    try {
      await sendTemplate({ templateName: selectedTemplate.name, language: selectedTemplate.language, variables });
      alert.success("Template sent");
      selectTemplate(null);
    } catch (error) {
      alert.error(error.message || "Failed to send template");
    }
  };

  return {
    sending,
    text,
    setText,
    onTextKeyDown,
    submitText,
    templateMode,
    // Templates are always allowed; free text only inside the window.
    canUseText: windowOpen,
    showTemplates: () => setTemplateMode(true),
    showText: () => windowOpen && setTemplateMode(false),
    templateForm,
    templateFormKey: `${conversationId}:${selectedKey}`,
    templateOptions,
    templatesLoading,
    selectedKey,
    selectTemplate,
    templateVariables,
    templatePreview,
    submitTemplate,
  };
}

export default useWhatsAppReply;
