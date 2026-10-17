import { useState } from "react";
import { useStore } from "zustand";
import enquiryStore from "@stores/EnquiryStore";

// Opens the existing EnquiryDetailsDrawer for an enquiry known only by id.
function useLinkedEnquiryDrawer() {
  const getEnquiryDetails = useStore(enquiryStore, (s) => s.getEnquiryDetails);
  const [enquiry, setEnquiry] = useState(null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async (enquiryId) => {
    const details = await getEnquiryDetails(enquiryId);
    if (details) setEnquiry(details);
    return details;
  };

  const open = async (enquiryId) => {
    setLoading(true);
    try {
      if (await load(enquiryId)) setVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return {
    enquiry,
    visible,
    loading,
    open,
    close: () => setVisible(false),
    // The drawer calls this after edits; reload so it shows the saved values.
    refetch: () => (enquiry?._id ? load(enquiry._id) : undefined),
  };
}

export default useLinkedEnquiryDrawer;
