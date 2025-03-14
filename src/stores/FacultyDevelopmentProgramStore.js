import facultyDevelopmentProgramService from "@/services/FacultyDevelopmentProgram";
import handleInternalError from "@utils/handleInternalError";
import handleSuccess from "@utils/handleSuccess";
import _ from "lodash";
import { create } from "zustand";

const facultyDevProgramStore = create((set, get) => ({
  programs: [],
  loading: true,
  createLoading: false,
  lastRefKey: 0,
  total: 0,
  filters: {},

  getPrograms: async (limit = 10, filters = {}) => {
    try {
      set({ loading: true });
      const { lastRefKey, programs: prevPrograms, filters: stateFilters } = get();
      const { programs, total } = await facultyDevelopmentProgramService.getPrograms(
        filters,
        _.isEqual(stateFilters.query, filters.query) ? lastRefKey : 0,
        limit
      );
      if (programs) {
        set({
          programs: _.isEqual(stateFilters.query, filters.query) ? [...prevPrograms, ...programs] : programs,
          lastRefKey: lastRefKey + programs.length,
          total: total,
        });
      }
      if (filters) {
        set({ filters: { ...stateFilters, ...filters } });
      }
    } catch (error) {
      handleInternalError(error);
    } finally {
      set({ loading: false });
    }
  },

  editProgram: async (id, updateData) => {
    try {
      set({ createLoading: true });
      if (!id || !updateData) throw new Error("Bad Data");
      const { programs } = get();
      const updatedProgram = await facultyDevelopmentProgramService.editProgram(id, updateData);
      if (updatedProgram && programs) {
        const updatedPrograms = programs.map(item => (
          item._id === updatedProgram._id ? { ...item, ...updateData } : item
        ));
        set({ programs: updatedPrograms });
        handleSuccess("Development Program Updated Successfully");
      }
    } catch (error) {
      handleInternalError(error);
    } finally {
      set({ createLoading: false });
    }
  },

  deleteProgram: async (id) => {
    try {
      set({ createLoading: true });
      if (!id) throw new Error("Bad Data");
      const { programs } = get();
      await facultyDevelopmentProgramService.deleteProgram(id);
      if (programs) {
        const updatedPrograms = programs.filter(request => request._id !== id);
        set({ programs: updatedPrograms });
        handleSuccess("Development Program Deleted Successfully");
      }
    } catch (error) {
      handleInternalError(error);
    } finally {
      set({ createLoading: false });
    }
  },

  createProgram: async (data) => {
    try {
      set({ createLoading: true });
      if (!data) throw new Error("Bad Data");
      const { programs } = get();
      const newProgram = await facultyDevelopmentProgramService.createProgram(data);
      if (newProgram) {
        set({ programs: [newProgram, ...programs] })
      }
      handleSuccess("Task assigned succesfully")
      return newProgram;
    } catch (error) {
      handleInternalError(error);
    } finally {
      set({ createLoading: false });
    }
  },
}));

export default facultyDevProgramStore;