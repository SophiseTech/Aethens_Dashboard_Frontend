import { ArrowUpOutlined, UserOutlined } from '@ant-design/icons'
import DataDisplay from '@pages/Dashboard/Components/DataDisplay'
import userStore from '@stores/UserStore'
import React from 'react'
import { useStore } from 'zustand'

function StudentCounts() {

  const { summary } = useStore(userStore)

  return (
    <DataDisplay
      title={"Enrolled Students"}
      count={summary?.totalStudents}
      icon={<UserOutlined className='text-xl text-white' />}
    />
  )
}

export default StudentCounts