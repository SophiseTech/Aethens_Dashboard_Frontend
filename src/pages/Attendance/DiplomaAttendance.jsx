import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import Title from '@components/layouts/Title'
import DiplomaTimetableCalendar from '@pages/Dashboard/Components/DiplomaTimetableCalendar'
import TimetableSessionList from '@pages/Dashboard/Components/TimetableSessionList'
import useDiplomaTimetable from '@hooks/business/useDiplomaTimetable'
import studentStore from '@stores/StudentStore'
import { formatDate } from '@utils/helper'
import { Avatar, Flex } from 'antd'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

function DiplomaAttendance() {
  const { id } = useParams()
  const {
    activeStudent, getStudentById,
    studentDiplomaSummary, getStudentDiplomaSummary,
  } = studentStore()

  const {
    slots,
    displayMonth,
    sessionsByDate,
    holidayDates,
    getHolidayForDate,
    goToPrevMonth,
    goToNextMonth,
  } = useDiplomaTimetable(id)

  useEffect(() => {
    if (id && id !== activeStudent?._id) {
      getStudentById(id, {})
    }
    getStudentDiplomaSummary(id)
  }, [id])

  const summary = studentDiplomaSummary || {}

  return (
    <Title title="Diploma Attendance">
      <div className="flex flex-col gap-5">
        <Flex align="center" gap={16} className="p-4 rounded-2xl border border-border" wrap>
          <Avatar size={48} src={activeStudent?.profile_img} />
          <div className="flex flex-col">
            <h1 className="text-lg font-bold">{activeStudent?.username || '—'}</h1>
            <p className="text-sm text-gray-500">
              {summary.courseName}
              {summary.batchName ? ` · ${summary.batchName}` : ''}
              {summary.currentTerm ? ` · Term ${summary.currentTerm}${summary.totalTerms ? ` of ${summary.totalTerms}` : ''}` : ''}
            </p>
          </div>
          <div className="flex gap-10 ml-auto">
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold">{summary.sessionsCompleted ?? 0}</span>
              <span className="text-xs text-gray-400">Sessions Completed</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold">
                {summary.nextSession?.start_date ? formatDate(summary.nextSession.start_date) : '—'}
              </span>
              <span className="text-xs text-gray-400">Next Session</span>
            </div>
          </div>
        </Flex>

        <Flex align="center" justify="flex-end" gap={10}>
          <LeftOutlined className="cursor-pointer" onClick={goToPrevMonth} />
          <span className="font-medium">{displayMonth.format('MMMM YYYY')}</span>
          <RightOutlined className="cursor-pointer" onClick={goToNextMonth} />
        </Flex>

        <Flex gap={20} className="max-lg:flex-col">
          <div className="lg:w-1/2">
            <DiplomaTimetableCalendar
              displayMonth={displayMonth}
              sessionsByDate={sessionsByDate}
              holidayDates={holidayDates}
              getHolidayForDate={getHolidayForDate}
            />
          </div>
          <div className="lg:w-1/3">
            <TimetableSessionList slots={slots} />
          </div>
        </Flex>
      </div>
    </Title>
  )
}

export default DiplomaAttendance
