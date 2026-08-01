
import userService from "@/services/User"
import usersV2Service from "@services/UsersV2"
import userStore from "@stores/UserStore"
import { ROLES, STAFF_ROLES } from "@utils/constants"
import handleInternalError from "@utils/handleInternalError"
import { create } from "zustand"
import centersStore from "./CentersStore"

const facultyStore = create((set, get) => ({
  faculties: [],
  loading: true,
  lastRefKey: 0,
  total: 0,
  staff: [],
  staffLoading: false,
  staffTotal: 0,
  getFacultiesByCenter: async (limit = 10) => {
    try {
      set({ loading: true, faculties: [], lastRefKey: 0 })
      const { user } = userStore.getState()
      const { selectedCenter } = centersStore.getState()
      let centerId;

      if (user.role === ROLES.ADMIN || user.role === ROLES.ACADEMIC_MANAGER) {
        centerId = selectedCenter;
      } else {
        centerId = user.center_id;
      }
      const { users, total } = await userService.getByRoleByCenter(ROLES.FACULTY, centerId, 0, limit)
      if (users) {
        set({ faculties: users, lastRefKey: users.length, total: total })
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ loading: false })
    }
  },
  // Fetches every non-student staff member (faculty, manager, admin, etc.) for the current center.
  getStaffByCenter: async (limit = 10) => {
    try {
      set({ staffLoading: true, staff: [] })
      const { user } = userStore.getState()
      const { selectedCenter } = centersStore.getState()
      let centerId;

      if (user.role === ROLES.ADMIN || user.role === ROLES.ACADEMIC_MANAGER) {
        centerId = selectedCenter;
      } else {
        centerId = user.center_id;
      }
      const result = await usersV2Service.getAll({
        role: STAFF_ROLES.join(","),
        center_id: centerId || "all",
        limit,
      })
      const staffUsers = result?.data || []
      set({ staff: staffUsers, staffTotal: result?.pagination?.total ?? staffUsers.length })
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ staffLoading: false })
    }
  },
}))

export default facultyStore