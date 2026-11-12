import Title from '@components/layouts/Title'
import AddEnquiry from '@pages/Enquiries/Component/AddEnquiry'
import { Skeleton } from 'antd';
import { lazy, Suspense } from 'react'
import EnquirySearch from './Component/EnquirySearch';
import useCan from '@hooks/useCan';

const EnquiryList = lazy(() => import('@pages/Enquiries/Component/EnquiryList'));

function Enquiries() {
  const { can } = useCan();

  return (
    <Title
      title={"Enquiries"}
      button={can("enquiry:create") && <AddEnquiry />}
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