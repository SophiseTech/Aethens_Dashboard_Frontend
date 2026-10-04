import { Modal, Typography } from 'antd';
import useForUserGuard from '@hooks/useForUserGuard';

const { Paragraph } = Typography;

export default function ForUserGuard() {
  const { showPrompt, accountName, dismiss, switchAccount } = useForUserGuard();

  return (
    <Modal
      open={showPrompt}
      title="Notification for another account"
      okText="Switch account"
      cancelText="Stay here"
      onOk={switchAccount}
      onCancel={dismiss}
      centered
    >
      <Paragraph>
        This notification is for <strong>{accountName}</strong>. Switch account?
      </Paragraph>
    </Modal>
  );
}
