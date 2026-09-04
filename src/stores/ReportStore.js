import { create } from "zustand";
import userStore from "@stores/UserStore";
import centersStore from "@stores/CentersStore";
import reportService from "@services/Report";
import { isGlobalUser } from "@utils/helper";
import handleError from "@utils/handleError";
import dayjs from "dayjs";

const reportStore = create((set, get) => ({
  selectedMonth: new Date(),
  loading: false,
  error: null,

  deactivatedStudents: [],
  deactivatedStudentsTotal: 0,
  deactivatedStudentsLoading: false,
  deactivatedStudentsDownloading: false,
  deactivatedDateRange: [dayjs().startOf('month'), dayjs()],

  setSelectedMonth: (month) => {
    set({ selectedMonth: month });
  },

  setDeactivatedDateRange: (range) => {
    set({ deactivatedDateRange: range });
  },

  getDeactivatedStudentsReport: async () => {
    try {
      set({ deactivatedStudentsLoading: true, error: null });
      const { user } = userStore.getState();
      let center_id;
      if (isGlobalUser(user)) {
        center_id = centersStore.getState().selectedCenter;
      }
      const { deactivatedDateRange } = get();
      const [start, end] = deactivatedDateRange || [];
      if (!start || !end) return;

      const result = await reportService.getDeactivatedStudentsReport({
        startDate: start.format('YYYY-MM-DD'),
        endDate: end.format('YYYY-MM-DD'),
        centerId: center_id,
      });

      set({
        deactivatedStudents: result?.students || [],
        deactivatedStudentsTotal: result?.total || 0,
      });
    } catch (error) {
      handleError(error);
      set({ error: error.message });
    } finally {
      set({ deactivatedStudentsLoading: false });
    }
  },

  downloadDeactivatedStudentsReport: async () => {
    try {
      set({ deactivatedStudentsDownloading: true, error: null });
      const { user } = userStore.getState();
      let center_id;
      if (isGlobalUser(user)) {
        center_id = centersStore.getState().selectedCenter;
      }
      const { deactivatedDateRange } = get();
      const [start, end] = deactivatedDateRange || [];
      if (!start || !end) return;

      const blob = await reportService.downloadDeactivatedStudentsReport({
        startDate: start.format('YYYY-MM-DD'),
        endDate: end.format('YYYY-MM-DD'),
        centerId: center_id,
      });

      const url = window.URL.createObjectURL(blob);
      const filename = `Deactivated-Students-${start.format('DD-MMM-YYYY')}-to-${end.format('DD-MMM-YYYY')}.xlsx`;

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      handleError(error);
      set({ error: error.message });
    } finally {
      set({ deactivatedStudentsDownloading: false });
    }
  },

  downloadFinancialAuditReport: async () => {
    try {
      set({ loading: true, error: null });
      const { user } = userStore.getState();
      let center_id;
      if (isGlobalUser(user)) {
        center_id = centersStore.getState().selectedCenter;
      }
      const { selectedMonth } = get();

      const blob = await reportService.downloadFinancialAuditReport({
        month: selectedMonth.getMonth() + 1,
        year: selectedMonth.getFullYear(),
        centerId: center_id,
      });

      const url = window.URL.createObjectURL(blob);
      const filename = `Audit-Report-${dayjs(selectedMonth).format('MMMM-YYYY')}.xlsx`;

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      handleError(error);
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
}));

export default reportStore;
