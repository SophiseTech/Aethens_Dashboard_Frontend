import useModal from '@hooks/useModal'
import SlotItem from '@pages/Slots/Components/SlotItem'
import SlotRescheduleModal from '@pages/Slots/Components/SlotRescheduleModal'
import slotStore from '@stores/SlotStore'
import _ from 'lodash'
import React, { useState, useEffect } from 'react'
import { useStore } from 'zustand'
import { Select } from 'antd'
import dayjs from 'dayjs'

function SlotList({ groupedSlots, slots = [] }) {
  const { reschedulingSlot, reshceduleSlot } = useStore(slotStore)
  const months = Object.keys(groupedSlots)

  // Determine default selected month
  const currentMonth = dayjs().format('MMMM YYYY')
  const defaultMonth = months.includes(currentMonth) ? currentMonth : months[months.length - 1] || null

  const [selectedMonth, setSelectedMonth] = useState(defaultMonth)

  useEffect(() => {
    setSelectedMonth(defaultMonth)
  }, [groupedSlots])

  const now = dayjs();

  const upcomingIndex = groupedSlots[selectedMonth]?.findIndex(slot => {
    const datePart = dayjs(slot.start_date).format('YYYY-MM-DD');
    const timePart = dayjs(slot.session?.start_time).format('HH:mm:ss');
    const slotDateTime = dayjs(`${datePart} ${timePart}`);

    return slotDateTime.isAfter(now);
  });


  const getType = (status, index) => {
    if (status === "requested") return "requested"
    if (status === "absent") return "absent"
    if (status === "cancelled") return "cancelled"
    if (status === "attended") return "completed"
    if (dayjs(selectedMonth, "MMMM YYYY").month() > dayjs().month()) return "normal"
    if (index < upcomingIndex || upcomingIndex < 0) {
      if (status === "booked" || status === "absent") return "absent"
    }
    if (index === upcomingIndex) return "upcoming";
    return "normal"
  }

  const handleRescheduleSlot = async (values) => {
    await reshceduleSlot({
      current_slot: reschedulingSlot,
      requested_slot: values?.requested_slot
    })
  }

  const { handleCancel, handleOk, isModalOpen, showModal } = useModal(handleRescheduleSlot)

  if (_.isEmpty(groupedSlots)) return <p>No Slots allotted</p>

  return (
    <div className='flex flex-col gap-5'>
      <Select
        className='w-1/4 mb-3 | max-lg:w-full'
        value={selectedMonth}
        onChange={setSelectedMonth}
        options={months.map(month => ({ value: month, label: month }))}
        placeholder='Select Month'
        variant='filled'
      />

      {selectedMonth && groupedSlots[selectedMonth] ? (
        <div>
          <h1 className='font-bold text-gray-500 mb-2 | text-sm 2xl:text-lg'>{selectedMonth}</h1>
          <div className='flex flex-col gap-3'>
            {groupedSlots[selectedMonth]?.map((slot, slotIndex) => (
              <SlotItem
                {...slot}
                key={slotIndex}
                type={getType(slot.status, slotIndex)}
                showModal={showModal}
                slotType={slot.type}
              />
            ))}
          </div>
        </div>
      ) : (
        <p>No Slots allotted</p>
      )}

      <SlotRescheduleModal handleOk={handleOk} isModalOpen={isModalOpen} handleCancel={handleCancel} studentsSlots={slots} />
    </div>
  )
}

export default SlotList
