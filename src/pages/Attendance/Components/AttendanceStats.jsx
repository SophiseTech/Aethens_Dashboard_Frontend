import { UserOutlined } from '@ant-design/icons'
import DataDisplay from '@pages/Dashboard/Components/DataDisplay'
import { months } from '@utils/constants'
import dayjs from 'dayjs'
import React from 'react'

function AttendanceStats({ stats, slots, loading, selectedFilter }) {
  const { totalCounts, monthlyStats, totalSlots } = stats || {}
  const totalSessionsCount = slots?.length

  const { attended, unattended } = slots?.reduce((acc, curr) => {
    if (curr.status === "attended") {
      acc.attended += 1
    } else {
      acc.unattended += 1
    }
    return acc
  }, { attended: 0, unattended: 0 })

  const lastMonthName = dayjs().subtract(1, 'month').format('MMMM');

  return (
    <div className='grid grid-cols-2 gap-5'>
      <DataDisplay
        loading={loading}
        title={`Attended Sessions (${selectedFilter})`}
        count={`${attended} / ${totalSessionsCount}`}
        icon={<UserOutlined className='text-xl text-white' />}
      />
      <DataDisplay
        loading={loading}
        title={`Unattended Sessions (${selectedFilter})`}
        count={unattended}
        icon={<UserOutlined className='text-xl text-white' />}
      />
      <DataDisplay
        loading={loading}
        title={`Total Attended Sessions`}
        count={`${totalCounts.attended} / ${totalSlots}`}
        icon={<UserOutlined className='text-xl text-white' />}
      />
      <DataDisplay
        loading={loading}
        title={`Total Unattended Sessions`}
        count={totalCounts.non_attended}
        icon={<UserOutlined className='text-xl text-white' />}
      />
    </div>
  )
}

export default AttendanceStats