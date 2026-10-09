import { useFinalProject } from "@hooks/useFinalProject"
import useUser from "@hooks/useUser"
import studentStore from "@stores/StudentStore"
import { useEffect, useMemo, useRef } from "react"

function useStudentDashboardView() {
  const { getLatestSubmission, latestSubmission, loading: latestSubmissionLoading } = useFinalProject()
  const { user } = useUser()
  const { getMyEnrollment, enrollment, enrollmentLoading } = studentStore()
  const enrollmentRequested = useRef(false)

  useEffect(() => {
    getLatestSubmission({
      query: { studentId: user._id },
      populate: "phaseId projectId",
      sort: { createdAt: -1 },
      options: {
        select: "status phaseId projectId"
      }
    })
    enrollmentRequested.current = true
    getMyEnrollment(user._id)
  }, [])

  const isDiploma = enrollment?.courseType === "diploma"
  // True once we know whether this is a diploma student, so views that differ by
  // course type don't mount the wrong one first and fire its requests.
  const enrollmentResolved = Boolean(enrollment) || (enrollmentRequested.current && !enrollmentLoading)

  const dashboardInfo = {
    finalProject: {
      project: latestSubmission?.projectId,
      phase: latestSubmission?.phaseId,
      latestSubmission,
      loading: latestSubmissionLoading
    },
    enrollment,
    enrollmentLoading,
    enrollmentResolved,
    isDiploma
  }

  return { dashboardInfo }
}

export default useStudentDashboardView