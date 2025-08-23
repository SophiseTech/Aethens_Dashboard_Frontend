import { lazy, Suspense } from 'react';
import { Skeleton } from 'antd';
import useStudentDashboardView from '@hooks/business/useStudentDashboardView';

const Attendance = lazy(() => import('@pages/Dashboard/widgets/Attendance'));
const CourseStat = lazy(() => import('@pages/Dashboard/widgets/CourseStat'));
const Transaction = lazy(() => import('@pages/Dashboard/widgets/Transaction'));
const Updates = lazy(() => import('@pages/Dashboard/widgets/Updates'));
const Announcement = lazy(() => import('@pages/Dashboard/widgets/Announcement'));

function Student() {

  const { dashboardInfo } = useStudentDashboardView()

  return (
    <>
      {/* Desktop */}
      <div className='flex gap-5 flex-1 pb-5 pr-5 items-start min-h-full h-auto max-lg:hidden'>
        <Suspense fallback={<Loader />}>
          <Attendance />
          <div className='flex-1 flex flex-col gap-5 min-h-full h-auto'>
            <CourseStat finalProject={dashboardInfo.finalProject} />
            <div className='flex gap-5'>
              <div className='w-1/2 flex flex-col gap-5'>
                <Updates />
                <Announcement />
              </div>
              <Transaction />
            </div>
          </div>
        </Suspense>
      </div>

      {/* Mobile */}
      <Suspense fallback={<Loader />}>
        <div className='flex gap-5 flex-col lg:hidden'>
          <div className='flex gap-5 flex-col md:flex-row'>
            <CourseStat finalProject={dashboardInfo.finalProject}/>
            <Attendance />
          </div>
          <Updates />
          <Announcement />
          <Transaction />
        </div>
      </Suspense>
    </>
  )
}

const Loader = ({ className = "" }) => (
  <div className='w-screen h-screen flex gap-5'>
    <Skeleton.Node
      active
      fullSize
      className='!w-full !h-full'
    />
    <div className='w-full h-full flex flex-col gap-5'>
      <Skeleton.Node
        active
        fullSize
        className='!w-full !h-full'
      />
      <div className='w-full h-full flex gap-5'>
        <div className='w-full h-full flex flex-col gap-5'>
          <Skeleton.Node
            active
            fullSize
            className='!w-full !h-full'
          />
          <Skeleton.Node
            active
            fullSize
            className='!w-full !h-full'
          />
        </div>
        <Skeleton.Node
          active
          fullSize
          className='!w-full !h-full'
        />
      </div>
    </div>
  </div>
)

export default Student