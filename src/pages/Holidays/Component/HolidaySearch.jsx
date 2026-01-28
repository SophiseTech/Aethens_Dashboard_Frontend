import CustomInput from '@components/form/CustomInput'
import useHoliday from '@hooks/useHoliday'
import { Button, DatePicker, Flex, Select } from 'antd'
import React, { useState } from 'react'

function HolidaySearch() {
  const { setFilters, statusOptions } = useHoliday()
  const [searchTitle, setSearchTitle] = useState('')
  const [dateRange, setDateRange] = useState([null, null])
  const [selectedStatus, setSelectedStatus] = useState(null)

  const handleSearch = () => {
    const filters = {}
    if (searchTitle?.trim()) {
      filters.search = searchTitle.trim()
    }
    if (dateRange[0] && dateRange[1]) {
      filters.startDate = dateRange[0].format('YYYY-MM-DD')
      filters.endDate = dateRange[1].format('YYYY-MM-DD')
    }
    if (selectedStatus) {
      filters.status = selectedStatus
    }
    setFilters(filters)
  }

  const handleReset = () => {
    setSearchTitle('')
    setDateRange([null, null])
    setSelectedStatus(null)
    setFilters({})
  }

  // Add "All" option to status options
  const statusFilterOptions = [
    { label: 'All Statuses', value: null },
    ...statusOptions
  ]

  return (
    <Flex gap={12} className='mb-6 p-4 bg-white rounded-lg' wrap>
      <CustomInput
        placeholder='Search by holiday title'
        value={searchTitle}
        onChange={(e) => setSearchTitle(e.target.value)}
        className='flex-1 min-w-64'
        allowClear
        onPressEnter={handleSearch}
      />

      <Select
        placeholder='Filter by status'
        value={selectedStatus}
        onChange={(value) => setSelectedStatus(value)}
        options={statusFilterOptions}
        allowClear
        style={{ minWidth: 150 }}
      />

      <DatePicker.RangePicker
        format='YYYY-MM-DD'
        value={dateRange}
        onChange={(dates) => setDateRange(dates || [null, null])}
        placeholder={['Start Date', 'End Date']}
      />

      <Button type='primary' color='orange' variant='solid' onClick={handleSearch}>
        Search
      </Button>
      <Button onClick={handleReset}>
        Reset
      </Button>
    </Flex>
  )
}

export default HolidaySearch
