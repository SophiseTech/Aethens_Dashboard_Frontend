import { useEffect, useMemo } from "react"
import { useStore } from "zustand"
import _ from "lodash"
import activitiesStore from "@stores/ActivitiesStore"
import billStore from "@stores/BillStore"
import userStore from "@stores/UserStore"
import useStudentAnnouncements from "@hooks/useStudentAnnouncements"
import { BILL_STATUS, BILL_STATUS_TAGS } from "@utils/constants"
import { formatDate } from "@utils/helper"

const BILLS_SHOWN = 3
const PROJECT_STATUS = {
  approved: { label: "Approved", tone: "positive", hint: "Your last submission was approved." },
  under_review: { label: "In review", tone: "neutral", hint: "Your faculty is reviewing your last submission." },
  rejected: { label: "Changes needed", tone: "attention", hint: "Check the feedback and submit again." },
  not_started: { label: "Not started", tone: "neutral", hint: "Open the phase to start working on it." },
}

// Everything on the student home screen below the schedule: latest announcement,
// latest faculty update, final project status and recent bills.
function useStudentHomeFeed(finalProject) {
  const { user } = useStore(userStore)
  const { activities, loading: activitiesLoading, filters: activityFilters, getActivities } = useStore(activitiesStore)
  const { bills, loading: billsLoading, filters: billFilters, getBills } = billStore()
  const { announcements, loading: announcementsLoading } = useStudentAnnouncements()

  useEffect(() => {
    // These stores are shared with the Activities and Bills pages; refetch unless
    // they already hold exactly this query (refetching the same query appends).
    const activityQuery = { student_id: user._id, resource: { $exists: false } }
    if (!activities?.length || !_.isEqual(activityFilters?.query, activityQuery)) {
      getActivities(1, {
        query: activityQuery,
        populate: { path: "faculty_id", options: { select: "username _id email profile_img" } },
        sort: "-createdAt",
      })
    }
    const billQuery = { generated_for: user._id }
    if (!bills?.length || !_.isEqual(billFilters?.query, billQuery)) {
      getBills(5, {
        query: billQuery,
        populate: [
          { path: "generated_for", populate: { path: "details_id", model: "Student" } },
          { path: "generated_by" },
          { path: "items.item" },
        ],
      })
    }
  }, [])

  const announcement = announcements?.[0]
    ? { title: announcements[0].title, body: announcements[0].body }
    : null

  const latestUpdate = activities?.[0]
    ? {
        title: activities[0].title,
        body: activities[0].remarks,
        from: activities[0].faculty_id?.username || null,
      }
    : null

  const project = useMemo(() => {
    const { project: info, phase, latestSubmission } = finalProject || {}
    if (!info?._id) return null
    return {
      title: phase?.title ? `${info.title} · ${phase.title}` : info.title,
      status: PROJECT_STATUS[latestSubmission?.status] || null,
      deadline: latestSubmission?.status === "approved" && info.endDate ? formatDate(info.endDate) : null,
      path: phase?._id ? `/student/final-project/${info._id}/phase/${phase._id}` : "/student/final-project",
    }
  }, [finalProject])

  const recentBills = useMemo(
    () =>
      (bills || [])
        .filter((bill) => bill.status !== BILL_STATUS.DRAFT)
        .slice(0, BILLS_SHOWN)
        .map((bill) => ({
          id: bill._id,
          title: bill.subject || "Invoice",
          reference: bill.invoiceNo ? `Bill no. ${bill.invoiceNo}` : null,
          amount: `₹${Number(bill.total || 0).toLocaleString("en-IN")}`,
          statusLabel: BILL_STATUS_TAGS[bill.status]?.label || bill.status,
          isUnpaid: bill.status === BILL_STATUS.UNPAID,
        })),
    [bills],
  )

  return {
    announcement,
    announcementsLoading,
    latestUpdate,
    activitiesLoading,
    project,
    projectLoading: Boolean(finalProject?.loading),
    recentBills,
    billsLoading,
  }
}

export default useStudentHomeFeed
