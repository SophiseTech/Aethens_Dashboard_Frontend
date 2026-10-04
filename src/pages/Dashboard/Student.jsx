import { lazy, Suspense } from 'react';
import { Col, Row, Skeleton } from 'antd';
import useStudentDashboardView from '@hooks/business/useStudentDashboardView';
import MasonryLayout from '@components/MasonryLayout';

const Attendance = lazy(() => import('@pages/Dashboard/widgets/Attendance'));
const DiplomaTimetable = lazy(() => import('@pages/Dashboard/widgets/DiplomaTimetable'));
const CourseStat = lazy(() => import('@pages/Dashboard/widgets/CourseStat'));
const DiplomaCourseStat = lazy(() => import('@pages/Dashboard/widgets/DiplomaCourseStat'));
const Transaction = lazy(() => import('@pages/Dashboard/widgets/Transaction'));
const Updates = lazy(() => import('@pages/Dashboard/widgets/Updates'));
const Announcement = lazy(() => import('@pages/Dashboard/widgets/Announcement'));

function Student() {

  const { dashboardInfo } = useStudentDashboardView()
  const ScheduleWidget = dashboardInfo.isDiploma ? DiplomaTimetable : Attendance
  const CourseStatWidget = dashboardInfo.isDiploma ? DiplomaCourseStat : CourseStat

  return (
    <>
      {/* Desktop */}
      <div className='flex flex-1 gap-5 items-start pr-5 pb-5 h-auto min-h-full max-lg:hidden'>
        <Suspense fallback={<Loader />}>
          <ScheduleWidget />
          <div className='flex flex-col flex-1 gap-5 h-auto min-h-full'>
            <CourseStatWidget finalProject={dashboardInfo.finalProject} />
            <div className='flex gap-5'>
              <div className='flex flex-col gap-5 w-1/2'>
                <Announcement />
                <Updates />
              </div>
              <Transaction />
            </div>
          </div>
        </Suspense>
      </div>

      {/* Mobile */}
      <Suspense fallback={<Loader />}>
        <div className='flex flex-col gap-5 lg:hidden'>
          <div className='flex flex-col gap-5 lg:flex-row'>
            <CourseStatWidget finalProject={dashboardInfo.finalProject} />
            <Announcement />
          </div>
          <>
            <MasonryLayout>
              <ScheduleWidget />
              <Transaction />
              <Updates />
            </MasonryLayout>
          </>
        </div>
      </Suspense>
    </>
  )
}

const Loader = ({ className = "" }) => (
  <div className='flex gap-5 w-screen h-screen'>
    <Skeleton.Node
      active
      fullSize
      className='!w-full !h-full'
    />
    <div className='flex flex-col gap-5 w-full h-full'>
      <Skeleton.Node
        active
        fullSize
        className='!w-full !h-full'
      />
      <div className='flex gap-5 w-full h-full'>
        <div className='flex flex-col gap-5 w-full h-full'>
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