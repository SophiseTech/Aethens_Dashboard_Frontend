import { useCallback, useEffect, useMemo } from "react"
import dayjs from "dayjs"
import { Modal } from "antd"
import _ from "lodash"
import courseStore from "@stores/CourseStore"
import slotStore from "@stores/SlotStore"
import studentStore from "@stores/StudentStore"
import userStore from "@stores/UserStore"
import useDiplomaTimetable from "@hooks/business/useDiplomaTimetable"
import { IST_TIMEZONE, toISTStartOfDayISO } from "@utils/helper"

// Slot statuses that still mean "this session is going to happen".
const UPCOMING_STATUSES = ["booked", "requested", "pending"]
const STATUS_NOTES = {
  requested: "Reschedule requested",
  pending: "Awaiting confirmation",
}
const UPCOMING_LIMIT = 4

const toSessionView = (slot, { title, place, canMarkAbsent }) => {
  const start = dayjs(slot.start_date).tz(IST_TIMEZONE)
  const end = slot.end_date ? dayjs(slot.end_date).tz(IST_TIMEZONE) : null
  const today = dayjs().tz(IST_TIMEZONE)

  let relativeDay = null
  if (start.isSame(today, "day")) relativeDay = "Today"
  else if (start.isSame(today.add(1, "day"), "day")) relativeDay = "Tomorrow"

  return {
    id: slot._id,
    title,
    place,
    weekday: start.format("dddd"),
    shortWeekday: start.format("ddd"),
    dayOfMonth: start.format("D"),
    dayMonth: start.format("D MMM"),
    fullDate: start.format("ddd, D MMM"),
    relativeDay,
    timeRange: end ? `${start.format("h:mm A")} – ${end.format("h:mm A")}` : start.format("h:mm A"),
    note: STATUS_NOTES[slot.status] || null,
    canMarkAbsent,
  }
}

const pickUpcoming = (slots) => {
  const now = dayjs()
  return (slots || [])
    .filter((slot) => UPCOMING_STATUSES.includes(slot.status) && dayjs(slot.start_date).isAfter(now))
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
}

// Regular (non-diploma) students: booked slots + session count against the course total.
export function useRegularSchedule() {
  const { user } = userStore()
  const { slots, loading, filters, getSlots, markAbsent, completedCount, getCompletedCount } = slotStore()
  const { course, getCourse } = courseStore()

  useEffect(() => {
    // The slot store is shared with the Sessions and Attendance pages; refetch
    // unless it already holds exactly this query (refetching the same query appends).
    const query = {
      booked_student_id: user._id,
      start_date: { $gte: toISTStartOfDayISO(dayjs().startOf("month")) },
      course_id: user?.details_id?.course_id?._id || user?.details_id?.course_id,
      isActive: true,
    }
    if (!slots?.length || !_.isEqual(filters?.query, query)) {
      getSlots(0, { sort: { start_date: -1 }, query, populate: "center_id session" })
    }
    if (_.isEmpty(course) && user?.details_id?.course_id) {
      getCourse(user.details_id.course_id)
    }
    getCompletedCount()
  }, [])

  const upcoming = useMemo(
    () =>
      pickUpcoming(slots).map((slot) =>
        toSessionView(slot, {
          title: course?.course_name || "Class",
          place: slot.center_id?.center_name || null,
          canMarkAbsent: slot.status === "booked",
        }),
      ),
    [slots, course?.course_name],
  )

  const done = completedCount?.regularCount || 0
  const total = course?.total_session || 0

  const confirmMarkAbsent = useCallback(
    (session) => {
      Modal.confirm({
        title: "Mark yourself absent?",
        content: `You won't be expected at the ${session.fullDate} session (${session.timeRange}).`,
        okText: "Mark absent",
        cancelText: "Keep session",
        okButtonProps: { danger: true },
        onOk: () => markAbsent(session.id, "cancelled"),
      })
    },
    [markAbsent],
  )

  return {
    loading: loading && upcoming.length === 0,
    nextSession: upcoming[0] || null,
    laterSessions: upcoming.slice(1, UPCOMING_LIMIT),
    progress: total
      ? { value: done, max: total, label: `${done} of ${total} sessions done` }
      : null,
    confirmMarkAbsent,
  }
}

// Diploma students: timetable slots for the month + term progress.
export function useDiplomaSchedule() {
  const { diplomaSummary, getMyDiplomaSummary } = studentStore()
  const { slots, loading } = useDiplomaTimetable()

  useEffect(() => {
    if (!diplomaSummary) getMyDiplomaSummary()
  }, [])

  const upcoming = useMemo(
    () =>
      pickUpcoming(slots).map((slot) =>
        toSessionView(slot, {
          title: slot.subjectName || "Class",
          place: slot.faculty_id?.username ? `With ${slot.faculty_id.username}` : null,
          canMarkAbsent: false,
        }),
      ),
    [slots],
  )

  const { currentTerm, totalTerms, sessionsCompleted } = diplomaSummary || {}

  return {
    loading: loading && upcoming.length === 0,
    nextSession: upcoming[0] || null,
    laterSessions: upcoming.slice(1, UPCOMING_LIMIT),
    progress: currentTerm && totalTerms
      ? {
          value: currentTerm,
          max: totalTerms,
          label: `Term ${currentTerm} of ${totalTerms}`,
          detail: `${sessionsCompleted ?? 0} sessions done`,
        }
      : null,
    confirmMarkAbsent: null,
  }
}
