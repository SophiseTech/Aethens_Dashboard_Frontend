import PropTypes from "prop-types";
import { Alert, Button, Modal, Typography } from "antd";
import useEnquiryWhatsAppHistory from "@hooks/useEnquiryWhatsAppHistory";
import MessageList from "./MessageList";

const { Text } = Typography;

// Read-only WhatsApp history for an enquiry, opened from the enquiry drawer.
function EnquiryWhatsAppHistoryModal({ enquiryId, open, onClose }) {
  const history = useEnquiryWhatsAppHistory(enquiryId, open);

  return (
    <Modal
      title="WhatsApp history"
      open={open}
      onCancel={onClose}
      width={560}
      destroyOnClose
      footer={
        history.conversationId ? (
          <Button type="primary" onClick={history.openInInbox}>
            Open in inbox
          </Button>
        ) : null
      }
    >
      {history.phone ? (
        <Text type="secondary" className="block mb-2 text-xs">
          Everything sent to {history.phone}
          {history.conversationId ? ", and the customer's replies." : ". The customer hasn't written in yet."}
        </Text>
      ) : null}
      {history.error ? (
        <Alert type="error" message={history.error} />
      ) : (
        <MessageList
          ref={history.scrollRef}
          className="h-[60vh] rounded"
          messages={history.messages}
          loading={history.loading}
          hasMore={history.hasMore}
          olderLoading={history.olderLoading}
          onLoadOlder={history.loadOlder}
          emptyText="No WhatsApp messages for this number"
        />
      )}
    </Modal>
  );
}

EnquiryWhatsAppHistoryModal.propTypes = {
  enquiryId: PropTypes.string,
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
};

export default EnquiryWhatsAppHistoryModal;
