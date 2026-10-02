import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Modal, Switch, Checkbox, Button, Alert, Spin, message, Typography, Divider, Space } from 'antd';
import { BellOutlined, SettingOutlined } from '@ant-design/icons';
import pushNotificationService from '@services/PushNotificationService';

const { Text, Paragraph } = Typography;

const NOTIFICATION_TYPE_OPTIONS = [
  { label: 'Fee Payment', value: 'fee_payment' },
  { label: 'Slot Request', value: 'slot_request' },
  { label: 'Enquiry', value: 'enquiry' },
  { label: 'Student Deactivation', value: 'student_deactivation' },
  { label: 'Final Project', value: 'final_project' },
  { label: 'Holiday', value: 'holiday' },
  { label: 'Upcoming Class Reminder', value: 'class_reminder' },
  { label: 'Test Notification', value: 'test' },
];

export default function PushNotificationSettingsModal({ open, onClose, isAdmin }) {
  const [isSupported, setIsSupported] = useState(true);
  const [permission, setPermission] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [testingPush, setTestingPush] = useState(false);

  const [adminConfig, setAdminConfig] = useState([]);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  const checkStatus = useCallback(async () => {
    const supported = pushNotificationService.isPushSupported();
    setIsSupported(supported);

    if (!supported) return;

    const perm = pushNotificationService.getPermissionState();
    setPermission(perm);

    try {
      const active = await pushNotificationService.checkDeviceSubscription();
      setIsSubscribed(active);
    } catch {
      setIsSubscribed(false);
    }
  }, []);

  const fetchConfig = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingConfig(true);
    try {
      const data = await pushNotificationService.getPushConfig();
      if (data?.enabledTypes) {
        setAdminConfig(data.enabledTypes);
      }
    } catch {
      message.error('Failed to load push notification settings');
    } finally {
      setLoadingConfig(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (open) {
      checkStatus();
      if (isAdmin) {
        fetchConfig();
      }
    }
  }, [open, checkStatus, fetchConfig, isAdmin]);

  const handleToggleSubscription = async (checked) => {
    setSubscribing(true);
    try {
      if (checked) {
        await pushNotificationService.subscribeDevice();
        setIsSubscribed(true);
        setPermission('granted');
        message.success('Push notifications enabled for this device');
      } else {
        await pushNotificationService.unsubscribeDevice();
        setIsSubscribed(false);
        message.info('Push notifications disabled for this device');
      }
    } catch (err) {
      message.error(err.message || 'Failed to update push subscription');
      const perm = pushNotificationService.getPermissionState();
      setPermission(perm);
    } finally {
      setSubscribing(false);
    }
  };

  const handleSendTestNotification = async () => {
    setTestingPush(true);
    try {
      const res = await pushNotificationService.sendTestNotification({
        message: 'This is a test notification from Aethens Dashboard!',
        type: 'test',
        title: 'Test Notification',
      });
      const pushResult = res?.notification?.pushResult || res?.pushResult;
      if (pushResult && pushResult.successful > 0) {
        message.success(`Test push notification delivered to ${pushResult.successful} device(s)!`);
      } else {
        message.success('Test notification created successfully!');
      }
    } catch (err) {
      message.error(err.message || 'Failed to send test push notification');
    } finally {
      setTestingPush(false);
    }
  };

  const handleSaveAdminConfig = async () => {
    setSavingConfig(true);
    try {
      await pushNotificationService.updatePushConfig(adminConfig);
      message.success('Push notification configuration saved');
    } catch {
      message.error('Failed to save push notification configuration');
    } finally {
      setSavingConfig(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <BellOutlined className="text-primary text-lg" />
          <span>Push Notification Settings</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose} style={{ minHeight: '44px', minWidth: '80px' }}>
          Close
        </Button>,
      ]}
      width={560}
    >
      <div className="py-2 space-y-4">
        <div>
          <Text strong className="text-base">Device Notifications</Text>
          <Paragraph type="secondary" className="mb-3 text-xs">
            Receive real-time push alerts on this device even when the browser or app is in the background.
          </Paragraph>

          {!isSupported ? (
            <Alert
              type="warning"
              showIcon
              message="Push Notifications Unavailable"
              description="This browser or platform does not support Web Push. On iOS devices, please add this app to your Home Screen first."
              className="mb-3"
            />
          ) : permission === 'denied' ? (
            <Alert
              type="error"
              showIcon
              message="Notification Permission Blocked"
              description="Notifications are blocked in your browser settings. Please allow notifications in your browser's site settings to enable push alerts."
              className="mb-3"
            />
          ) : (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <Space direction="vertical" size={2}>
                <Text strong>Enable on this device</Text>
                <Text type="secondary" className="text-xs">
                  {isSubscribed ? 'Notifications are active on this browser' : 'Turn on to receive instant alerts'}
                </Text>
              </Space>
              <Switch
                checked={isSubscribed}
                loading={subscribing}
                onChange={handleToggleSubscription}
                style={{ minWidth: '44px', minHeight: '22px' }}
              />
            </div>
          )}
          {isAdmin && isSubscribed && (
            <div className="mt-2 flex justify-end">
              <Button
                size="small"
                loading={testingPush}
                onClick={handleSendTestNotification}
                style={{ minHeight: '36px' }}
              >
                Send Test Notification
              </Button>
            </div>
          )}
        </div>

        {isAdmin && (
          <>
            <Divider className="my-3" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <SettingOutlined className="text-primary" />
                <Text strong className="text-base">Global Push Eligibility (Admin)</Text>
              </div>
              <Paragraph type="secondary" className="mb-3 text-xs">
                Select which notification types are delivered as push notifications across all users.
              </Paragraph>

              {loadingConfig ? (
                <div className="py-4 text-center">
                  <Spin size="small" />
                </div>
              ) : (
                <div className="space-y-4">
                  <Checkbox.Group
                    className="grid grid-cols-2 gap-3"
                    options={NOTIFICATION_TYPE_OPTIONS}
                    value={adminConfig}
                    onChange={setAdminConfig}
                  />

                  <div className="flex justify-end pt-2">
                    <Button
                      type="primary"
                      loading={savingConfig}
                      onClick={handleSaveAdminConfig}
                      style={{ minHeight: '44px', minWidth: '120px' }}
                    >
                      Save Configuration
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

PushNotificationSettingsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool,
};
