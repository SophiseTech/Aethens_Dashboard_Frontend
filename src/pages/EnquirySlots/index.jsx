import Title from '@components/layouts/Title'
import { Skeleton } from 'antd';
import { lazy, Suspense } from 'react'
const EnquirySlotsList = lazy(() => import('@pages/EnquirySlots/Component/EnquirySlotsList'));

function EnquirySlots() {

  return (
    <Title
      title={"Enquiry Slots"}
    >
      {/* <EnquirySearch /> */}
      <Suspense fallback={<Loader />}>
        <EnquirySlotsList />
      </Suspense>
    </Title>
  )
}

const Loader = () => (
  <div className='flex flex-col gap-3'>
    <Skeleton.Node className='!w-full !h-16' />
    <Skeleton.Node className='!w-full !h-16' />
    <Skeleton.Node className='!w-full !h-16' />
    <Skeleton.Node className='!w-full !h-16' />
  </div>
)

export default EnquirySlots