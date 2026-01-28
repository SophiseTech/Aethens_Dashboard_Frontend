import Chip from '@components/Chips/Chip'
import HolidayForm from '@pages/Holidays/Component/HolidayForm'
import useHoliday from '@hooks/useHoliday'
import userStore from '@stores/UserStore'
import permissions from '@utils/permissions'
import { Button, Flex, Popconfirm, Table } from 'antd'
import React from 'react'
import { useStore } from 'zustand'

function HolidayList() {
  const { user } = useStore(userStore)
  const {
    holidays,
    loading,
    total,
    page,
    limit,
    fetchHolidays,
    deleteHoliday,
    deleteLoading
  } = useHoliday()

  // Handle page change
  const handlePageChange = (pageNum) => {
    fetchHolidays(pageNum)
  }

  // Handle delete
  const handleDelete = async (holidayId) => {
    try {
      await deleteHoliday(holidayId)
    } catch (error) {
      // Error already handled by the store
    }
  }

  // Format recurring holiday display
  const formatHolidayDate = (holiday) => {
    if (holiday.isRecurring) {
      // Convert MM-DD format to readable format
      const startMonthDay = holiday.startDate.split('-')
      const endMonthDay = holiday.endDate.split('-')

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const startMonth = monthNames[parseInt(startMonthDay[0]) - 1]
      const endMonth = monthNames[parseInt(endMonthDay[0]) - 1]

      return `${startMonth} ${startMonthDay[1]} - ${endMonth} ${endMonthDay[1]}, repeats yearly`
    } else {
      // YYYY-MM-DD format
      return `${holiday.startDate} to ${holiday.endDate}`
    }
  }

  // Get sortable date for comparison (for one-time: use actual date, for recurring: use current year)
  const getSortableDate = (holiday) => {
    if (holiday.isRecurring) {
      // For recurring, use current year with MM-DD
      const currentYear = new Date().getFullYear()
      return new Date(`${currentYear}-${holiday.startDate}`)
    }
    return new Date(holiday.startDate)
  }

  // Table columns with sorting
  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: '25%',
      ellipsis: true,
      sorter: (a, b) => a.title.localeCompare(b.title),
      sortDirections: ['ascend', 'descend']
    },
    {
      title: 'Type',
      key: 'type',
      width: '15%',
      sorter: (a, b) => (a.isRecurring === b.isRecurring ? 0 : a.isRecurring ? -1 : 1),
      sortDirections: ['ascend', 'descend'],
      render: (_, record) => (
        <Chip
          type={record.isRecurring ? 'warning' : 'draft'}
          label={record.isRecurring ? 'Recurring' : 'One-time'}
          size='small'
        />
      )
    },
    {
      title: 'Dates',
      key: 'dates',
      width: '30%',
      sorter: (a, b) => getSortableDate(a) - getSortableDate(b),
      sortDirections: ['ascend', 'descend'],
      render: (_, record) => formatHolidayDate(record)
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      sorter: (a, b) => a.status.localeCompare(b.status),
      sortDirections: ['ascend', 'descend'],
      filters: [
        { text: 'Published', value: 'published' },
        { text: 'Unpublished', value: 'unpublished' },
        { text: 'Archived', value: 'archived' }
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const typeMap = {
          published: 'success',
          unpublished: 'warning',
          archived: 'archived'
        }
        return (
          <Chip
            type={typeMap[status] || 'draft'}
            label={status.charAt(0).toUpperCase() + status.slice(1)}
            size='small'
          />
        )
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '15%',
      render: (_, record) => (
        <Flex gap={5}>
          {permissions.holidays?.edit?.includes(user.role) && (
            <HolidayForm
              isCreate={false}
              holiday={record}
              onClose={() => fetchHolidays(page)}
            />
          )}
          {permissions.holidays?.delete?.includes(user.role) && (
            <Popconfirm
              title='Delete Holiday'
              description='Are you sure you want to delete this holiday?'
              onConfirm={() => handleDelete(record._id)}
              okText='Yes'
              cancelText='No'
              okButtonProps={{ loading: deleteLoading }}
            >
              <Button danger size='small' loading={deleteLoading}>
                Delete
              </Button>
            </Popconfirm>
          )}
        </Flex>
      )
    }
  ]

  return (
    <Table
      columns={columns}
      dataSource={holidays}
      rowKey='_id'
      loading={loading}
      pagination={{
        total,
        pageSize: limit,
        current: page,
        onChange: handlePageChange,
        showSizeChanger: false,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`
      }}
      scroll={{ x: 1000 }}
    />
  )
}

export default HolidayList
