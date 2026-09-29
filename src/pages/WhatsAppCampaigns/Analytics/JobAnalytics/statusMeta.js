// Re-exported for existing importers — the canonical source is now the shared util
// so non-campaign UI (e.g. the Enquiry drawer) can reuse the same colour map.
export { MESSAGE_STATUS_COLORS, MESSAGE_STATUSES } from "@utils/whatsappMessageStatus";

// JobRun.status -> Ant Tag colour.
export const RUN_STATUS_COLORS = {
  running: "processing",
  success: "green",
  error: "red",
};

export function formatDuration(ms) {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms} ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)} s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${Math.round(seconds % 60)}s`;
}
