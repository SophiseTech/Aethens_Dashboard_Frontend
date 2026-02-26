import holidayService from "@/services/Holiday";
import userStore from "@stores/UserStore";
import { ROLES } from "@utils/constants";
import handleInternalError from "@utils/handleInternalError";
import handleSuccess from "@utils/handleSuccess";
import { create } from "zustand";
import centersStore from "./CentersStore";

const holidayStore = create((set, get) => ({
  holidays: [],
  loading: true,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  total: 0,
  page: 1,
  limit: 10,
  filters: {
    status: null,
    isRecurring: null,
    startDate: null,
    endDate: null,
    search: null
  },

  // Fetch holidays with pagination and filters
  fetchHolidays: async (pageNum = 1, newFilters = null) => {
    try {
      set({ loading: true });
      const { user } = userStore.getState();
      const { selectedCenter } = centersStore.getState();
      const currentFilters = newFilters || get().filters;
      const limit = get().limit;


      // Determine center ID based on role
      let centerId;
      if (user.role === ROLES.ADMIN || user.role === ROLES.OPERATIONS_MANAGER || user.role === ROLES.ACADEMIC_MANAGER) {
        centerId = selectedCenter || null;
      } else if (user.role === ROLES.MANAGER) {
        centerId = user.center_id;
      } else {
        throw new Error("Unauthorized: Only managers and admins can access holidays");
      }

      // Calculate skip for pagination
      const skip = (pageNum - 1) * limit;

      // Fetch holidays from service
      const response = await holidayService.fetchHolidays({
        skip,
        limit,
        centerId,
        ...currentFilters
      });


      if (response && response.holidays) {
        set({
          holidays: response.holidays,
          total: response.total,
          page: pageNum,
          filters: currentFilters
        });
      } else {
        // Invalid response structure - handled silently
      }
    } catch (error) {
      handleInternalError(error);
    } finally {
      set({ loading: false });
    }
  },

  // Create a new holiday
  createHoliday: async (data) => {
    try {
      set({ createLoading: true });
      const { user } = userStore.getState();
      const { selectedCenter } = centersStore.getState();

      // Determine center ID
      let centerId = data.centerId;
      if (user.role === ROLES.MANAGER) {
        centerId = user.center_id;
      } else if ((user.role === ROLES.ADMIN || user.role === ROLES.OPERATIONS_MANAGER || user.role === ROLES.ACADEMIC_MANAGER) && !centerId) {
        centerId = selectedCenter;
      }

      const payload = {
        ...data,
        centerId
      };

      const response = await holidayService.createHoliday(payload);
      if (response && response.data) {
        handleSuccess("Holiday created successfully");
        // Refresh the list
        get().fetchHolidays(1);
        return response.data;
      }
    } catch (error) {
      handleInternalError(error);
      throw error;
    } finally {
      set({ createLoading: false });
    }
  },

  // Update an existing holiday
  updateHoliday: async (holidayId, data) => {
    try {
      set({ updateLoading: true });
      const response = await holidayService.updateHoliday(holidayId, data);
      if (response && response.data) {
        handleSuccess("Holiday updated successfully");
        // Refresh the list
        get().fetchHolidays(get().page);
        return response.data;
      }
    } catch (error) {
      handleInternalError(error);
      throw error;
    } finally {
      set({ updateLoading: false });
    }
  },

  // Delete a holiday
  deleteHoliday: async (holidayId) => {
    try {
      set({ deleteLoading: true });
      const response = await holidayService.deleteHoliday(holidayId);
      if (response) {
        handleSuccess("Holiday deleted successfully");
        // Refresh the list
        get().fetchHolidays(get().page);
        return true;
      }
    } catch (error) {
      handleInternalError(error);
      throw error;
    } finally {
      set({ deleteLoading: false });
    }
  },

  // Update filters and reset to page 1
  setFilters: (newFilters) => {
    set({ filters: newFilters });
    get().fetchHolidays(1, newFilters);
  },

  // Update limit and reset pagination
  setLimit: (newLimit) => {
    set({ limit: newLimit });
    get().fetchHolidays(1);
  }
}));

export default holidayStore;
