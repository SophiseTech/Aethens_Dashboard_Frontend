
import userService from "@/services/User"
import userStore from "@stores/UserStore"
import { ROLES } from "@utils/constants"
import handleInternalError from "@utils/handleInternalError"
import { create } from "zustand"
import centersStore from "./CentersStore"

const facultyStore = create((set, get) => ({
  faculties: [],
  loading: true,
  lastRefKey: 0,
  total: 0,
  getFacultiesByCenter: async (limit = 10) => {
    try {
      set({ loading: true })
      const { lastRefKey, faculties } = get()
      const { user } = userStore.getState()
      const { selectedCenter } = centersStore.getState()
      let centerId;

      if (user.role === ROLES.ADMIN || user.role === ROLES.ACADEMIC_MANAGER) {
        centerId = selectedCenter;
      } else {
        centerId = user.center_id;
      }
      const { users, total } = await userService.getByRoleByCenter(ROLES.FACULTY, centerId, lastRefKey, limit)
      if (users) {
        set({ faculties: [...faculties, ...users], lastRefKey: lastRefKey + users.length, total: total })
      }
    } catch (error) {
      handleInternalError(error)
    } finally {
      set({ loading: false })
    }
  },
}))

export default facultyStore