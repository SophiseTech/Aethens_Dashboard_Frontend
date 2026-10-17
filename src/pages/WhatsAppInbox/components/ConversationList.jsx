import PropTypes from "prop-types";
import { Badge, Button, Empty, Input, Segmented, Spin, Tag, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { INBOX_FILTERS } from "@hooks/useWhatsAppInbox";
import { conversationLinkTag, formatListTime } from "@utils/whatsappInbox";

const { Text } = Typography;

function ConversationRow({ conversation, active, onSelect }) {
  const tag = conversationLinkTag(conversation);
  const unread = conversation.unreadCount > 0;
  return (
    <button
      type="button"
      onClick={() => onSelect(conversation._id)}
      className={`w-full text-left px-3 py-3 border-b border-gray-100 flex flex-col gap-1 transition-colors ${
        active ? "bg-green-50" : "hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        {conversation.windowOpen ? (
          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" title="Reply window open" />
        ) : null}
        <Text strong={unread} ellipsis className="flex-1 min-w-0">
          {conversation.displayName}
        </Text>
        <Text type="secondary" className="text-xs shrink-0">
          {formatListTime(conversation.lastMessageAt)}
        </Text>
      </div>
      <div className="flex items-center gap-2 min-w-0">
        <Text type={unread ? undefined : "secondary"} ellipsis className="flex-1 min-w-0 text-sm">
          {conversation.lastMessageDirection === "outbound" ? "You: " : ""}
          {conversation.lastMessagePreview}
        </Text>
        {unread ? <Badge count={conversation.unreadCount} color="#25D366" /> : null}
      </div>
      <div className="flex items-center gap-1 flex-wrap">
        <Tag color={tag.color} className="!mr-0 text-xs">
          {tag.label}
        </Tag>
        {conversation.center_id?.center_name ? (
          <Tag className="!mr-0 text-xs">{conversation.center_id.center_name}</Tag>
        ) : null}
        {conversation.displayName !== conversation.phone ? (
          <Text type="secondary" className="text-xs">
            {conversation.phone}
          </Text>
        ) : null}
      </div>
    </button>
  );
}

ConversationRow.propTypes = {
  conversation: PropTypes.object.isRequired,
  active: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
};

function ConversationList({
  conversations,
  loading,
  hasMore,
  onLoadMore,
  filter,
  onFilterChange,
  searchInput,
  onSearchChange,
  activeId,
  onSelect,
}) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="p-3 flex flex-col gap-2 border-b border-gray-100">
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Search name or phone"
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <Segmented block size="small" options={INBOX_FILTERS} value={filter} onChange={onFilterChange} />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto">
        {loading && !conversations.length ? (
          <div className="flex justify-center py-10">
            <Spin />
          </div>
        ) : null}
        {!loading && !conversations.length ? (
          <Empty className="py-10" description="No conversations yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : null}
        {conversations.map((conversation) => (
          <ConversationRow
            key={conversation._id}
            conversation={conversation}
            active={conversation._id === activeId}
            onSelect={onSelect}
          />
        ))}
        {hasMore ? (
          <div className="p-3 text-center">
            <Button size="small" onClick={onLoadMore} loading={loading}>
              Load more
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

ConversationList.propTypes = {
  conversations: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  hasMore: PropTypes.bool,
  onLoadMore: PropTypes.func.isRequired,
  filter: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  searchInput: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  activeId: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
};

export default ConversationList;
