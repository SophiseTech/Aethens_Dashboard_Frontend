import PropTypes from "prop-types";
import { useState } from "react";
import { Button, Empty, Spin, Tag, Typography } from "antd";
import { ArrowLeftOutlined, LinkOutlined, ProfileOutlined } from "@ant-design/icons";
import useWhatsAppThread from "@hooks/useWhatsAppThread";
import useLinkedEnquiryDrawer from "@hooks/useLinkedEnquiryDrawer";
import { conversationLinkTag } from "@utils/whatsappInbox";
import EnquiryDetailsDrawer from "@pages/Enquiries/Component/EnquiryDetailsDrawer";
import MessageList from "./MessageList";
import ReplyBox from "./ReplyBox";
import LinkConversationModal from "./LinkConversationModal";

const { Text, Title } = Typography;

function ChatThread({ onBack }) {
  const thread = useWhatsAppThread();
  const enquiryDrawer = useLinkedEnquiryDrawer();
  const [linkOpen, setLinkOpen] = useState(false);
  const { conversation } = thread;

  if (!thread.activeId) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <Empty description="Select a conversation" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    );
  }

  if (thread.loading || !conversation) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spin />
      </div>
    );
  }

  const tag = conversationLinkTag(conversation);
  const linked = conversation.enquiry || conversation.student;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-white">
        {onBack ? <Button type="text" icon={<ArrowLeftOutlined />} onClick={onBack} aria-label="Back" /> : null}
        <div className="flex-1 min-w-0">
          <Title level={5} className="!mb-0" ellipsis>
            {conversation.displayName}
          </Title>
          <div className="flex items-center gap-1 flex-wrap">
            <Text type="secondary" className="text-xs">
              {conversation.phone}
            </Text>
            {conversation.profileName && conversation.profileName !== conversation.displayName ? (
              <Text type="secondary" className="text-xs">
                · WhatsApp name: {conversation.profileName}
              </Text>
            ) : null}
            <Tag color={tag.color} className="!mr-0 text-xs">
              {tag.label}
            </Tag>
            {conversation.center_id?.center_name ? (
              <Tag className="!mr-0 text-xs">{conversation.center_id.center_name}</Tag>
            ) : null}
          </div>
        </div>
        {conversation.enquiry ? (
          <Button
            size="small"
            icon={<ProfileOutlined />}
            loading={enquiryDrawer.loading}
            onClick={() => enquiryDrawer.open(conversation.enquiry._id)}
          >
            Enquiry
          </Button>
        ) : null}
        <Button size="small" icon={<LinkOutlined />} onClick={() => setLinkOpen(true)}>
          {linked ? "Change link" : "Link"}
        </Button>
      </div>

      <MessageList
        ref={thread.scrollRef}
        className="flex-1 min-h-0"
        messages={thread.messages}
        hasMore={thread.hasMore}
        olderLoading={thread.olderLoading}
        onLoadOlder={thread.loadOlder}
        emptyText="No messages yet"
      />

      <ReplyBox
        conversationId={conversation._id}
        windowOpen={thread.windowOpen}
        windowRemaining={thread.windowRemaining}
      />

      <LinkConversationModal open={linkOpen} onClose={() => setLinkOpen(false)} phone={conversation.phone} />
      {enquiryDrawer.enquiry ? (
        <EnquiryDetailsDrawer
          enquiry={enquiryDrawer.enquiry}
          visible={enquiryDrawer.visible}
          onClose={enquiryDrawer.close}
          parentPage="whatsappInbox"
          fetchEnquiries={enquiryDrawer.refetch}
        />
      ) : null}
    </div>
  );
}

ChatThread.propTypes = {
  onBack: PropTypes.func,
};

export default ChatThread;
