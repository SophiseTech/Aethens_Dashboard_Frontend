import Title from '@components/layouts/Title'
import StudentSearch from '@pages/Students/Component/StudentSearch';
import { Skeleton } from 'antd';
import React, { lazy, Suspense } from 'react'
const ManagerStudentList = lazy(() => import('@pages/Students/Component/ManagerStudentList'));

function ManagerStudents() {
  return (
    <div className='space-y-5'>
      <StudentSearch />
      <Suspense fallback={<Loader />}>
        <ManagerStudentList />
      </Suspense>
    </div>
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

export default ManagerStudents