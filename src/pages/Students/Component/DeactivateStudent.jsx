import React from 'react';
import { Button, Modal } from 'antd';
import studentStore from '@stores/StudentStore';
import { isUserActive } from '@utils/helper';

const DeactivateStudent = ({ student }) => {
  const deactivateStudent = studentStore((state) => state.deactivateStudent);
  const activateStudent = studentStore((state) => state.activateStudent);
  const [cardReturned, setCardReturned] = React.useState(false);

  const handleDeactivateStudent = async () => {
    try {
      await deactivateStudent(student._id, cardReturned);
    } catch (error) {
      console.error('Error deactivating user:', error);
    }
  }

  const handleActivateStudent = async () => {
    try {
      await activateStudent(student._id);
    } catch (error) {
      console.error('Error deactivating user:', error);
    }
  }

  const showConfirm = ({ message, action, isDeactivating }) => {
    Modal.confirm({
      title: message,
      content: isDeactivating ? (
        <div style={{ marginTop: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              style={{ width: '16px', height: '16px' }}
              onChange={(e) => setCardReturned(e.target.checked)}
            />
            <span style={{ fontSize: '14px', color: '#555' }}>Physical ID Card physically returned?</span>
          </label>
          <p style={{ fontSize: '12px', color: '#999', marginTop: '4px', marginLeft: '24px' }}>
            If checked, this card number will enter the reusable pool.
          </p>
        </div>
      ) : null,
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: () => {
        action?.();
      },
    });
  };

  if (isUserActive(student)) {
    return (
      <Button type="primary" danger onClick={() => showConfirm({ message: 'Are you sure you want to deactivate this user?', action: handleDeactivateStudent, isDeactivating: true })}>
        Deactivate User
      </Button>
    );
  } else {
    return (
      <Button type="primary" style={{ backgroundColor: 'green', borderColor: 'green' }} onClick={() => showConfirm({ message: 'Are you sure you want to activate this user?', action: handleActivateStudent })}>
        Activate User
      </Button>
    );
  }
};

export default DeactivateStudent;