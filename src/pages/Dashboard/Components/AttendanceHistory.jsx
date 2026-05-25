import slotStore from '@stores/SlotStore'
import { Button, message, Modal } from 'antd'
import dayjs from 'dayjs'
import React from 'react'

function AttendanceHistory({ records }) {
  const today = new Date()

  const filteredAndSortedRecords = (records || [])
    .filter((item) => {
      const date = new Date(item.start_date)

      // keep only current month + current year
      return (
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      )
    })
    .sort((a, b) => {
      const aDate = new Date(a.start_date)
      const bDate = new Date(b.start_date)

      const isAToday = aDate.toDateString() === today.toDateString()
      const isBToday = bDate.toDateString() === today.toDateString()

      // prioritize today's items
      if (isAToday && !isBToday) return -1
      if (!isAToday && isBToday) return 1

      // then sort by full datetime
      return aDate - bDate
    })

  return (
    <div className='bg-card p-4 rounded-3xl flex-1 flex flex-col gap-3 overflow-auto'>
      <h1 className='font-bold | text-sm 2xl:text-xl'>Recent History</h1>

      <div className='flex flex-col gap-3 flex-1 overflow-auto no-scrollbar'>
        {filteredAndSortedRecords.map((item, index) => (
          <HistoryItem key={index} item={item} index={index} />
        ))}
      </div>
    </div>
  )
}

const HistoryItem = ({ item, index }) => {
  const dateObj = dayjs(item.start_date)
  const { markAbsent } = slotStore()
  return (
    <div className={`flex items-center justify-start | p-1 2xl:p-3 ${(index === 0 && dayjs(item.start_date).isSame(dayjs(), 'day')) && 'bg-stone-200 rounded-xl'}`}>
      <div className='flex gap-3 flex-1 items-center'>
        <div className='bg-accent p-2 rounded-full w-[13%] aspect-square flex items-center justify-center'>
          <img src="/icons/alarm.svg" alt="alarm" className='w-3/4 h-fw-3/4' />
        </div>
        <div className='flex flex-col justify-center'>
          {item?.status === "attended" ?
            <p className='text-green-500 | max-2xl:text-[0.6rem]'>On Time</p>
            :
            item?.status === "absent" ?
              <p className='text-red-500 | max-2xl:text-[0.6rem]'>Absent</p>
              :
              item?.status === "cancelled" ?
                <p className='text-red-500 | max-2xl:text-[0.6rem]'>Cancelled</p>
                :
                dayjs(item.start_date).isBefore(dayjs()) && item?.status === "booked" ?
                  <p className='text-red-500 | max-2xl:text-[0.6rem]'>Absent</p>
                  :
                  <p className='text-yellow-500 | max-2xl:text-[0.6rem]'>Upcoming</p>
          }
          <h1 className='font-bold | text-xs 2xl:text-xl'>{dateObj.format("D MMM, YYYY")}</h1>
        </div>
      </div>
      <div>
        <p className='text-gray-500 font-bold | text-xs 2xl:text-lg'>{dateObj.format("h:mm A")}</p>
        {dayjs(item.start_date).isAfter(dayjs()) && item.status === "booked" && (
          <Button variant='filled' color='orange' size='small' className='outline-none'
            onClick={() => {
              Modal.confirm({
                title: "Mark as Absent",
                content: "Are you sure you want to mark this slot as absent?",
                okText: "Yes",
                cancelText: "No",
                onOk: async () => {
                  try {
                    await markAbsent(item._id, "cancelled")
                    message.success("Slot marked as absent")
                  } catch (error) {
                    message.error("Failed to mark slot as absent")
                  }
                }
              })
            }}
          >Mark Absent</Button>
        )}
      </div>
    </div>
  )
}

export default AttendanceHistory