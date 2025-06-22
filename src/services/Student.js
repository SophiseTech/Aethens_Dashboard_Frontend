import handleError from "@utils/handleError"
import { post } from "@utils/Requests"

class StudentService {
  async enroll({ username, email, password, role, address, center_id, course_id, DOB, phone, school_uni_work, profile_img }) {
    try {
      if (!username || !email || !password || !role || !address || !center_id || !course_id) throw new Error("Bad Data")
      const response = await post("/enrollment/create-student", {
        username,
        email,
        password,
        role,
        address,
        center_id,
        course_id,
        DOB,
        phone,
        school_uni_work,
        profile_img
      })
      if (!response || !response.data) throw new Error("An error occured. Please try again")
      return response
    } catch (error) {
      handleError(error)
    }
  }

  async getActiveSessions(studentId) {
    try {
      const response = await post(`/student/getActiveSessions`, { studentId })
      if (!response || !response.data) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async migrateStudentCourse(userId, studentId, newCourseId, migrateSlot) {
    try {
      const response = await post("/student/migrateStudentCourse", { userId, studentId, newCourseId, migrateSlot })
      if (!response) throw new Error("An error occured. Please try again")
    } catch (error) {
      handleError(error)
    }
  }
  async migrateStudentCenter(userId, newCenterId) {
    try {
      const response = await post("/student/migrateStudentCenter", { userId, newCenterId })
      if (!response) throw new Error("An error occured. Please try again")
    } catch (error) {
      handleError(error)
    }
  }

  async getCourseHistory(lastRef = 0, limit = 10, filters = {}) {
    try {
      const response = await post(`/courseHistory/list/all?lastRef=${lastRef}&limit=${limit}`, { filters })
      if (!response) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }


}

const studentService = new StudentService()
export default studentService