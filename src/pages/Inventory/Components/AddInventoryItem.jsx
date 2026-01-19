import { PlusCircleFilled } from '@ant-design/icons';
import InventoryItemForm from '@pages/Inventory/Components/InventoryItemForm';
import inventoryStore from '@stores/InventoryStore';
import { Modal } from 'antd';
import { useState } from 'react';
import userStore from '@stores/UserStore';
import { useStore } from 'zustand';
import centersStore from '@stores/CentersStore';
import { ROLES } from '@utils/constants';

function AddInventoryItem() {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { createItem } = inventoryStore()
  const { user } = userStore()
  const {selectedCenter} = useStore(centersStore);

  const showModal = () => {
    if(user.role === ROLES.ADMIN && selectedCenter === "all"){
      alert("Change selected center from All centers in order to create an item");
      return;
    }
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