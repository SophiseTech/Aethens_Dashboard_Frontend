import studentStore from "@stores/StudentStore"

function useStudents() {

  const {
    getStudentsByCenter,
    getProjectOpenedStudents,

    students,
    loading,
    projectOpenedStudents
  } = studentStore()

  return {
    getStudentsByCenter,
    getProjectOpenedStudents,

    students,
    loading,
    projectOpenedStudents
  }
}

export default useStudents