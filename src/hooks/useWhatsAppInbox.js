import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useStore } from "zustand";
import useWhatsAppInboxStore from "@stores/WhatsAppInboxStore";
import useVisiblePolling from "@hooks/useVisiblePolling";
import useMediaQuery, { DESKTOP_QUERY } from "@hooks/useMediaQuery";

const LIST_POLL_MS = 15 * 1000;
const SEARCH_DEBOUNCE_MS = 400;

export const INBOX_FILTERS = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Reply window open", value: "open" },
];

// Page-level inbox state: the conversation list (filters, search, polling) and
// which conversation is open. The open conversation lives in the ?c= query param,
// so push notifications can deep-link to it.
function useWhatsAppInbox() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeId = searchParams.get("c");
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  const conversations = useStore(useWhatsAppInboxStore, (s) => s.conversations);
  const total = useStore(useWhatsAppInboxStore, (s) => s.total);
  const listLoading = useStore(useWhatsAppInboxStore, (s) => s.listLoading);
  const filter = useStore(useWhatsAppInboxStore, (s) => s.filter);
  const search = useStore(useWhatsAppInboxStore, (s) => s.search);
  const fetchConversations = useStore(useWhatsAppInboxStore, (s) => s.fetchConversations);
  const fetchUnread = useStore(useWhatsAppInboxStore, (s) => s.fetchUnread);
  const setFilter = useStore(useWhatsAppInboxStore, (s) => s.setFilter);
  const setSearch = useStore(useWhatsAppInboxStore, (s) => s.setSearch);
  const loadMoreConversations = useStore(useWhatsAppInboxStore, (s) => s.loadMoreConversations);
  const openConversation = useStore(useWhatsAppInboxStore, (s) => s.openConversation);

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    fetchConversations();
    fetchUnread();
  }, [fetchConversations, fetchUnread]);

  useEffect(() => {
    if (searchInput === search) return undefined;
    const timer = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput, search, setSearch]);

  useEffect(() => {
    openConversation(activeId);
  }, [activeId, openConversation]);

  // Leaving the page closes the thread, so coming back always loads it fresh.
  useEffect(() => () => openConversation(null), [openConversation]);

  useVisiblePolling(() => {
    fetchConversations({ silent: true });
    fetchUnread();
  }, LIST_POLL_MS);

  const selectConversation = useCallback(
    (conversationId) => setSearchParams(conversationId ? { c: conversationId } : {}),
    [setSearchParams]
  );

  return {
    conversations,
    total,
    listLoading,
    hasMore: conversations.length < total,
    loadMore: loadMoreConversations,
    filter,
    setFilter,
    searchInput,
    setSearchInput,
    activeId,
    selectConversation,
    closeConversation: () => selectConversation(null),
    // Phones show the list or the open chat, never both.
    showList: isDesktop || !activeId,
    showThread: isDesktop || !!activeId,
    isDesktop,
  };
}

export default useWhatsAppInbox;
