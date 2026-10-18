import attendanceService from "@services/AttendanceService";
import leaveService from "@services/LeaveService";
import holidayService from "@services/Holiday";
import handleInternalError from "@utils/handleInternalError";
import { create } from "zustand";

// Logged-in staff member's own attendance, approved leaves and published
// holidays — shared by the dashboard calendar widget and the My Attendance page.
const myAttendanceStore = create((set) => ({
  monthly: {}, // { "YYYY-MM": { records, stats } }
  leaves: [],
  holidays: [],
  loading: false,

  fetchMonth: async (month) => {
    try {
      set({ loading: true });
      const data = await attendanceService.getMonthlyAttendance(month);
      set((state) => ({ monthly: { ...state.monthly, [month]: data || { records: [], stats: {} } } }));
    } catch (error) {
      handleInternalError(error);
    } finally {
      set({ loading: false });
    }
  },

  fetchLeavesAndHolidays: async () => {
    try {
      const [leaves, holidayRes] = await Promise.all([
        leaveService.getLeaves({ status: "APPROVED" }),
        holidayService.fetchHolidays({ skip: 0, limit: 100, status: "published" }),
      ]);
      set({
        leaves: Array.isArray(leaves) ? leaves : [],
        holidays: holidayRes?.holidays || [],
      });
    } catch (error) {
      handleInternalError(error);
    }
  },
}));

export default myAttendanceStore;
