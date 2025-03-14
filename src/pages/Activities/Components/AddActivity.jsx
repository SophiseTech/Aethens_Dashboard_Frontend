import { PlusCircleFilled } from '@ant-design/icons';
import AddActivityForm from '@pages/Activities/Components/AddActivityForm';
import activitiesStore from '@stores/ActivitiesStore';
import userStore from '@stores/UserStore';
import { Modal } from 'antd';
import React, { useState } from 'react'
import { useStore } from 'zustand';

function AddActivity() {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useStore(userStore)
  const { createActivity } = useStore(activitiesStore)

  // Modal Helper Funcions
  const showModal = () => {
    console.log("clcikce");

    setIsModalOpen(true);
  };
  const handleOk = async (values) => {
    await createActivity(values)
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <PlusCircleFilled className='text-3xl text-primary' onClick={showModal} />
      <Modal
        title={"Add Activity"}
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
      >
        <AddActivityForm handleOk={handleOk} />
      </Modal>
    </>
  )
}

export default AddActivity