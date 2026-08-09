import { CalendarOutlined } from '@ant-design/icons'
import AttendanceCalendar from '@pages/Dashboard/Components/AttendanceCalendar'
import { months } from '@utils/constants'
import { Spin } from 'antd'

function MonthlyReport({ slots, loading, month, width = "2xl:w-1/2 lg:w-3/4", className = "" }) {
  return (
    <div className={`flex flex-col gap-5 p-2 rounded-3xl border border-border h-fit ${width} ${className}`}>

      <div className='flex justify-between items-center | p-2 2xl:p-4 pb-0'>
        <h1 className='font-bold | text-sm 2xl:text-xl'>Attendance</h1>
        <div className='border border-secondary rounded-full px-3 py-1.5 flex gap-2 items-center'>
          <CalendarOutlined className='| text-[0.6rem] 2xl:text-sm' />
          <p className='| text-[.6rem] 2xl:text-xs capitalize'>{month}</p>
        </div>
      </div>

      {loading ? <div className='flex justify-center items-center w-full h-52'><Spin /> </div> : <AttendanceCalendar slots={slots} month={month} />}
    </div>
  )
}

export default MonthlyReport