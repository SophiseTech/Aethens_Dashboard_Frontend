import { PlusCircleFilled } from '@ant-design/icons';
import InventoryItemForm from '@pages/Inventory/Components/InventoryItemForm';
import inventoryStore from '@stores/InventoryStore';
import { Modal } from 'antd';
import { useState } from 'react';

function AddInventoryItem() {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { createItem } = inventoryStore()
  // const { user } = userStore()

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = async () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onSubmit = async (values) => {
    await createItem(values)
    console.log(values);
    handleOk()
  }

  return (
    <>
      <PlusCircleFilled className='text-3xl text-primary' onClick={showModal} />
      <Modal
        title={"Add Inventory Item"}
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
      >
        <InventoryItemForm onSubmit={onSubmit} />
      </Modal>
    </>
  )
}

export default AddInventoryItem