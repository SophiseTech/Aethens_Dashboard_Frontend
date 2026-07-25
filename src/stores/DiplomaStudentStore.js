import diplomaStudentService from "@/services/DiplomaStudent"
import handleInternalError from "@utils/handleInternalError"
import userStore from "@stores/UserStore"
import centersStore from "@stores/CentersStore"
import { ROLES } from "@utils/constants"
import { create } from "zustand"

const diplomaStudentStore = create((set) => ({
  students: [],
  loading: true,
  total: 0,
  page: 1,
  pages: 0,
  searchQuery: null,

  setSearchQuery: (query) => set({ searchQuery: query }),

  getStudents: async ({ view = "current", courseId = null, search = null, page = 1, limit = 10 } = {}) => {
    try {
      set({ loading: true });

      const { user } = userStore.getState();
      const { selectedCenter } = centersStore.getState();
      const centerId = [ROLES.ADMIN, ROLES.OPERATIONS_MANAGER, ROLES.ACADEMIC_MANAGER].includes(user.role)
        ? selectedCenter
        : user.center_id;

      const result = await diplomaStudentService.listDiplomaStudents({
        view,
        courseId,
        search,
        page,
        limit,
        centerId,
      });

      set({
        students: result?.students || [],
        total: result?.total || 0,
        page: result?.page || 1,
        pages: result?.pages || 0,
      });
    } catch (error) {
      handleInternalError(error);
    } finally {
      set({ loading: false });
    }
  },
}))

export default diplomaStudentStore
