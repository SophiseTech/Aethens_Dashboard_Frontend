import { create } from "zustand";
import studentStore from "@stores/StudentStore";
import userStore from "@stores/UserStore";
import { ROLES } from "@utils/constants";
import handleInternalError from "@utils/handleInternalError";
import centersStore from "@stores/CentersStore";
import attendanceService from "@services/Attendance";

const attendanceRegisterStore = create((set, get) => ({
  students: [],
  loading: true,
  attendanceData: {}, // Map of studentId -> dayDate -> status
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  },
  selectedMonth: new Date(),
  selectedCourse: null,
  error: null,

  setSelectedMonth: (month) => {
    set({ selectedMonth: month, pagination: { ...get().pagination, page: 1 } });
  },

  setSelectedCourse: (courseId) => {
    set({ selectedCourse: courseId, pagination: { ...get().pagination, page: 1 } });
  },

  setPage: (page) => {
    set({ pagination: { ...get().pagination, page } });
  },

  // Fetch students with their attendance data
  fetchStudentsAttendance: async (page = 1) => {
    try {
      set({ loading: true, error: null });
      const { user } = userStore.getState();
      let center_id;
      if(user.role === ROLES.ADMIN){
        center_id = centersStore.getState().selectedCenter;
      }
      const { selectedMonth, selectedCourse, pagination } = get();

      // Simulate API delay

      // Use dummy data
      const attendanceData = await attendanceService.getAttendanceRegister({
        center_id,
        course_id: selectedCourse,
        month: selectedMonth,
        page: pagination.page,
        limit: pagination.limit
      })
      const resultPagination = attendanceData?.pagination
      set({
        students: attendanceData?.students || [],
        attendanceData: attendanceData?.attendanceData,
        pagination: resultPagination,
        loading: false
      });
    } catch (error) {
      handleInternalError(error);
      set({ loading: false, error: error.message });
    }
  },

  reset: () => {
    set({
      students: [],
      loading: true,
      attendanceData: {},
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
      },
      selectedMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      selectedCourse: null,
      error: null
    });
  }
}));

export default attendanceRegisterStore;
