import Title from '@components/layouts/Title'
import AddEnquiry from '@pages/Enquiries/Component/AddEnquiry'
import { Skeleton } from 'antd';
import { lazy, Suspense } from 'react'
import EnquirySearch from './Component/EnquirySearch';
import permissions from '@utils/permissions';
import userStore from '@stores/UserStore';

const EnquiryList = lazy(() => import('@pages/Enquiries/Component/EnquiryList'));

function Enquiries() {
  const user = userStore((state) => state.user);

  return (
    <Title
      title={"Enquiries"}
      button={permissions.enquiries.add.includes(user.role) && <AddEnquiry />}
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