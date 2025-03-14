import InventoryItemForm from '@pages/Inventory/Components/InventoryItemForm';
import inventoryStore from '@stores/InventoryStore';
import { Modal } from 'antd';
import _ from 'lodash';
import { useState } from 'react';

function EditInventoryItem({ editItem, setEditItem }) {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { editItem: editItemFunction } = inventoryStore()
  // const [editItem, setEditItem] = useState({})
  // const { user } = userStore()

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = async () => {
    // setIsModalOpen(false);
    setEditItem({})
  };
  const handleCancel = () => {
    setEditItem({})
  };

  const onSubmit = async (values) => {
    await editItemFunction(editItem._id, values)
    console.log(values);
    handleOk()
  }

  return (
    <>

      <Modal
        title={"Edit Inventory Item"}
        open={!_.isEmpty(editItem)}
        footer={null}
        onCancel={handleCancel}
      >
        <InventoryItemForm onSubmit={onSubmit} defaultItem={editItem} />
      </Modal>
    </>
  )
}

export default EditInventoryItem