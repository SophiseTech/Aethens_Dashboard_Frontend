import { Badge } from "antd";
import useWhatsAppUnreadBadge from "@hooks/useWhatsAppUnreadBadge";

// Sidebar label for the WhatsApp inbox, with the unread-conversation count.
function WhatsAppInboxMenuLabel() {
  const count = useWhatsAppUnreadBadge();
  return (
    <span className="flex items-center justify-between gap-2">
      WhatsApp Inbox
      <Badge count={count} size="small" color="#25D366" overflowCount={99} />
    </span>
  );
}

export default WhatsAppInboxMenuLabel;
