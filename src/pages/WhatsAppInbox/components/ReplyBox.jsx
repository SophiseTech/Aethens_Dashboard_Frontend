import PropTypes from "prop-types";
import { Alert, Button, Form, Input, Select, Typography } from "antd";
import { SendOutlined } from "@ant-design/icons";
import CustomInput from "@components/form/CustomInput";
import useWhatsAppReply from "@hooks/useWhatsAppReply";

const { Text } = Typography;

function ReplyBox({ conversationId, windowOpen, windowRemaining }) {
  const reply = useWhatsAppReply({ windowOpen, conversationId });

  if (!reply.templateMode) {
    return (
      <div className="border-t border-gray-200 p-3 flex flex-col gap-2 bg-white">
        <div className="flex items-center justify-between gap-2">
          <Text type="secondary" className="text-xs">
            Reply window open · {windowRemaining}
          </Text>
          <Button type="link" size="small" onClick={reply.showTemplates}>
            Send a template
          </Button>
        </div>
        <div className="flex items-end gap-2">
          <Input.TextArea
            autoSize={{ minRows: 1, maxRows: 6 }}
            maxLength={4096}
            placeholder="Type a message (Enter to send, Shift+Enter for a new line)"
            value={reply.text}
            onChange={(e) => reply.setText(e.target.value)}
            onKeyDown={reply.onTextKeyDown}
            disabled={reply.sending}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={reply.submitText}
            loading={reply.sending}
            disabled={!reply.text.trim()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 p-3 flex flex-col gap-2 bg-white max-h-[55%] overflow-y-auto">
      {reply.canUseText ? (
        <div className="flex justify-end">
          <Button type="link" size="small" onClick={reply.showText}>
            Back to free text
          </Button>
        </div>
      ) : (
        <Alert
          type="info"
          showIcon
          message="The 24-hour reply window is closed. WhatsApp only allows approved templates until the customer writes again."
        />
      )}
      <Select
        showSearch
        allowClear
        placeholder="Choose an approved template"
        options={reply.templateOptions}
        value={reply.selectedKey}
        onChange={reply.selectTemplate}
        loading={reply.templatesLoading}
        optionFilterProp="label"
        notFoundContent={reply.templatesLoading ? "Loading…" : "No approved templates"}
      />
      {reply.selectedKey ? (
        <Form key={reply.templateFormKey} form={reply.templateForm} layout="vertical" preserve={false}>
          {reply.templateVariables.map((variable) => (
            <CustomInput
              key={variable.index}
              name={`v${variable.index}`}
              label={`{{${variable.index}}} ${variable.name || ""}`.trim()}
              placeholder={variable.example}
              rules={[{ whitespace: true, message: "Cannot be blank" }]}
            />
          ))}
          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded whitespace-pre-wrap mb-2">
            {reply.templatePreview}
          </div>
          <Button type="primary" icon={<SendOutlined />} onClick={reply.submitTemplate} loading={reply.sending} block>
            Send template
          </Button>
        </Form>
      ) : null}
    </div>
  );
}

ReplyBox.propTypes = {
  conversationId: PropTypes.string.isRequired,
  windowOpen: PropTypes.bool,
  windowRemaining: PropTypes.string,
};

export default ReplyBox;
