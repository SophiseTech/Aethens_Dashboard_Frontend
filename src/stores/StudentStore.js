
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
  getStudentsByCenter: async (limit = 10, page = 1) => {
    try {
      set({ loading: true });

      const { user } = userStore.getState();
      if (user.role !== ROLES.MANAGER && user.role !== ROLES.FACULTY) {
        throw new Error("Unauthorized");
      }

      // Calculate the offset based on the page number and limit
      const offset = (page - 1) * limit;

      // Fetch users with pagination parameters
      const { users, total } = await userService.getByRoleByCenter(
        ROLES.STUDENT,
        user.center_id,
        offset, // Pass the offset for pagination
        limit
      );

      if (users) {
        // Replace the existing students with the new data for the current page
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
      const { students } = get()
      const student = await userService.edit(id, updateData)
      if (student && students) {
        const updatedStudents = students.map(item => (
          item._id === student._id ? { ...item, ...updateData } : item
        ))
        set({ students: updatedStudents })
        handleSuccess("User details updated Succesfully")
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ loading: false })
    }
  },
}))

export default studentStore