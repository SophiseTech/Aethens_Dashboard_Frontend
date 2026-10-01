import { useState } from 'react';
import { Modal, Checkbox, Button, message } from 'antd';
import { BellOutlined, CalendarOutlined, DollarOutlined, NotificationOutlined } from '@ant-design/icons';
import usePushPrompt from '@hooks/usePushPrompt';

export default function PushPromptModal() {
  const { showPrompt, loading, dismiss, subscribe } = usePushPrompt();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!showPrompt) return null;

  const handleCancel = () => {
    dismiss(dontShowAgain);
  };

  const handleSubscribe = async () => {
    const res = await subscribe();
    if (res.success) {
      message.success('Push notifications successfully enabled!');
    } else if (res.error) {
      message.error(res.error);
    }
  };

  return (
    <Modal
      open={showPrompt}
      onCancel={handleCancel}
      centered
      width={480}
      title={
        <div className="flex items-center gap-2 text-base font-semibold text-gray-800">
          <span className="p-1.5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
            <BellOutlined className="text-base" />
          </span>
          <span>Never Miss an Important Update</span>
        </div>
      }
      footer={[
        <div key="footer" className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
          <Checkbox
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="text-xs text-gray-500 self-start sm:self-center"
          >
            Don&apos;t ask me again
          </Checkbox>
          <div className="flex items-center gap-2 self-end sm:self-center">
            <Button onClick={handleCancel} disabled={loading}>
              Maybe Later
            </Button>
            <Button
              type="primary"
              onClick={handleSubscribe}
              loading={loading}
              className="bg-primary hover:bg-primary-dark"
            >
              Enable Notifications
            </Button>
          </div>
        </div>,
      ]}
    >
      <div className="py-2 text-[13px] text-gray-600 space-y-3 leading-relaxed">
        <p>
          Enable push notifications on this device to receive real-time alerts even when the dashboard tab is closed:
        </p>

        <div className="space-y-2 bg-gray-50 rounded-lg p-3 border border-gray-100">
          <div className="flex items-start gap-2.5">
            <CalendarOutlined className="text-primary mt-0.5 text-sm" />
            <span><strong>Batch & Class Schedules:</strong> Instant updates about rescheduled sessions and timings.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <DollarOutlined className="text-green-600 mt-0.5 text-sm" />
            <span><strong>Billing & Receipts:</strong> Prompt fee receipts and payment status confirmations.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <NotificationOutlined className="text-indigo-500 mt-0.5 text-sm" />
            <span><strong>Academy Announcements:</strong> Crucial circulars, workshop alerts, and holiday notices.</span>
          </div>
        </div>

        <p className="text-xs text-gray-400">
          You can customize notification preferences or unsubscribe anytime via the bell icon settings.
        </p>
      </div>
    </Modal>
  );
}
