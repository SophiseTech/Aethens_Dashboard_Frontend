import SessionStatusTable from '@pages/Students/Component/SessionStatusTable';
import SessionStautsForm from '@pages/Students/Component/SessionStautsForm';
import { Button, Modal } from 'antd';
import React, { useState } from 'react'
import { isMobile, isTablet } from 'react-device-detect';

function SessionStatus({ student }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [selectedStudent, setSelectedStudent] = useState(null)

  const showModal = () => {
    setIsModalOpen(true);
    // setSelectedStudent(student.id)
  };
  const handleOk = async () => {
    setIsModalOpen(false);
    // setSelectedStudent(null)
  };
  const handleCancel = () => {
    // setSelectedStudent(null)
    setIsModalOpen(false);
  };

  return (
    <>
      <Button onClick={showModal} variant='filled' color='green'>
        Add Session Status
      </Button>
      {/* <p  className='cursor-pointer hover:text-primary transition-colors'></p> */}
      <Modal
        title={"Session Status"}
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
        width={(isMobile || isTablet) ? "100%" : "60%"}
      >
        <SessionStautsForm handleOk={handleOk} student={student} />
        <SessionStatusTable student={student} />
      </Modal>
    </>
  )
}

export default SessionStatus