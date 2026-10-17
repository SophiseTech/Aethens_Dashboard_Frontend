import { useCallback, useEffect, useState } from "react";
import { useStore } from "zustand";
import useWhatsAppInboxStore from "@stores/WhatsAppInboxStore";
import useAlert from "@hooks/useAlert";

// Signed S3 link for a customer's image/voice note/document. Images and audio
// load right away so they render inline; documents only when opened.
function useWhatsAppMedia(message) {
  const resolveMediaUrl = useStore(useWhatsAppInboxStore, (s) => s.resolveMediaUrl);
  const alert = useAlert();
  const media = message.media;
  const isInbound = message.direction === "inbound";
  const autoLoad = isInbound && ["image", "sticker", "audio", "video"].includes(media?.kind);

  const [url, setUrl] = useState(isInbound ? null : media?.url || null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await resolveMediaUrl(message._id);
      setUrl(data.url);
      setError(null);
      return data.url;
    } catch (err) {
      setError(err.message || "Could not load the file");
      return null;
    } finally {
      setLoading(false);
    }
  }, [message._id, resolveMediaUrl]);

  useEffect(() => {
    // "pending" means the S3 copy is still running; the next thread poll updates it.
    if (autoLoad && media?.status === "stored" && !url) load();
  }, [autoLoad, media?.status, url, load]);

  const open = async () => {
    // Open the tab during the click, before awaiting the link, so popup blockers allow it.
    const tab = window.open("", "_blank");
    if (tab) tab.opener = null;
    const link = isInbound ? await load() : url;
    if (link && tab) tab.location.href = link;
    else if (link) window.location.href = link;
    else {
      tab?.close();
      alert.error("This file could not be downloaded from WhatsApp. It may have expired.");
    }
  };

  return {
    media,
    url,
    error,
    loading,
    // The server could not copy it from WhatsApp; opening it retries once.
    failed: isInbound && media?.status === "failed" && !url,
    pending: isInbound && media?.status === "pending",
    open,
  };
}

export default useWhatsAppMedia;
