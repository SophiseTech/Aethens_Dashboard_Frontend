
import courseService from "@/services/Course"
import studentService from "@/services/Student"
import userService from "@/services/User"
import userStore from "@stores/UserStore"
import { ROLES } from "@utils/constants"
import handleInternalError from "@utils/handleInternalError"
import handleSuccess from "@utils/handleSuccess"
import { create } from "zustand"

const studentStore = create((set, get) => ({
  students: [],
  loading: true,
  lastRefKey: 0,
  total: 0,
  student: {},
  searchResults: [],
  searchLastRefKey: 0,
  searchTotal: 0,
  syllabus: [],
  searchQuery: "",
  currentSessionAttendees: [],
  activeStudentSessions: {},
  projectOpenedStudents: [],
  getStudentsByCenter: async (limit = 10, page = 1, status = null, courseId = null, fromBranch = null, toBranch = null) => {
    try {
      set({ loading: true });

      console.log("📤 Fetching students:", { limit, page, status, courseId, fromBranch, toBranch });

      const { user } = userStore.getState();
      if (user.role !== ROLES.MANAGER && user.role !== ROLES.FACULTY) {
        throw new Error("Unauthorized");
      }

      // Calculate the offset based on the page number and limit
      const offset = (page - 1) * limit;

      // Fetch users with pagination and optional status filter
      const { users, total } = await userService.getByRoleByCenter(
        ROLES.STUDENT,
        user.center_id,
        offset, // Pass the offset for pagination
        limit,
        status, // Pass the status filter
        courseId, // Pass the course filter
        fromBranch, // Pass the fromBranch filter
        toBranch // Pass the toBranch filter
      );

      if (users) {
        // Replace the existing students with the new data for the current page
        console.log("📥 Received students:", users.length, "Total:", total);
        set({ students: users, total });
      }
    } catch (error) {
      handleInternalError(error);
    } finally {
      set({ loading: false });
    }
  },
  getCurrentSessionAttendees: async () => {
    try {
      set({ loading: true })
      const users = await userService.getCurrentSessionAttendees()
      if (users) {
        users.sort((a, b) => b.isPresent - a.isPresent);
        set({ currentSessionAttendees: users })
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ loading: false })
    }
  },
  enroll: async (data) => {
    try {
      set({ loading: true })
      const { students } = get()
      const { user } = userStore.getState()
      if (user.role !== ROLES.MANAGER && user.role !== ROLES.ADMIN) throw new Error("Unauthorized")
      const response = await studentService.enroll(data)
      set({ students: [...students, response.data] })
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ loading: false })
    }
  },
  getStudentSyllabus: async (userId) => {
    try {
      set({ loading: true })
      const response = await courseService.getStudentSyllabus(userId)
      set({ syllabus: response })
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ loading: false })
    }
  },
  search: async (limit, filters = {}, page = 1) => {
    try {
      set({ loading: true });

      // Calculate the offset based on the page number and limit
      const offset = (page - 1) * limit;

      // Fetch search results with pagination parameters
      const { users, total } = await userService.search(
        offset, // Pass the offset for pagination
        limit,
        filters
      );

      if (users) {
        // Replace the existing search results with the new data for the current page
        set({
          searchResults: users,
          searchTotal: total,
          searchQuery: filters.searchQuery,
        });
      }
    } catch (error) {
      handleInternalError(error);
    } finally {
      set({ loading: false });
    }
  },
  setSearchQuery: (query) => set({ searchQuery: query }),
  editUser: async (id, updateData) => {
    try {
      set({ loading: true })
      if (!id || !updateData) throw new Error("Bad Data")
      const { students, searchResults, searchQuery } = get()
      const student = await userService.edit(id, updateData)
      if (student) {
        if (searchQuery) {
          const updatedSearchResults = searchResults?.map(item => (
            item._id === student._id ? { ...item, ...updateData } : item
          ))
          set({ searchResults: updatedSearchResults })
        } else {
          const updatedStudents = students?.map(item => (
            item._id === student._id ? { ...item, ...updateData } : item
          ))
          set({ students: updatedStudents })
        }
        handleSuccess("User details updated Succesfully")
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ loading: false })
    }
  },
  deactivateStudent: async (id) => {
    try {
      set({ loading: true })
      if (!id) throw new Error("Bad Data")
      await userService.deactivateUsers(id)
      const { students } = get()
      if (students) {
        const updatedStudents = students.map(item => (
          item._id === id ? { ...item, status: "inactive" } : item
        ))
        set({ students: updatedStudents })
        handleSuccess("User details updated Succesfully")
      }
    } catch (error) {
      handleInternalError(error)
    }
  },
  activateStudent: async (id) => {
    try {
      set({ loading: true })
      if (!id) throw new Error("Bad Data")
      await userService.activateUsers(id)
      const { students } = get()
      if (students) {
        const updatedStudents = students.map(item => (
          item._id === id ? { ...item, status: "active" } : item
        ))
        set({ students: updatedStudents })
        handleSuccess("User details updated Succesfully")
      }
    } catch (error) {
      handleInternalError(error)
    }
  },
  getActiveSessions: async (id) => {
    try {
      set({ loading: true })
      if (!id) throw new Error("Bad Data")
      const response = await studentService.getActiveSessions(id)
      const { activeStudentSessions } = get()
      const updatedStudentSessions = { ...activeStudentSessions, [id]: response }
      set({ activeStudentSessions: updatedStudentSessions })
      return response
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ loading: false })
    }
  },
  getProjectOpenedStudents: async () => {
    try {
      set({ loading: true })
      const response = await studentService.getProjectOpenedStudents()
      set({ projectOpenedStudents: response })
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ loading: false })
    }
  }
}))

export default studentStore