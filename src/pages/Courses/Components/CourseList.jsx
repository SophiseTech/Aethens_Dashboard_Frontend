import courseStore from '@stores/CourseStore'
import userStore from '@stores/UserStore'
import { Button, Flex, Table } from 'antd'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from 'zustand'

function CourseList() {

  const { courses, loading } = useStore(courseStore)
  const { user } = useStore(userStore)
  const nav = useNavigate()

  const handleViewSyllabus = (id) => {
    nav(`/syllabus/${id}`)
  }

  const handleViewActivities = (id) => {
    nav(`/${user.role}/activities/${id}`)
  }

  const columns = [
    {
      title: "Name",
      dataIndex: "course_name",
      fixed: true
    },
    {
      title: "Total Sessions",
      dataIndex: "total_session"
    },
    {
      title: "Actions",
      dataIndex: "action",
      render: (_, record) => (
        <Flex gap={10}>
          <Button variant='filled' color='green' onClick={() => { handleViewSyllabus(record._id) }}>View Syllabus</Button>
          <Button variant='filled' color='orange' onClick={() => { handleViewActivities(record._id) }}>View Activities</Button>
        </Flex>
      )
    }
  ]
  return (
    <Table columns={columns} dataSource={courses} loading={loading}
      scroll={{
        x: 'max-content',
      }}
    />
  )
}

export default CourseList