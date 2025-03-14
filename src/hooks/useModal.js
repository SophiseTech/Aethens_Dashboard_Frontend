import { useState } from "react";

function useModal(customOk = async () => { }) {

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = async (values) => {
    await customOk(values)
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return {
    showModal, handleOk, handleCancel, isModalOpen
  }
}

export default useModal