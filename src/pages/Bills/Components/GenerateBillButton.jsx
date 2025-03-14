import { Loading3QuartersOutlined, PlusCircleFilled } from '@ant-design/icons';
import React, { lazy, Suspense, useState } from 'react'
const GenerateBill = lazy(() => import('@pages/Bills/Components/GenerateBill'));

function GenerateBillButton(
  props
) {

  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <>
      <PlusCircleFilled className='text-3xl text-primary' onClick={showModal} />
      <Suspense fallback={<Loader />}>
        <GenerateBill {...props} isModalOpen={isModalOpen} handleCancel={handleCancel} handleOk={handleOk} />
      </Suspense>

    </>
  )
}

const Loader = () => (
  <div className='fixed inset-0 bg-black/50 z-10 flex items-center justify-center'>
    <Loading3QuartersOutlined className='animate-spin text-white text-3xl' />
  </div>
)


export default GenerateBillButton