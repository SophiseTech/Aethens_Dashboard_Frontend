import studentStore from "@stores/StudentStore"
import { generateHolidayDates, getHolidayInfo } from "@utils/helper"
import dayjs from "dayjs"
import { useCallback, useEffect, useMemo, useState } from "react"

const EMPTY_TIMETABLE = { batch: null, term: null, slots: [], holidays: [] }

function useDiplomaTimetable(studentId) {
  const {
    getMyTimetable, timetable, timetableLoading,
    getStudentTimetable, studentTimetable, studentTimetableLoading,
  } = studentStore()
  const [displayMonth, setDisplayMonth] = useState(() => dayjs().startOf("month"))

  const activeTimetable = studentId ? (studentTimetable || EMPTY_TIMETABLE) : timetable
  const activeLoading = studentId ? studentTimetableLoading : timetableLoading

  useEffect(() => {
    if (studentId) {
      getStudentTimetable(studentId, displayMonth.month() + 1, displayMonth.year())
    } else {
      getMyTimetable(displayMonth.month() + 1, displayMonth.year())
    }
  }, [displayMonth, studentId])

  const sessionsByDate = useMemo(() =>
    (activeTimetable.slots || []).reduce((acc, slot) => {
      const date = dayjs(slot.start_date).format("YYYY-MM-DD")
        ; (acc[date] ??= []).push(slot)
      return acc
    }, {}),
    [activeTimetable.slots]
  )

  const holidayDates = useMemo(() =>
    generateHolidayDates(activeTimetable.holidays, displayMonth.year()),
    [activeTimetable.holidays, displayMonth]
  )

  const getHolidayForDate = useCallback(
    (dateStr) => getHolidayInfo(dateStr, activeTimetable.holidays, displayMonth.year()),
    [activeTimetable.holidays, displayMonth]
  )

  const goToPrevMonth = useCallback(() => {
    setDisplayMonth((prev) => prev.subtract(1, "month"))
  }, [])

  const goToNextMonth = useCallback(() => {
    setDisplayMonth((prev) => prev.add(1, "month"))
  }, [])

  return {
    batch: activeTimetable.batch,
    term: activeTimetable.term,
    slots: activeTimetable.slots,
    holidays: activeTimetable.holidays,
    loading: activeLoading,
    displayMonth,
    sessionsByDate,
    holidayDates,
    getHolidayForDate,
    goToPrevMonth,
    goToNextMonth,
  }
}

export default useDiplomaTimetable
