import Title from '@components/layouts/Title'
import AddDiplomaStudent from '@pages/Students/Component/AddDiplomaStudent'
import DiplomaStudentSearch from '@pages/DiplomaStudents/Component/DiplomaStudentSearch'
import userStore from '@stores/UserStore';
import permissions from '@utils/permissions';
import { Skeleton } from 'antd';
import { lazy, Suspense } from 'react'
import { useStore } from 'zustand';

const DiplomaStudentList = lazy(() => import('@pages/DiplomaStudents/Component/DiplomaStudentList'));

function DiplomaStudents() {
  const { user } = useStore(userStore)

  return (
    <Title
      title={"Diploma Students"}
      button={permissions.student.add.includes(user.role) && <AddDiplomaStudent />}
    >
      <DiplomaStudentSearch />
      <Suspense fallback={<Loader />}>
        <DiplomaStudentList />
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

export default DiplomaStudents
