// WhatsApp message-status -> Ant Tag colour. Shared by any UI that shows a
// WhatsAppMessage's delivery status (Campaign job analytics, Enquiry drawer, etc).
export const MESSAGE_STATUS_COLORS = {
  queued: "default",
  sent: "cyan",
  delivered: "blue",
  read: "green",
  failed: "red",
  undeliverable: "red",
};

export const MESSAGE_STATUSES = ["queued", "sent", "delivered", "read", "failed", "undeliverable"];
