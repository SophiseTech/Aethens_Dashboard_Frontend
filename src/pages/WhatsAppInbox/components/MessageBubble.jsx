import PropTypes from "prop-types";
import { Tag, Tooltip, Typography } from "antd";
import { MESSAGE_STATUS_COLORS } from "@utils/whatsappMessageStatus";
import { formatMessageTime } from "@utils/whatsappInbox";
import MessageMedia from "./MessageMedia";

const { Text } = Typography;

function MessageBubble({ message }) {
  const outbound = message.direction === "outbound";
  return (
    <div className={`flex ${outbound ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] lg:max-w-[70%] rounded-lg px-3 py-2 shadow-sm flex flex-col gap-1 ${
          outbound ? "bg-[#d9fdd3]" : "bg-white"
        }`}
      >
        {message.templateName ? (
          <div>
            <Tag color="purple" className="!mr-0 text-xs">
              Template: {message.templateName}
            </Tag>
          </div>
        ) : null}
        {message.media ? <MessageMedia message={message} /> : null}
        {message.text ? <div className="whitespace-pre-wrap break-words text-sm">{message.text}</div> : null}
        <div className="flex items-center justify-end gap-2 flex-wrap">
          {outbound ? (
            <Text type="secondary" className="text-[11px]">
              {message.sentBy || (message.automated ? "Automated" : "")}
            </Text>
          ) : null}
          <Text type="secondary" className="text-[11px]">
            {formatMessageTime(message.at)}
          </Text>
          {outbound && message.status ? (
            <Tooltip title={message.errorMessage || undefined}>
              <Tag color={MESSAGE_STATUS_COLORS[message.status]} className="!mr-0 text-[11px] leading-4">
                {message.status}
              </Tag>
            </Tooltip>
          ) : null}
        </div>
      </div>
    </div>
  );
}

MessageBubble.propTypes = {
  message: PropTypes.object.isRequired,
};

export default MessageBubble;
