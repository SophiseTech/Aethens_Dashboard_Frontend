import React from 'react';
import { Button, Modal, Checkbox, Select, Input, DatePicker, Form, message } from 'antd';
import dayjs from 'dayjs';
import studentStore from '@stores/StudentStore';
import { isUserActive } from '@utils/helper';
import { STUDENT_DEACTIVATION_REASONS } from '@utils/constants';

const DeactivateStudent = ({ student }) => {
  const deactivateStudent = studentStore((state) => state.deactivateStudent);
  const activateStudent = studentStore((state) => state.activateStudent);
  const [deactivateModalOpen, setDeactivateModalOpen] = React.useState(false);
  const [cardReturned, setCardReturned] = React.useState(false);
  const [reason, setReason] = React.useState(undefined);
  const [reasonOther, setReasonOther] = React.useState('');
  const [deactivatedAt, setDeactivatedAt] = React.useState(dayjs());

  const resetForm = () => {
    setCardReturned(false);
    setReason(undefined);
    setReasonOther('');
    setDeactivatedAt(dayjs());
  };

  const handleDeactivateStudent = async () => {
    if (!reason) {
      message.error('Please select a deactivation reason');
      return;
    }
    if (reason === 'other' && !reasonOther.trim()) {
      message.error('Please specify the deactivation reason');
      return;
    }
    try {
      await deactivateStudent(student._id, cardReturned, {
        reason,
        reasonOther: reason === 'other' ? reasonOther.trim() : undefined,
        deactivatedAt: (deactivatedAt || dayjs()).toISOString(),
      });
      setDeactivateModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error deactivating user:', error);
    }
  };

  const handleActivateStudent = async () => {
    try {
      await activateStudent(student._id);
    } catch (error) {
      console.error('Error deactivating user:', error);
    }
  };

  const showActivateConfirm = () => {
    Modal.confirm({
      title: 'Are you sure you want to activate this user?',
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: () => handleActivateStudent(),
    });
  };

  if (isUserActive(student)) {
    return (
      <>
        <Button type="primary" danger onClick={() => setDeactivateModalOpen(true)}>
          Deactivate User
        </Button>
        <Modal
          title="Deactivate User"
          open={deactivateModalOpen}
          onCancel={() => { setDeactivateModalOpen(false); resetForm(); }}
          onOk={handleDeactivateStudent}
          okText="Deactivate"
          okButtonProps={{ danger: true }}
          destroyOnClose
        >
          <Form layout="vertical">
            <Form.Item label="Reason for Deactivation" required>
              <Select
                placeholder="Select a reason"
                options={STUDENT_DEACTIVATION_REASONS}
                value={reason}
                onChange={setReason}
              />
            </Form.Item>
            {reason === 'other' && (
              <Form.Item label="Please specify" required>
                <Input.TextArea
                  rows={2}
                  value={reasonOther}
                  onChange={(e) => setReasonOther(e.target.value)}
                  placeholder="Enter deactivation reason"
                />
              </Form.Item>
            )}
            <Form.Item label="Deactivated At">
              <DatePicker
                style={{ width: '100%' }}
                value={deactivatedAt}
                onChange={(date) => setDeactivatedAt(date || dayjs())}
                format="DD MMM YYYY"
              />
            </Form.Item>
            <Form.Item>
              <Checkbox checked={cardReturned} onChange={(e) => setCardReturned(e.target.checked)}>
                Physical ID Card physically returned?
              </Checkbox>
              <div style={{ fontSize: 12, color: '#999', marginTop: 4, marginLeft: 24 }}>
                If checked, this card number will enter the reusable pool.
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </>
    );
  }

  return (
    <Button type="primary" style={{ backgroundColor: 'green', borderColor: 'green' }} onClick={showActivateConfirm}>
      Activate User
    </Button>
  );
};

export default DeactivateStudent;
