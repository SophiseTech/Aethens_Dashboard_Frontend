import EditAllotedMaterials from '@pages/ManagerMaterials/Components/EditAllotedMaterials';
import billStore from '@stores/BillStore';
import handleError from '@utils/handleError';
import { Button, Modal } from 'antd';
import { useState } from 'react';

function EditAllotedMaterialsModal({ student_id, hasSelected, materials, selectedRowKeys }) {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { createLoading: billLoading } = billStore()

  // Modal Helper Funcions
  const showModal = () => {
    const materialMap = new Map(materials.map((m) => [m._id, m]));
    if (selectedRowKeys?.some(item => {
      const material = materialMap.get(item)
      return material?.status !== "pending" || material.bill_id
    })) {
      return handleError("Please select only pending materials!")
    }
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
      <Button variant='filled' color='orange' disabled={!hasSelected} onClick={showModal} loading={billLoading}>
        Collect & Generate Invoice
      </Button>
      <Modal
        title={"Edit Alloted Materials"}
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
        width={"60%"}
      >
        <EditAllotedMaterials materials={materials} student_id={student_id} handleOk={handleOk} selectedRowKeys={selectedRowKeys} />
      </Modal>
    </>
  )
}



export default EditAllotedMaterialsModal