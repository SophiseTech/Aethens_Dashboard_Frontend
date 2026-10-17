import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useStore } from "zustand";
import useWhatsAppInboxStore from "@stores/WhatsAppInboxStore";
import useVisiblePolling from "@hooks/useVisiblePolling";
import { formatWindowRemaining } from "@utils/whatsappInbox";

const THREAD_POLL_MS = 5 * 1000;
const CLOCK_TICK_MS = 30 * 1000;

// The open conversation: polling for new messages, marking them read, loading
// older history, keeping the view scrolled to the newest message, and the
// 24-hour reply window.
function useWhatsAppThread() {
  const activeId = useStore(useWhatsAppInboxStore, (s) => s.activeId);
  const thread = useStore(useWhatsAppInboxStore, (s) => s.thread);
  const threadLoading = useStore(useWhatsAppInboxStore, (s) => s.threadLoading);
  const olderLoading = useStore(useWhatsAppInboxStore, (s) => s.olderLoading);
  const refreshThread = useStore(useWhatsAppInboxStore, (s) => s.refreshThread);
  const loadOlderMessages = useStore(useWhatsAppInboxStore, (s) => s.loadOlderMessages);
  const markRead = useStore(useWhatsAppInboxStore, (s) => s.markRead);

  const [now, setNow] = useState(() => Date.now());
  const scrollRef = useRef(null);
  const lastMessageIdRef = useRef(null);

  useVisiblePolling(refreshThread, THREAD_POLL_MS, !!activeId);
  useVisiblePolling(() => setNow(Date.now()), CLOCK_TICK_MS, !!activeId);

  const { conversation, messages } = thread;

  useEffect(() => {
    if (conversation?._id && conversation.unreadCount > 0 && document.visibilityState === "visible") {
      markRead(conversation._id);
    }
  }, [conversation?._id, conversation?.unreadCount, markRead]);

  // Jump to the bottom when a newer message arrives, not when older ones load above.
  useLayoutEffect(() => {
    const newestId = messages[messages.length - 1]?._id || null;
    if (newestId && newestId !== lastMessageIdRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    lastMessageIdRef.current = newestId;
  }, [messages]);

  const loadOlder = async () => {
    const container = scrollRef.current;
    const previousHeight = container?.scrollHeight || 0;
    await loadOlderMessages();
    // Keep the message the user was looking at in place.
    if (container) container.scrollTop += container.scrollHeight - previousHeight;
  };

  const expiresAt = conversation?.windowExpiresAt ? new Date(conversation.windowExpiresAt).getTime() : 0;
  const windowOpen = expiresAt > now;

  return {
    activeId,
    conversation,
    messages,
    loading: threadLoading && !conversation,
    hasMore: thread.hasMore,
    olderLoading,
    loadOlder,
    scrollRef,
    windowOpen,
    windowRemaining: windowOpen ? formatWindowRemaining(expiresAt - now) : null,
  };
}

export default useWhatsAppThread;
