import CustomInput from '@components/form/CustomInput'
import CustomSelect from '@components/form/CustomSelect'
import useHoliday from '@hooks/useHoliday'
import centersStore from '@stores/CentersStore'
import userStore from '@stores/UserStore'
import { ROLES } from '@utils/constants'
import { Button, DatePicker, Flex, Modal, Switch } from 'antd'
import { Form } from 'antd'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import React, { useState } from 'react'
import { useStore } from 'zustand'

// Extend dayjs with the isSameOrAfter plugin
dayjs.extend(isSameOrAfter)

function HolidayForm({ isCreate = false, holiday = null, onClose = null }) {
  const [form] = Form.useForm()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRecurring, setIsRecurring] = useState(holiday?.isRecurring ?? true)
  const { user } = useStore(userStore)
  const { centers } = useStore(centersStore)
  const { createHoliday, updateHoliday, createLoading, updateLoading, statusOptions } = useHoliday()

  // Maximum allowed days between start and end date for one-time holidays (365 days = 1 year)
  const MAX_ONE_TIME_HOLIDAY_DAYS = 365

  // Helper function to format date to MM-DD with proper padding
  const formatToMMDD = (date) => {
    if (!date) return ''

    // Handle both string and dayjs object
    let dayjsDate = date
    if (typeof date === 'string') {
      dayjsDate = dayjs(date)
    }

    const month = String(dayjsDate.month() + 1).padStart(2, '0')
    const day = String(dayjsDate.date()).padStart(2, '0')
    return `${month}-${day}`
  }

  // Prepare center options for admin
  const centerOptions = centers.map(center => ({
    label: center.name,
    value: center._id
  }))

  const handleModalOpen = () => {
    setIsModalOpen(true)
    if (holiday) {
      // Pre-fill form for edit
      // For recurring holidays, add a placeholder year (2024) since MM-DD doesn't include year
      const startDate = holiday.isRecurring
        ? dayjs(`2024-${holiday.startDate}`, 'YYYY-MM-DD')
        : dayjs(holiday.startDate, 'YYYY-MM-DD')
      const endDate = holiday.isRecurring
        ? dayjs(`2024-${holiday.endDate}`, 'YYYY-MM-DD')
        : dayjs(holiday.endDate, 'YYYY-MM-DD')

      form.setFieldsValue({
        title: holiday.title,
        isRecurring: holiday.isRecurring,
        startDate,
        endDate,
        status: holiday.status,
        ...(user.role === ROLES.ADMIN && { centerId: holiday.centerId })
      })
      setIsRecurring(holiday.isRecurring)
    } else {
      // Set default status for new holidays
      form.setFieldsValue({
        isRecurring: true,
        status: 'published'
      })
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    form.resetFields()
    setIsRecurring(true)
    if (onClose) onClose()
  }

  const handleSubmit = async (values) => {
    try {
      // Ant Form serializes dates, so we need to handle them
      let startDate, endDate

      // Parse the dates - Ant Form might return them as strings or dayjs objects
      const startDateValue = values.startDate
      const endDateValue = values.endDate

      // Convert to dayjs if they're strings
      const startDateDayjs = dayjs.isDayjs(startDateValue) ? startDateValue : dayjs(startDateValue)
      const endDateDayjs = dayjs.isDayjs(endDateValue) ? endDateValue : dayjs(endDateValue)

      if (values.isRecurring) {
        // For recurring: extract MM-DD from the date
        startDate = formatToMMDD(startDateDayjs)
        endDate = formatToMMDD(endDateDayjs)
      } else {
        // For one-time: use full YYYY-MM-DD
        startDate = startDateDayjs.format('YYYY-MM-DD')
        endDate = endDateDayjs.format('YYYY-MM-DD')
      }

      const formattedValues = {
        title: values.title,
        isRecurring: values.isRecurring,
        startDate,
        endDate,
        status: values.status
      }

      // Add centerId for admin, or validate for manager
      if (user.role === ROLES.ADMIN) {
        formattedValues.centerId = values.centerId
      }

      if (isCreate) {
        await createHoliday(formattedValues)
      } else {
        await updateHoliday(holiday._id, formattedValues)
      }

      handleModalClose()
    } catch (error) {
      // Error already handled by the store
    }
  }

  // Get disabled dates for the end date picker (for one-time holidays)
  const getDisabledEndDate = (current) => {
    if (!current) return false

    const startDate = form.getFieldValue('startDate')
    if (!startDate) return false

    const startDayjs = dayjs.isDayjs(startDate) ? startDate : dayjs(startDate)

    // Disable dates before start date
    if (current.isBefore(startDayjs, 'day')) {
      return true
    }

    // For one-time holidays, disable dates more than 1 year from start
    if (!isRecurring) {
      const maxEndDate = startDayjs.add(MAX_ONE_TIME_HOLIDAY_DAYS, 'day')
      if (current.isAfter(maxEndDate, 'day')) {
        return true
      }
    }

    return false
  }

  const isLoading = createLoading || updateLoading
  const buttonLabel = isCreate ? 'Add Holiday' : 'Edit'
  const modalTitle = isCreate ? 'Create Holiday' : 'Edit Holiday'

  return (
    <>
      {isCreate ? (
        <Button variant='filled' color='orange' onClick={handleModalOpen}>
          {buttonLabel}
        </Button>
      ) : (
        <Button size='small' onClick={handleModalOpen}>
          {buttonLabel}
        </Button>
      )}

      <Modal
        title={modalTitle}
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            isRecurring: true,
            status: 'published'
          }}
        >
          {/* Title Field */}
          <CustomInput
            name='title'
            label='Holiday Title'
            placeholder='e.g., Summer Vacation'
            rules={[
              { required: true, message: 'Title is required' },
              { min: 1, max: 100, message: 'Title must be between 1 and 100 characters' }
            ]}
          />

          {/* Center Selection (Admin Only) */}
          {user.role === ROLES.ADMIN && (
            <CustomSelect
              name='centerId'
              label='Center'
              placeholder='Select a center'
              options={centerOptions}
              rules={[{ required: true, message: 'Center is required' }]}
            />
          )}

          {/* Recurring Toggle */}
          <Form.Item
            name='isRecurring'
            label='Recurring Holiday (repeats yearly)'
            valuePropName='checked'
          >
            <Switch
              onChange={(checked) => {
                setIsRecurring(checked)
                // Clear dates when switching type
                form.setFieldsValue({
                  startDate: undefined,
                  endDate: undefined
                })
              }}
            />
          </Form.Item>

          {/* Start Date */}
          <Form.Item
            name='startDate'
            label={isRecurring ? 'Start Date (Month-Day)' : 'Start Date'}
            rules={[
              { required: true, message: 'Start date is required' },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve()

                  // Ensure it's a valid dayjs object
                  if (!dayjs.isDayjs(value) || !value.isValid()) {
                    return Promise.reject(new Error('Please select a valid date'))
                  }

                  if (isRecurring) {
                    // For recurring, validate month and day are valid
                    const month = value.month() + 1 // dayjs months are 0-indexed
                    const date = value.date()

                    // Check if month is valid (1-12)
                    if (month < 1 || month > 12) {
                      return Promise.reject(new Error('Invalid month'))
                    }

                    // Check if day is valid for the month
                    const daysInMonth = value.daysInMonth()
                    if (date < 1 || date > daysInMonth) {
                      return Promise.reject(new Error(`Invalid day for month ${month}`))
                    }
                  }
                  return Promise.resolve()
                }
              }
            ]}
          >
            <DatePicker
              style={{ width: '100%' }}
              format={isRecurring ? 'MM-DD' : 'YYYY-MM-DD'}
              placeholder={isRecurring ? 'Select month and day (e.g., 06-01)' : 'Select start date'}
              onChange={() => {
                // Clear end date when start date changes to revalidate
                form.setFieldValue('endDate', undefined)
              }}
            />
          </Form.Item>

          {/* End Date */}
          <Form.Item
            name='endDate'
            label={isRecurring ? 'End Date (Month-Day)' : `End Date (max ${MAX_ONE_TIME_HOLIDAY_DAYS} days from start)`}
            rules={[
              { required: true, message: 'End date is required' },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve()

                  // Ensure it's a valid dayjs object
                  if (!dayjs.isDayjs(value) || !value.isValid()) {
                    return Promise.reject(new Error('Please select a valid date'))
                  }

                  const startDate = form.getFieldValue('startDate')
                  if (!startDate) return Promise.resolve()

                  const startDayjs = dayjs.isDayjs(startDate) ? startDate : dayjs(startDate)

                  if (isRecurring) {
                    // For recurring, validate month and day are valid
                    const month = value.month() + 1
                    const date = value.date()

                    if (month < 1 || month > 12) {
                      return Promise.reject(new Error('Invalid month'))
                    }

                    const daysInMonth = value.daysInMonth()
                    if (date < 1 || date > daysInMonth) {
                      return Promise.reject(new Error(`Invalid day for month ${month}`))
                    }

                    // Compare only month and day for recurring
                    const startMMDD = `${String(startDayjs.month() + 1).padStart(2, '0')}-${String(startDayjs.date()).padStart(2, '0')}`
                    const endMMDD = `${String(value.month() + 1).padStart(2, '0')}-${String(value.date()).padStart(2, '0')}`

                    if (endMMDD < startMMDD) {
                      return Promise.reject(new Error('End date must be after or equal to start date'))
                    }
                  } else {
                    // For one-time holidays
                    if (value.isBefore(startDayjs, 'day')) {
                      return Promise.reject(new Error('End date must be after or equal to start date'))
                    }

                    // Check 1-year max range
                    const daysDiff = value.diff(startDayjs, 'day')
                    if (daysDiff > MAX_ONE_TIME_HOLIDAY_DAYS) {
                      return Promise.reject(new Error(`Holiday duration cannot exceed ${MAX_ONE_TIME_HOLIDAY_DAYS} days (1 year)`))
                    }
                  }

                  return Promise.resolve()
                }
              }
            ]}
          >
            <DatePicker
              style={{ width: '100%' }}
              format={isRecurring ? 'MM-DD' : 'YYYY-MM-DD'}
              placeholder={isRecurring ? 'Select month and day (e.g., 06-30)' : 'Select end date'}
              disabledDate={isRecurring ? undefined : getDisabledEndDate}
            />
          </Form.Item>

          {/* Status */}
          <CustomSelect
            name='status'
            label='Status'
            options={statusOptions}
            rules={[{ required: true, message: 'Status is required' }]}
          />

          {/* Submit Button */}
          <Form.Item>
            <Flex gap={10}>
              <Button
                type='primary'
                color='orange'
                variant='solid'
                loading={isLoading}
                htmlType='submit'
                block
              >
                {isCreate ? 'Create Holiday' : 'Update Holiday'}
              </Button>
              <Button onClick={handleModalClose} block>
                Cancel
              </Button>
            </Flex>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default HolidayForm
