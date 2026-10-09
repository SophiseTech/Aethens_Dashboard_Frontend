import { lazy, Suspense } from 'react';
import { Col, Row, Skeleton } from 'antd';
import useStudentDashboardView from '@hooks/business/useStudentDashboardView';
import useMediaQuery, { DESKTOP_QUERY } from '@hooks/useMediaQuery';
import StudentHome, { StudentHomePlaceholder } from '@pages/Dashboard/StudentHome';

const Attendance = lazy(() => import('@pages/Dashboard/widgets/Attendance'));
const DiplomaTimetable = lazy(() => import('@pages/Dashboard/widgets/DiplomaTimetable'));
const CourseStat = lazy(() => import('@pages/Dashboard/widgets/CourseStat'));
const DiplomaCourseStat = lazy(() => import('@pages/Dashboard/widgets/DiplomaCourseStat'));
const Transaction = lazy(() => import('@pages/Dashboard/widgets/Transaction'));
const Updates = lazy(() => import('@pages/Dashboard/widgets/Updates'));
const Announcement = lazy(() => import('@pages/Dashboard/widgets/Announcement'));

function Student() {

  const { dashboardInfo } = useStudentDashboardView()
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const ScheduleWidget = dashboardInfo.isDiploma ? DiplomaTimetable : Attendance
  const CourseStatWidget = dashboardInfo.isDiploma ? DiplomaCourseStat : CourseStat

  // Only one layout is mounted, so the widgets don't fetch twice.
  if (!isDesktop) {
    if (!dashboardInfo.enrollmentResolved) return <StudentHomePlaceholder />
    return <StudentHome isDiploma={dashboardInfo.isDiploma} finalProject={dashboardInfo.finalProject} />
  }

  return (
    <div className='flex flex-1 gap-5 items-start pr-5 pb-5 h-auto min-h-full'>
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