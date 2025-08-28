import { useFinalProject } from "@hooks/useFinalProject"
import useUser from "@hooks/useUser"
import { useEffect, useMemo } from "react"

function useStudentDashboardView() {
  const { getLatestSubmission, latestSubmission, loading: latestSubmissionLoading } = useFinalProject()
  const { user } = useUser()

  useEffect(() => {
    getLatestSubmission({
      query: { studentId: user._id },
      populate: "phaseId projectId",
      options: {
        select: "status phaseId projectId"
      }
    })
  }, [])

  const dashboardInfo = {
    finalProject: {
      project: latestSubmission?.projectId,
      phase: latestSubmission?.phaseId,
      latestSubmission,
      loading: latestSubmissionLoading
    }
  }

  return { dashboardInfo }
}

export default useStudentDashboardView