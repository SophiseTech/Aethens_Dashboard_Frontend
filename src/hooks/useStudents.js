import studentStore from "@stores/StudentStore"
import { useMemo } from "react"

function useStudents() {

  const {
    getStudentsByCenter,
    getProjectOpenedStudents,

    students,
    loading,
    projectOpenedStudents
  } = studentStore()

  const studentOptions = useMemo(() => students?.map(student => ({ label: student.username, value: student._id })), [students]) || []

  return {
    getStudentsByCenter,
    getProjectOpenedStudents,

    students,
    loading,
    studentOptions,
    projectOpenedStudents
  }
}

export default useStudents