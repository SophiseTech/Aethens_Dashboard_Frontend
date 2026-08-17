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

  setSelectedMonth: (month) => {
    set({ selectedMonth: month });
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
