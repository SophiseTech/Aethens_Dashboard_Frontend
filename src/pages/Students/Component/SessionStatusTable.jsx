import { RestFilled } from '@ant-design/icons'
import facultyRemarksStore from '@stores/FacultyRemarksStore'
import { formatDate } from '@utils/helper'
import { Button, Table } from 'antd'
import React, { useEffect } from 'react'
import { useStore } from 'zustand'

function SessionStatusTable({ student }) {

  const { getFacultyRemarks, facultyRemarks, loading, deleteFacultyRemark } = useStore(facultyRemarksStore)

  useEffect(() => {
    getFacultyRemarks({ query: { student_id: student._id, course_id: student?.details_id?.course_id?._id || student?.details_id?.course_id }, populate: "faculty_id" })
    // if (!facultyRemarks || facultyRemarks.length === 0) {
    // }
  }, [student])

  const columns = [
    {
      title: "Module",
      dataIndex: "module"
    },
    {
      title: "Unit",
      dataIndex: "unit"
    },
    {
      title: "Topic",
      dataIndex: "topic",
      // render: (value, record) => <p className={`${record.isTopicComplete && "text-orange-500"}`}>{value}</p>
    },
    {
      title: "Faculty",
      dataIndex: ["faculty_id", "username"]
    },
    {
      title: "Remarks",
      dataIndex: "remarks"
    },
    {
      title: "Completed On",
      dataIndex: "completedOn",
      render: (value, record) => record.isTopicComplete ? formatDate(value) : "Not Completed"
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_, record) => (
        <>
          <Button icon={<RestFilled />} color='red' onClick={() => { deleteFacultyRemark(record._id) }} />
        </>
      ),
    }
  ]

  return (
    <Table columns={columns} dataSource={facultyRemarks} loading={loading}
      rowClassName={(record) => record.isTopicComplete && "bg-stone-500/25"}
      scroll={{
        x: 'max-content',
      }}
    />
  )
}

export default SessionStatusTable