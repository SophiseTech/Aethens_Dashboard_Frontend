import { useFinalProject } from "@hooks/useFinalProject";
import useUser from "@hooks/useUser";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function useProjectsView() {
  const { user } = useUser();
  const { studentId } = useParams()
  const { listProjects, projectsInfo, loading } = useFinalProject()
  const nav = useNavigate()

  const viewContext = {
    userRole: user.role,
    isManagerView: user.role === 'manager',
    targetStudentId: studentId || user._id,
  }

  const handleViewProjectDetails = (project) => {
    if (viewContext.isManagerView) {
      nav(`/manager/final-project/${project._id}/student/${studentId}/phases`)
    } else {
      nav(`/student/final-project/${project._id}/phases`)
    }
  }

  useEffect(() => {
    listProjects({
      query: { studentId: viewContext.targetStudentId, },
      populate: [
        {
          path: "studentId",
          select: "username"
        },
        {
          path: "facultyId",
          select: "username"
        },
        {
          path: 'courseId',
          select: "course_name"
        }
      ]
    })
  }, [viewContext.targetStudentId, projectsInfo.pagination]);


  return {
    projectsInfo,
    loading,
    viewContext,
    handleViewProjectDetails
  }
}

export default useProjectsView