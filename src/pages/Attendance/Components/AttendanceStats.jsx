import { UserOutlined } from '@ant-design/icons'
import DataDisplay from '@pages/Dashboard/Components/DataDisplay'
import dayjs from 'dayjs'
import React from 'react'

function AttendanceStats({ stats, slots, loading }) {
  const { totalCounts, monthlyStats } = stats || {}
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
        title={"Attended Sessions"}
        count={`${attended} / ${totalSessionsCount}`}
        icon={<UserOutlined className='text-xl text-white' />}
      />
      <DataDisplay
        loading={loading}
        title={"Unattended Sessions"}
        count={unattended}
        icon={<UserOutlined className='text-xl text-white' />}
      />
      <DataDisplay
        loading={loading}
        title={`Attended Sessions till ${lastMonthName}`}
        count={`${totalCounts.attended} / ${totalCounts.attended + totalCounts.non_attended}`}
        icon={<UserOutlined className='text-xl text-white' />}
      />
      <DataDisplay
        loading={loading}
        title={`Unattended Sessions till ${lastMonthName}`}
        count={totalCounts.non_attended}
        icon={<UserOutlined className='text-xl text-white' />}
      />
    </div>
  )
}

export default AttendanceStats