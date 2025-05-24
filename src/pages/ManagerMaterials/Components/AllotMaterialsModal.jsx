import { PlusCircleFilled } from '@ant-design/icons'
import CustomModal from '@components/CustomModal'
import AllotMaterials from '@pages/ManagerMaterials/Components/AllotMaterials'
import userStore from '@stores/UserStore';
import permissions from '@utils/permissions';
import { Modal } from 'antd';
import React, { useState } from 'react'
import { Navigate } from 'react-router-dom';
import { useStore } from 'zustand';

function AllotMaterialsModal(props) {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useStore(userStore)

  // Modal Helper Funcions
  const showModal = () => {
    console.log("clcikce");

    setIsModalOpen(true);
  };
  const handleOk = async () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  if (!permissions.student.add?.includes(user.role)) return null
  return (
    <>
      <PlusCircleFilled className='text-3xl text-primary' onClick={showModal} />
      <Modal
        title={"Allot Materials"}
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
        width={"90%"}
      >
        <AllotMaterials {...props} handleOk={handleOk} />
      </Modal>
    </>
  )
}



export default AllotMaterialsModal