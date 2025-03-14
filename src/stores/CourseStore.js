
import courseService from "@/services/Course"
import handleInternalError from "@utils/handleInternalError"
import { create } from "zustand"

const courseStore = create((set, get) => ({
  course: {},
  loading: true,
  courses: [],
  createLoading: false,
  lastRefKey: 0,
  total: 0,
  getCourse: async (id, filters = {}) => {
    try {
      set({ loading: true })
      if (!id) throw new Error("Bad Data")
      const { courses } = get()
    // Check if course already exist in state
      if (courses && courses.length > 0) {
        const existingCourse = courses.find(course => course._id === id)
        if (existingCourse) {
          set({ course: existingCourse })
          return existingCourse
        }
      }
      const course = await courseService.getById(id, filters)
      if (course) {
        set({ course: course })
        return course
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ loading: false })
    }
  },
  getCourses: async (limit = 10, filters = {}) => {
    try {
      set({ loading: true })
      const { lastRefKey, courses: prevCourses } = get()
      const { courses, total } = await courseService.getCourses(
        filters,
        lastRefKey,
        limit
      )
      if (courses) {
        set({
          courses: [...prevCourses, ...courses],
          lastRefKey: lastRefKey + courses.length,
          total: total
        })
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ loading: false })
    }
  }
}))

export default courseStore