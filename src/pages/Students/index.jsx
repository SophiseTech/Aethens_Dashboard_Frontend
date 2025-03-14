import Title from '@components/layouts/Title'
import AddStudent from '@pages/Students/Component/AddStudent'
import SlotRequests from '@pages/Students/Component/SlotRequests';
import StudentSearch from '@pages/Students/Component/StudentSearch';
import userStore from '@stores/UserStore';
import permissions from '@utils/permissions';
import { Button, Flex, Skeleton } from 'antd';
import React, { lazy, Suspense, useState } from 'react'
import { useStore } from 'zustand';
const StudentList = lazy(() => import('@pages/Students/Component/StudentList'));

function Students() {

  const { user } = useStore(userStore)
  const [drawerState, setDrawerState] = useState(false)

  return (
    <Title
      title={"Students"}
      button={<Flex gap={20}>
        {permissions.student.slot_requests.includes(user.role) &&
          <Button variant='filled' color='orange' onClick={() => { setDrawerState(true) }}>Requests</Button>
        }
        <AddStudent />
      </Flex>}
    >
      <StudentSearch />
      <Suspense fallback={<Loader />}>
        <StudentList />
      </Suspense>

      <SlotRequests drawerState={drawerState} handleClose={() => setDrawerState(false)} />
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

export default Students