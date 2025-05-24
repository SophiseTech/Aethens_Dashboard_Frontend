import { CalendarOutlined } from '@ant-design/icons'
import AttendanceCalendar from '@pages/Dashboard/Components/AttendanceCalendar'
import AttendanceHistory from '@pages/Dashboard/Components/AttendanceHistory'
import attendanceStore from '@stores/AttendanceStore'
import slotStore from '@stores/SlotStore'
import userStore from '@stores/UserStore'
import dayjs from 'dayjs'
import React, { useEffect } from 'react'

function Attendance() {

  const { getSlots, loading, slots } = slotStore()
  const { getHistory, loading: historyLoading, records } = attendanceStore()
  const { user } = userStore()

  useEffect(() => {
    if (!slots || slots.length <= 0) {
      // getSlots()
      getSlots(0, { sort: { start_date: -1 }, query: { booked_student_id: user._id, start_date: { $gte: dayjs().startOf("month").toISOString() }, course_id: user?.details_id?.course_id?._id || user?.details_id?.course_id }, populate: "center_id session" })
    }
    if (!records || records.length <= 0) {
      getHistory({ user_id: user._id }, {}, 5)
    }
  }, [user])

  return (
    <div className='p-2 border border-border rounded-3xl flex flex-col gap-5 | w-full lg:w-4/12'>

      <div className='flex justify-between items-center | p-2 2xl:p-4 pb-0'>
        <h1 className='font-bold | text-sm 2xl:text-xl'>Attendance</h1>
        <div className='border border-secondary rounded-full px-3 py-1.5 flex gap-2 items-center'>
          <CalendarOutlined className='| text-[0.6rem] 2xl:text-sm' />
          <p className='| text-[.6rem] 2xl:text-xs'>Last 30 days</p>
        </div>
      </div>

      <AttendanceCalendar slots={slots} />
      <AttendanceHistory records={slots} />
    </div>
  )
}

export default Attendance