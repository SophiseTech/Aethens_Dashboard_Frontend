import studentStore from "@stores/StudentStore"
import { generateHolidayDates, getHolidayInfo } from "@utils/helper"
import dayjs from "dayjs"
import { useCallback, useEffect, useMemo, useState } from "react"

function useDiplomaTimetable() {
  const { getMyTimetable, timetable, timetableLoading } = studentStore()
  const [displayMonth, setDisplayMonth] = useState(() => dayjs().startOf("month"))

  useEffect(() => {
    getMyTimetable(displayMonth.month() + 1, displayMonth.year())
  }, [displayMonth])

  const sessionsByDate = useMemo(() =>
    (timetable.slots || []).reduce((acc, slot) => {
      const date = dayjs(slot.start_date).format("YYYY-MM-DD")
        ; (acc[date] ??= []).push(slot)
      return acc
    }, {}),
    [timetable.slots]
  )

  const holidayDates = useMemo(() =>
    generateHolidayDates(timetable.holidays, displayMonth.year()),
    [timetable.holidays, displayMonth]
  )

  const getHolidayForDate = useCallback(
    (dateStr) => getHolidayInfo(dateStr, timetable.holidays, displayMonth.year()),
    [timetable.holidays, displayMonth]
  )

  const goToPrevMonth = useCallback(() => {
    setDisplayMonth((prev) => prev.subtract(1, "month"))
  }, [])

  const goToNextMonth = useCallback(() => {
    setDisplayMonth((prev) => prev.add(1, "month"))
  }, [])

  return {
    batch: timetable.batch,
    term: timetable.term,
    slots: timetable.slots,
    holidays: timetable.holidays,
    loading: timetableLoading,
    displayMonth,
    sessionsByDate,
    holidayDates,
    getHolidayForDate,
    goToPrevMonth,
    goToNextMonth,
  }
}

export default useDiplomaTimetable
