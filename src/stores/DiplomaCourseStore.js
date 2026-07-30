import diplomaCourseService from "@/services/DiplomaCourse"
import handleInternalError from "@utils/handleInternalError"
import { create } from "zustand"

const diplomaCourseStore = create((set, get) => ({
  courses: [],
  loading: true,
  createLoading: false,
  total: 0,

  getCoursesForAdmin: async (limit = 10, page = 1) => {
    try {
      set({ loading: true })
      const { courses, total } = await diplomaCourseService.listCourses({ page, limit })
      if (courses) {
        set({ courses, total })
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ loading: false })
    }
  },

  createCourse: async (courseData) => {
    try {
      set({ createLoading: true })
      const response = await diplomaCourseService.createCourse(courseData)
      if (response) {
        await get().getCoursesForAdmin(10, 1)
      }
      return response
    } catch (error) {
      handleInternalError(error)
      throw error
    } finally {
      set({ createLoading: false })
    }
  },

  updateCourse: async (courseId, courseData) => {
    try {
      set({ loading: true })
      const response = await diplomaCourseService.updateCourse(courseId, courseData)
      if (response) {
        await get().getCoursesForAdmin(10, 1)
      }
      return response
    } catch (error) {
      handleInternalError(error)
      throw error
    } finally {
      set({ loading: false })
    }
  },
}))

export default diplomaCourseStore
