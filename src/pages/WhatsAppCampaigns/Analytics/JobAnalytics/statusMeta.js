// WhatsApp message-status -> Ant Tag colour. No shared helper exists elsewhere.
export const MESSAGE_STATUS_COLORS = {
  queued: "default",
  sent: "cyan",
  delivered: "blue",
  read: "green",
  failed: "red",
  undeliverable: "red",
};

export const MESSAGE_STATUSES = ["queued", "sent", "delivered", "read", "failed", "undeliverable"];

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
