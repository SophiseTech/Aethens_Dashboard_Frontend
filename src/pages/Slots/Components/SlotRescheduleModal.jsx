import CustomDatePicker from '@components/form/CustomDatePicker';
import CustomForm from '@components/form/CustomForm';
import CustomSelect from '@components/form/CustomSelect';
import CustomSlotPicker from '@components/form/CustomSlotPicker';
import CustomSubmit from '@components/form/CustomSubmit';
import SessionStore from '@stores/SessionStore';
import slotStore from '@stores/SlotStore';
import { getNextAvailableWeekdayDate } from '@utils/helper';
// import { getNextWeekdayDate } from '@utils/helper';
import { Form, Modal } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react'
import { useStore } from 'zustand';

function SlotRescheduleModal({ isModalOpen, handleOk, handleCancel, studentsSlots = [] }) {
  const [form] = Form.useForm();
  const { getAvailableSessions, availableSessions, loading } = useStore(SessionStore)
  const { reschedulingSlot } = slotStore()

  useEffect(() => {
    getAvailableSessions()
  }, [])

  const initialValues = {
    session: {}
  }

  const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const slotOptions = useMemo(() => availableSessions?.map(session => ({
    label: `${weekDays[session.weekDay]} - ${dayjs(session.start_time).format("h:mm A")}`,
    value: session._id
  })), [availableSessions])

  const handleSubmit = async (values) => {
    const session = availableSessions.find(session => session._id === values.session)
    const nextDate = getNextAvailableWeekdayDate(session.weekDay, studentsSlots, reschedulingSlot, session)
    nextDate.setHours(dayjs(session.start_time).hour())
    nextDate.setMinutes(dayjs(session.start_time).minute())
    values.requested_slot = {
      date: nextDate,
      session: session._id
    }
    await handleOk(values)
  }


  return (
    <Modal title={"Reschedule Slot"} open={isModalOpen} footer={null} onCancel={handleCancel}>
      <CustomForm form={form} initialValues={initialValues} action={handleSubmit}>
        <CustomSelect name={"session"} label={"Select New Slot"} options={slotOptions} />
        <CustomSubmit className='bg-primary' label='Submit' loading={loading} />
      </CustomForm>
    </Modal>
  )
}

export default SlotRescheduleModal