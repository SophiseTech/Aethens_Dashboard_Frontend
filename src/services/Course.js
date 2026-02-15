import handleError from "@utils/handleError"
import { post, put, del } from "@utils/Requests"

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

  async getStudentSyllabus(userId, filters = {}) {
    try {
      // Build query params
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }
      if (filters.search) {
        params.append('search', filters.search);
      }

      const queryString = params.toString();
      const url = `/course/getStudentSyllabus/${queryString ? '?' + queryString : ''}`;
      const response = await post(url, { userId });
      if (!response || !response.data) throw new Error("An error occured. Please try again");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

  async createCourse(courseData) {
    try {
      const response = await post('/course/create', courseData)
      if (!response || !response.data) throw new Error("An error occurred. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async updateCourse(courseId, courseData) {
    try {
      const response = await put(`/course/edit/${courseId}`, courseData)
      if (!response || !response.data) throw new Error("An error occurred. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

  async deleteCourse(courseId) {
    try {
      const response = await del(`/course/delete/${courseId}`)
      if (!response || !response.data) throw new Error("An error occurred. Please try again")
      return response.data
    } catch (error) {
      handleError(error)
    }
  }

}

const courseService = new CourseService()
export default courseService