import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "zustand";
import useWhatsAppInboxStore from "@stores/WhatsAppInboxStore";

// Read-only WhatsApp history for one enquiry: everything the CRM sent to its
// phone, plus the customer's messages once they have written in.
function useEnquiryWhatsAppHistory(enquiryId, open) {
  const history = useStore(useWhatsAppInboxStore, (s) => s.history);
  const loading = useStore(useWhatsAppInboxStore, (s) => s.historyLoading);
  const olderLoading = useStore(useWhatsAppInboxStore, (s) => s.olderLoading);
  const fetchEnquiryHistory = useStore(useWhatsAppInboxStore, (s) => s.fetchEnquiryHistory);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!open || !enquiryId) return;
    setError(null);
    fetchEnquiryHistory(enquiryId).catch((err) => setError(err.message || "Could not load WhatsApp history"));
  }, [open, enquiryId, fetchEnquiryHistory]);

  // Start at the newest message once the first page has loaded.
  useLayoutEffect(() => {
    if (!loading && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [loading]);

  const conversationId = history.conversation?._id || null;

  return {
    messages: history.messages,
    phone: history.phone,
    loading,
    error,
    scrollRef,
    hasMore: history.hasMore,
    olderLoading,
    loadOlder: () => fetchEnquiryHistory(enquiryId, { older: true }).catch(() => {}),
    conversationId,
    openInInbox: () => conversationId && navigate(`/manager/whatsapp-inbox?c=${conversationId}`),
  };
}

export default useEnquiryWhatsAppHistory;
