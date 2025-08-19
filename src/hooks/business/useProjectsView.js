import { useFinalProject } from "@hooks/useFinalProject";
import useUser from "@hooks/useUser";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

function useProjectsView() {
  const { user } = useUser();
  const { studentId } = useParams()
  const { listProjects, projectsInfo, loading } = useFinalProject()
  
  const viewContext = {
    userRole: user.role,
    isManagerView: user.role === 'manager',
    targetStudentId: studentId || user._id,
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
    viewContext
  }
}

export default useProjectsView