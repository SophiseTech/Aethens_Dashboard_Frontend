import { RestFilled } from '@ant-design/icons'
import facultyRemarksStore from '@stores/FacultyRemarksStore'
import { formatDate } from '@utils/helper'
import { Button, Input, Select, Space, Table } from 'antd'
import React, { useEffect, useState, useMemo } from 'react'
import { useStore } from 'zustand'

const { Search } = Input;

function SessionStatusTable({ student }) {

  const { getFacultyRemarks, facultyRemarks, loading, deleteFacultyRemark } = useStore(facultyRemarksStore)
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    getFacultyRemarks({ query: { student_id: student._id, course_id: student?.details_id?.course_id?._id || student?.details_id?.course_id }, populate: "faculty_id" })
    // if (!facultyRemarks || facultyRemarks.length === 0) {
    // }
  }, [student])

  // Filter remarks based on status and search
  const filteredRemarks = useMemo(() => {
    let filtered = facultyRemarks || [];

    // Filter by status
    if (statusFilter === 'completed') {
      filtered = filtered.filter(remark => remark.isTopicComplete);
    } else if (statusFilter === 'pending') {
      filtered = filtered.filter(remark => !remark.isTopicComplete);
    }

    // Filter by search text (module, unit, topic, or remarks)
    if (searchText) {
      filtered = filtered.filter(remark =>
        remark.module?.toLowerCase().includes(searchText.toLowerCase()) ||
        remark.unit?.toLowerCase().includes(searchText.toLowerCase()) ||
        remark.topic?.toLowerCase().includes(searchText.toLowerCase()) ||
        remark.remarks?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return filtered;
  }, [facultyRemarks, statusFilter, searchText]);

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
    <div>
      {/* Filters */}
      <Space className="mb-4" wrap>
        <Select
          style={{ width: 150 }}
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: 'All Status', value: 'all' },
            { label: 'Completed', value: 'completed' },
            { label: 'Pending', value: 'pending' },
          ]}
        />
        <Search
          placeholder="Search module, unit, topic, or remarks"
          allowClear
          style={{ width: 300 }}
          onSearch={setSearchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </Space>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredRemarks}
        loading={loading}
        rowClassName={(record) => record.isTopicComplete && "bg-stone-500/25"}
        scroll={{
          x: 'max-content',
        }}
      />
    </div>
  )
}

export default SessionStatusTable