import handleError from "@utils/handleError"
import { post } from "@utils/Requests"

class CourseService {
  async getById(id, filters) {
    try {
      const response = await post(`/course/getById/${id}`, {
        filters
      })
      if (!response || !response.data) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async getCourses(filters = {}, lastRefKey = 0, limit = 10) {
    try {
      const response = await post(`/course/getAll?lastRef=${lastRefKey}&limit=${limit}`, { filters })
      if (!response || !response.data) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async getStudentSyllabus(userId) {
    try {
      const response = await post(`/course/getStudentSyllabus/`, { userId })
      if (!response || !response.data) throw new Error("An error occured. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

}

const courseService = new CourseService()
export default courseService