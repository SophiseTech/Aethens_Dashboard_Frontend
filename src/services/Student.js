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

}

const studentService = new StudentService()
export default studentService