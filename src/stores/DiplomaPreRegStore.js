import { create } from "zustand";
import diplomaPreRegService from "@/services/DiplomaPreReg";
import handleInternalError from "@utils/handleInternalError";

const DEFAULT_FILTERS = { status: "pending", search: "", batchId: null, dateFrom: null, dateTo: null };

const diplomaPreRegStore = create((set, get) => ({
  // --- Public form state ---
  batches: [],
  batchesLoading: false,
  submitLoading: false,

  fetchActiveBatches: async () => {
    try {
      set({ batchesLoading: true });
      const batches = await diplomaPreRegService.getActiveBatches();
      set({ batches: batches || [] });
    } catch (error) {
      handleInternalError(error);
    } finally {
      set({ batchesLoading: false });
    }
  },

  submitApplication: async (data) => {
    try {
      set({ submitLoading: true });
      const result = await diplomaPreRegService.submitApplication(data);
      return result;
    } catch (error) {
      handleInternalError(error);
      throw error;
    } finally {
      set({ submitLoading: false });
    }
  },

  // --- Manager list state ---
  applications: [],
  appLoading: false,
  pagination: { page: 1, limit: 15, total: 0, pages: 0 },
  filters: { ...DEFAULT_FILTERS },

  fetchApplications: async (page = 1) => {
    set({ appLoading: true });
    try {
      const { filters, pagination } = get();
      const result = await diplomaPreRegService.listApplications({
        ...filters,
        page,
        limit: pagination.limit,
      });
      set({
        applications: result?.applications || [],
        pagination: {
          page: result?.page || 1,
          limit: pagination.limit,
          total: result?.total || 0,
          pages: result?.pages || 0,
        },
        appLoading: false,
      });
    } catch {
      set({ appLoading: false });
    }
  },

  setFilters: (partial) =>
    set((state) => ({ filters: { ...state.filters, ...partial } })),

  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),

  approveApplication: async (id, data) => {
    await diplomaPreRegService.approveApplication(id, data);
    await get().fetchApplications(get().pagination.page);
  },

  rejectApplication: async (id, data) => {
    await diplomaPreRegService.rejectApplication(id, data);
    await get().fetchApplications(get().pagination.page);
  },
}));

export default diplomaPreRegStore;
