import Title from '@components/layouts/Title'
import useHoliday from '@hooks/useHoliday'
import HolidayForm from '@pages/Holidays/Component/HolidayForm'
import HolidayList from '@pages/Holidays/Component/HolidayList'
import HolidaySearch from '@pages/Holidays/Component/HolidaySearch'
import userStore from '@stores/UserStore'
import permissions from '@utils/permissions'
import { Button, Skeleton } from 'antd'
import React, { lazy, Suspense, useEffect, useRef } from 'react'
import { useStore } from 'zustand'

function Holidays() {
  const { user } = useStore(userStore)
  const { fetchHolidays } = useHoliday()
  const initializedRef = useRef(false)

  // Fetch holidays on component mount
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      fetchHolidays(1);
    }
  }, [])

  // Check permission
  if (!permissions.holidays?.view?.includes(user.role)) {
    return <div className="text-center py-8">You don't have permission to access holidays</div>
  }

  return (
    <Title
      title="Holidays"
      button={
        permissions.holidays?.add?.includes(user.role) && (
          <HolidayForm isCreate={true} />
        )
      }
    >
      <HolidaySearch />
      <Suspense fallback={<Loader />}>
        <HolidayList />
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

export default Holidays
