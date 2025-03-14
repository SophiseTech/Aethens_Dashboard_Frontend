import PayslipRequestForm from '@pages/Payslips/components/PayslipRequestForm';
import { Button, Modal } from 'antd';
import React, { useState } from 'react'

function PayslipRequestModal() {

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal Helper Funcions
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = async () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };


  return (
    <>
      <Button variant='filled' color='orange' onClick={showModal}>Request</Button>
      <Modal
        title={"Request Payslip"}
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
      >
        <PayslipRequestForm handleOk={handleOk} />
      </Modal>
    </>
  )
}

export default PayslipRequestModal