import certificateService from "@services/Certificate";
import handleInternalError from "@utils/handleInternalError";
import handleSuccess from "@utils/handleSuccess";
import { create } from "zustand";

const useCertificateStore = create((set, get) => ({
  certificates: [],
  loading: false,
  actionLoading: false,
  total: 0,
  page: 1,
  limit: 20,
  filters: {
    search: '',
    course_id: 'all',
    dateRange: null,
    status: 'all',
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  fetchCertificates: async (pageNum = 1, customFilters = null) => {
    try {
      set({ loading: true });
      const currentFilters = customFilters || get().filters;
      const limit = get().limit;
      const lastRefKey = (pageNum - 1) * limit;

      const response = await certificateService.getCertificates(currentFilters, lastRefKey, limit);

      if (response) {
        set({
          certificates: response.certificates || [],
          total: response.total || 0,
          page: pageNum,
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      set({ loading: false });
      handleInternalError(error);
    }
  },

  createCertificate: async (data) => {
    try {
      set({ actionLoading: true });
      const created = await certificateService.createCertificate(data);
      if (created) {
        handleSuccess("Certificate issued successfully");
        await get().fetchCertificates(get().page);
        set({ actionLoading: false });
        return created;
      }
      set({ actionLoading: false });
    } catch (error) {
      set({ actionLoading: false });
      handleInternalError(error);
      throw error;
    }
  },

  updateCertificateStatus: async (id, status) => {
    try {
      const updated = await certificateService.updateStatus(id, status);
      if (updated) {
        set((state) => ({
          certificates: state.certificates.map((c) => (c._id === id ? { ...c, status } : c)),
        }));
        handleSuccess("Status updated successfully");
        return updated;
      }
    } catch (error) {
      handleInternalError(error);
    }
  },

  deleteCertificate: async (id) => {
    try {
      set({ actionLoading: true });
      const res = await certificateService.deleteCertificate(id);
      if (res) {
        set((state) => ({
          certificates: state.certificates.filter((c) => c._id !== id),
          total: Math.max(state.total - 1, 0),
          actionLoading: false,
        }));
        handleSuccess("Certificate deleted successfully");
        return true;
      }
      set({ actionLoading: false });
    } catch (error) {
      set({ actionLoading: false });
      handleInternalError(error);
    }
  },

  checkDuplicate: async (studentId, courseId) => {
    try {
      return await certificateService.checkDuplicate(studentId, courseId);
    } catch (error) {
      handleInternalError(error);
      return { exists: false };
    }
  },
}));

export default useCertificateStore;
