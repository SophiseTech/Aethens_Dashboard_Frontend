import React from 'react';
import { Button, Modal } from 'antd';
import studentStore from '@stores/StudentStore';
import { isUserActive } from '@utils/helper';

const DeactivateStudent = ({ student }) => {
  const deactivateStudent = studentStore((state) => state.deactivateStudent);
  const activateStudent = studentStore((state) => state.activateStudent);

  const handleDeactivateStudent = async () => {
    try {
      await deactivateStudent(student._id);
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

  const showConfirm = ({ message, action }) => {
    Modal.confirm({
      title: message,
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: () => {
        action?.();
      },
    });
  };

  if (isUserActive(student)) {
    return (
      <Button type="primary" danger onClick={() => showConfirm({ message: 'Are you sure you want to deactivate this user?', action: handleDeactivateStudent })}>
        Deactivate User
      </Button>
    );
  } else {
    return (
      <Button type="primary" color='green' onClick={() => showConfirm({ message: 'Are you sure you want to activate this user?', action: handleActivateStudent })}>
        Activate User
      </Button>
    );
  }
};

export default DeactivateStudent;