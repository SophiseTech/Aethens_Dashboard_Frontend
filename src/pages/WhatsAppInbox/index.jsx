import Title from "@components/layouts/Title";
import useWhatsAppInbox from "@hooks/useWhatsAppInbox";
import ConversationList from "./components/ConversationList";
import ChatThread from "./components/ChatThread";

export default function WhatsAppInboxPage() {
  const inbox = useWhatsAppInbox();

  return (
    <Title title="WhatsApp Inbox">
      <div className="flex-1 min-h-0 flex bg-white rounded-lg shadow-sm overflow-hidden h-[calc(100vh-8rem)]">
        {inbox.showList ? (
          <div className="w-full lg:w-[340px] lg:shrink-0 lg:border-r border-gray-200 min-h-0">
            <ConversationList
              conversations={inbox.conversations}
              loading={inbox.listLoading}
              hasMore={inbox.hasMore}
              onLoadMore={inbox.loadMore}
              filter={inbox.filter}
              onFilterChange={inbox.setFilter}
              searchInput={inbox.searchInput}
              onSearchChange={inbox.setSearchInput}
              activeId={inbox.activeId}
              onSelect={inbox.selectConversation}
            />
          </div>
        ) : null}
        {inbox.showThread ? (
          <div className="flex-1 min-w-0 min-h-0">
            <ChatThread onBack={inbox.isDesktop ? undefined : inbox.closeConversation} />
          </div>
        ) : null}
      </div>
    </Title>
  );
}
