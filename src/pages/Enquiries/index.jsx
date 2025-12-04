import Title from '@components/layouts/Title'
import AddEnquiry from '@pages/Enquiries/Component/AddEnquiry'
import { Skeleton } from 'antd';
import { lazy, Suspense } from 'react'
import EnquirySearch from './Component/EnquirySearch';
const EnquiryList = lazy(() => import('@pages/Enquiries/Component/EnquiryList'));

function Enquiries() {

  return (
    <Title
      title={"Enquiries"}
      button={<AddEnquiry />}
    >
      {/* <EnquirySearch /> */}
      <Suspense fallback={<Loader />}>
        <EnquiryList />
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

export default Enquiries