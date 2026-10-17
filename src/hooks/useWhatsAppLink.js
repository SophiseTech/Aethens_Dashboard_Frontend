import { useEffect, useMemo, useState } from "react";
import { useStore } from "zustand";
import useWhatsAppInboxStore from "@stores/WhatsAppInboxStore";
import useAlert from "@hooks/useAlert";

const SEARCH_DEBOUNCE_MS = 350;

// "Link to enquiry/student" for a number the server could not match by phone.
function useWhatsAppLink(open, onLinked) {
  const candidates = useStore(useWhatsAppInboxStore, (s) => s.linkCandidates);
  const loading = useStore(useWhatsAppInboxStore, (s) => s.linkCandidatesLoading);
  const fetchLinkCandidates = useStore(useWhatsAppInboxStore, (s) => s.fetchLinkCandidates);
  const clearLinkCandidates = useStore(useWhatsAppInboxStore, (s) => s.clearLinkCandidates);
  const linkConversation = useStore(useWhatsAppInboxStore, (s) => s.linkConversation);
  const alert = useAlert();

  const [search, setSearch] = useState("");
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    if (!open) {
      setSearch("");
      clearLinkCandidates();
    }
  }, [open, clearLinkCandidates]);

  useEffect(() => {
    const term = search.trim();
    if (term.length < 2) {
      clearLinkCandidates();
      return undefined;
    }
    const timer = setTimeout(() => fetchLinkCandidates(term), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search, fetchLinkCandidates, clearLinkCandidates]);

  const options = useMemo(
    () => [
      ...candidates.students.map((s) => ({
        key: `student:${s._id}`,
        payload: { studentId: s._id },
        type: "Student",
        title: s.username,
        subtitle: [s.phone, s.status !== "active" ? s.status : null].filter(Boolean).join(" · "),
      })),
      ...candidates.enquiries.map((e) => ({
        key: `enquiry:${e._id}`,
        payload: { enquiryId: e._id },
        type: "Enquiry",
        title: e.name,
        subtitle: [e.enquiryNumber ? `#${e.enquiryNumber}` : null, e.phoneNumber, e.stage].filter(Boolean).join(" · "),
      })),
    ],
    [candidates]
  );

  const link = async (option) => {
    setLinking(true);
    try {
      await linkConversation(option.payload);
      alert.success(`Linked to ${option.type.toLowerCase()} ${option.title}`);
      onLinked?.();
    } catch (error) {
      alert.error(error.message || "Failed to link conversation");
    } finally {
      setLinking(false);
    }
  };

  return { search, setSearch, options, loading, linking, link };
}

export default useWhatsAppLink;
