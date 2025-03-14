import { CalendarOutlined } from '@ant-design/icons'
import AttendanceCalendar from '@pages/Dashboard/Components/AttendanceCalendar'
import { months } from '@utils/constants'
import { Spin } from 'antd'

function MonthlyReport({ slots, loading, month }) {
  return (
    <div className='p-2 border border-border rounded-3xl flex flex-col gap-5 h-fit | w-full lg:w-4/12'>

      <div className='flex justify-between items-center | p-2 2xl:p-4 pb-0'>
        <h1 className='font-bold | text-sm 2xl:text-xl'>Attendance</h1>
        <div className='border border-secondary rounded-full px-3 py-1.5 flex gap-2 items-center'>
          <CalendarOutlined className='| text-[0.6rem] 2xl:text-sm' />
          <p className='| text-[.6rem] 2xl:text-xs capitalize'>{month}</p>
        </div>
      </div>

      {loading ? <div className='w-full h-52 flex items-center justify-center'><Spin /> </div> : <AttendanceCalendar slots={slots} month={month} />}
    </div>
  )
}

export default MonthlyReport