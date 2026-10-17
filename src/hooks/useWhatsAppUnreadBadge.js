import { useEffect } from "react";
import { useStore } from "zustand";
import useWhatsAppInboxStore from "@stores/WhatsAppInboxStore";
import useVisiblePolling from "@hooks/useVisiblePolling";

const BADGE_POLL_MS = 15 * 1000;

// Number of conversations with unread customer messages, for the sidebar badge.
function useWhatsAppUnreadBadge(enabled = true) {
  const count = useStore(useWhatsAppInboxStore, (s) => s.unread.conversations);
  const fetchUnread = useStore(useWhatsAppInboxStore, (s) => s.fetchUnread);

  useEffect(() => {
    if (enabled) fetchUnread();
  }, [enabled, fetchUnread]);

  useVisiblePolling(fetchUnread, BADGE_POLL_MS, enabled);

  return enabled ? count : 0;
}

export default useWhatsAppUnreadBadge;
