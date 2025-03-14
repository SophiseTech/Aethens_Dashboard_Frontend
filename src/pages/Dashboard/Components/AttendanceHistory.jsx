import dayjs from 'dayjs'
import React from 'react'

function AttendanceHistory({records}) {
  return (
    <div className='bg-card p-4 rounded-3xl flex-1 flex flex-col gap-3 overflow-auto'>
      <h1 className='font-bold | text-sm 2xl:text-xl'>Recent History</h1>
      <div className='flex flex-col gap-3 flex-1 overflow-auto no-scrollbar'>
        {records?.map((item, index) => <HistoryItem key={index} item={item} />)}
      </div>
    </div>
  )
}

const HistoryItem = ({item}) => {
  const dateObj = dayjs(item.date)
  return (
    <div className='flex items-center justify-start | p-1 2xl:p-3'>
      <div className='flex gap-3 flex-1 items-center'>
        <div className='bg-accent p-2 rounded-full w-[13%] aspect-square flex items-center justify-center'>
          <img src="/icons/alarm.svg" alt="alarm" className='w-3/4 h-fw-3/4' />
        </div>
        <div className='flex flex-col justify-center'>
          <p className='text-green-500 | max-2xl:text-[0.6rem]'>On Time</p>
          <h1 className='font-bold | text-xs 2xl:text-xl'>{dateObj.format("D MMM, YYYY")}</h1>
        </div>
      </div>
      <div>
        <p className='text-gray-500 font-bold | text-xs 2xl:text-lg'>{dateObj.format("h:mm A")}</p>
      </div>
    </div>
  )
}

export default AttendanceHistory