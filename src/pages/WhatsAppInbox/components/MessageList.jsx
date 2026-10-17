import PropTypes from "prop-types";
import { forwardRef } from "react";
import { Button, Empty, Spin } from "antd";
import MessageBubble from "./MessageBubble";

// Oldest-first message list with a "load earlier" button. Shared by the inbox
// thread and the enquiry's read-only WhatsApp history.
const MessageList = forwardRef(function MessageList(
  { messages, loading, hasMore, olderLoading, onLoadOlder, emptyText, className = "" },
  ref
) {
  return (
    <div ref={ref} className={`overflow-y-auto bg-[#efeae2] p-3 flex flex-col gap-2 ${className}`}>
      {hasMore ? (
        <div className="text-center">
          <Button size="small" onClick={onLoadOlder} loading={olderLoading}>
            Load earlier messages
          </Button>
        </div>
      ) : null}
      {loading ? (
        <div className="flex justify-center py-10">
          <Spin />
        </div>
      ) : null}
      {!loading && !messages.length ? (
        <Empty className="py-10" description={emptyText} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : null}
      {messages.map((message) => (
        <MessageBubble key={`${message.direction}-${message._id}`} message={message} />
      ))}
    </div>
  );
});

MessageList.propTypes = {
  messages: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  hasMore: PropTypes.bool,
  olderLoading: PropTypes.bool,
  onLoadOlder: PropTypes.func.isRequired,
  emptyText: PropTypes.string,
  className: PropTypes.string,
};

export default MessageList;
