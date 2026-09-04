
import courseService from "@/services/Course"
import handleInternalError from "@utils/handleInternalError"
import _ from "lodash"
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
  },

  // Admin-specific method for page-based pagination (replaces courses array instead of appending)
  getCoursesForAdmin: async (limit = 10, page = 1, filters = {}) => {
    try {
      set({ loading: true })
      const lastRefKey = (page - 1) * limit
      const { courses, total } = await courseService.getCourses(
        { ...filters, query: filters.query || {} },
        lastRefKey,
        limit
      )
      if (courses) {
        set({
          courses: courses, // Replace instead of append
          total: total
        })
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ loading: false })
    }
  },

  // Filter-aware paginated course picker (e.g. enroll modal course Select).
  // Kept separate from `courses`/`lastRefKey`/`total` above, which many other
  // consumers share and reload unfiltered — mixing a filtered fetch into that
  // array would corrupt their pagination bookkeeping.
  pickerCourses: [],
  pickerTotal: 0,
  pickerLastRefKey: 0,
  pickerLoading: false,
  pickerFilters: {},

  getPickerCourses: async (filters = {}, loadMore = false) => {
    try {
      set({ pickerLoading: true })
      const { pickerLastRefKey, pickerCourses: prevCourses, pickerFilters: stateFilters } = get()
      const isNewFilter = !_.isEqual(stateFilters, filters)
      const lastRef = isNewFilter || !loadMore ? 0 : pickerLastRefKey
      const PICKER_PAGE_SIZE = 20

      const { courses, total } = await courseService.getCourses(filters, lastRef, PICKER_PAGE_SIZE)
      if (courses) {
        set({
          pickerCourses: (loadMore && !isNewFilter) ? [...prevCourses, ...courses] : courses,
          pickerTotal: total || 0,
          pickerLastRefKey: lastRef + courses.length,
          pickerFilters: filters,
        })
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ pickerLoading: false })
    }
  },

  // Admin CRUD operations
  searchQuery: '',
  searchResults: [],
  searchTotal: 0,

  searchCourses: async (query, limit = 10, page = 1) => {
    try {
      set({ loading: true, searchQuery: query })
      const filters = {
        query: { course_name: { $regex: query, $options: 'i' } }
      }
      const lastRefKey = (page - 1) * limit
      const { courses, total } = await courseService.getCourses(filters, lastRefKey, limit)

      if (courses) {
        set({
          searchResults: courses || [],
          searchTotal: total || 0,
        })
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
      const response = await courseService.createCourse(courseData)

      if (response) {
        // Reload courses using admin pagination (page 1)
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
      const response = await courseService.updateCourse(courseId, courseData)

      if (response) {
        // Reload courses using admin pagination (page 1)
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

  deleteCourse: async (courseId) => {
    try {
      set({ loading: true })
      const response = await courseService.deleteCourse(courseId)

      if (response) {
        // Reload courses using admin pagination (page 1)
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

  clearSearch: () => {
    set({ searchQuery: '', searchResults: [], searchTotal: 0 })
  },

  resetPagination: () => {
    set({ lastRefKey: 0, courses: [] })
  },
}))

export default courseStore