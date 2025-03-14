import { Modal } from 'antd';
import React, { useState } from 'react'

function CustomModal({
  button: {
    label = "Open",
    className = ""
  } = {},
  title = "",
  customOk = async () => { },
  children
}) {

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = async () => {
    await customOk()
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div onClick={showModal} className={className}>
        {label}
      </div>
      <Modal title={title} open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        {children}
      </Modal>
    </>
  )
}

export default CustomModal