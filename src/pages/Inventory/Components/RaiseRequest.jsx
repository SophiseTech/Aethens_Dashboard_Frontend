import InventoryItemForm from '@pages/Inventory/Components/InventoryItemForm';
import RequestForm from '@pages/Inventory/Components/RequestForm';
import inventoryStore from '@stores/InventoryStore';
import { Button, Modal } from 'antd';
import _ from 'lodash';
import { useState } from 'react';

function RaiseRequest({ }) {

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = async () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false)
  };

  const onSubmit = async (values) => {
    console.log(values);
    handleOk()
  }

  return (
    <>
      <Button variant='filled' color='green' onClick={showModal}>
        Raise Request
      </Button>
      <Modal
        title={"Raise a request"}
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
        width={"60%"}
      >
        <RequestForm />
      </Modal>
    </>
  )
}

export default RaiseRequest