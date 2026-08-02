import dayjs from 'dayjs'
import React from 'react'

const statusLabel = {
  attended: { text: 'Attended', color: 'text-green-500' },
  absent: { text: 'Absent', color: 'text-red-500' },
  cancelled: { text: 'Cancelled', color: 'text-red-500' },
  requested: { text: 'Requested', color: 'text-yellow-500' },
  rescheduled: { text: 'Rescheduled', color: 'text-yellow-500' },
  booked: { text: 'Upcoming', color: 'text-yellow-500' },
}

function TimetableSessionList({ slots }) {
  const today = dayjs()

  const sorted = [...(slots || [])].sort((a, b) => new Date(a.start_date) - new Date(b.start_date))

  return (
    <div className='bg-card p-4 rounded-3xl flex-1 flex flex-col gap-3 overflow-auto'>
      <h1 className='font-bold | text-sm 2xl:text-xl'>Sessions</h1>

      <div className='flex flex-col gap-3 flex-1 overflow-auto no-scrollbar'>
        {sorted.length === 0 && (
          <p className='text-gray-500 text-xs 2xl:text-sm'>No sessions scheduled this month.</p>
        )}
        {sorted.map((item) => (
          <SessionItem key={item._id} item={item} isToday={dayjs(item.start_date).isSame(today, 'day')} />
        ))}
      </div>
    </div>
  )
}

const SessionItem = ({ item, isToday }) => {
  const dateObj = dayjs(item.start_date)
  const status = statusLabel[item.status] || { text: item.status, color: 'text-gray-500' }

  return (
    <div className={`flex items-center justify-between | p-1 2xl:p-3 ${isToday ? 'bg-stone-200 rounded-xl' : ''}`}>
      <div className='flex gap-3 flex-1 items-center'>
        <div className='bg-accent p-2 rounded-full w-[13%] aspect-square flex items-center justify-center'>
          <img src="/icons/alarm.svg" alt="alarm" className='w-3/4 h-fw-3/4' />
        </div>
        <div className='flex flex-col justify-center'>
          <p className={`${status.color} | max-2xl:text-[0.6rem]`}>{status.text}</p>
          <h1 className='font-bold | text-xs 2xl:text-xl'>{item.subjectName || 'Session'}</h1>
          <p className='text-gray-500 | max-2xl:text-[0.6rem] text-xs'>{dateObj.format('D MMM, YYYY')}{item.faculty_id?.username ? ` · ${item.faculty_id.username}` : ''}</p>
        </div>
      </div>
      <p className='text-gray-500 font-bold | text-xs 2xl:text-lg'>{dateObj.format('h:mm A')}</p>
    </div>
  )
}

export default TimetableSessionList
