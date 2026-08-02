import { useFinalProject } from "@hooks/useFinalProject"
import useUser from "@hooks/useUser"
import studentStore from "@stores/StudentStore"
import { useEffect, useMemo } from "react"

function useStudentDashboardView() {
  const { getLatestSubmission, latestSubmission, loading: latestSubmissionLoading } = useFinalProject()
  const { user } = useUser()
  const { getMyEnrollment, enrollment, enrollmentLoading } = studentStore()

  useEffect(() => {
    getLatestSubmission({
      query: { studentId: user._id },
      populate: "phaseId projectId",
      sort: { createdAt: -1 },
      options: {
        select: "status phaseId projectId"
      }
    })
    getMyEnrollment(user._id)
  }, [])

  const isDiploma = enrollment?.courseType === "diploma"

  const dashboardInfo = {
    finalProject: {
      project: latestSubmission?.projectId,
      phase: latestSubmission?.phaseId,
      latestSubmission,
      loading: latestSubmissionLoading
    },
    enrollment,
    enrollmentLoading,
    isDiploma
  }

  return { dashboardInfo }
}

export default useStudentDashboardView