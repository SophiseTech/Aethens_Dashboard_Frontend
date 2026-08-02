import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import DiplomaTimetableCalendar from '@pages/Dashboard/Components/DiplomaTimetableCalendar'
import TimetableSessionList from '@pages/Dashboard/Components/TimetableSessionList'
import useDiplomaTimetable from '@hooks/business/useDiplomaTimetable'
import React from 'react'

function DiplomaTimetable() {
  const {
    batch,
    term,
    slots,
    displayMonth,
    sessionsByDate,
    holidayDates,
    getHolidayForDate,
    goToPrevMonth,
    goToNextMonth,
  } = useDiplomaTimetable()

  return (
    <div className='p-2 border border-border rounded-3xl flex flex-col gap-5 | w-full lg:w-5/12'>

      <div className='flex justify-between items-center | p-2 2xl:p-4 pb-0'>
        <div className='flex flex-col'>
          <h1 className='font-bold | text-sm 2xl:text-xl'>Timetable</h1>
          {batch?.name && (
            <p className='text-gray-500 | text-[0.6rem] 2xl:text-xs'>{batch.name}{term ? ` · Term ${term}` : ''}</p>
          )}
        </div>
        <div className='border border-secondary rounded-full px-2 py-1.5 flex gap-2 items-center'>
          <LeftOutlined className='cursor-pointer | text-[0.6rem] 2xl:text-sm' onClick={goToPrevMonth} />
          <p className='| text-[.6rem] 2xl:text-xs'>{displayMonth.format('MMM YYYY')}</p>
          <RightOutlined className='cursor-pointer | text-[0.6rem] 2xl:text-sm' onClick={goToNextMonth} />
        </div>
      </div>

      <DiplomaTimetableCalendar
        displayMonth={displayMonth}
        sessionsByDate={sessionsByDate}
        holidayDates={holidayDates}
        getHolidayForDate={getHolidayForDate}
      />
      <TimetableSessionList slots={slots} />
    </div>
  )
}

export default DiplomaTimetable
