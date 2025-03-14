import finalProjectService from "@/services/FinalProject";
import handleInternalError from "@utils/handleInternalError";
import handleSuccess from "@utils/handleSuccess";
import _ from "lodash";
import { create } from "zustand";

const finalProjectStore = create((set, get) => ({
  project: {},
  loading: true,
  createLoading: false,
  filters: {},

  getProject: async (filters = {}) => {
    try {
      set({ loading: true });
      const project = await finalProjectService.getProjectByFilter(filters);

      set({
        project: project || {}
      });

    } catch (error) {
      handleInternalError(error);
    } finally {
      set({ loading: false });
    }
  },

  createProject: async (data) => {
    try {
      set({ createLoading: true });
      if (!data) throw new Error("Bad Data");

      const newProject = await finalProjectService.createFinalProject(data);

      if (newProject) {
        set({ project: newProject });
        handleSuccess("Project Created Successfully");
        return newProject;
      }
    } catch (error) {
      handleInternalError(error);
    } finally {
      set({ createLoading: false });
    }
  },

  editProject: async (id, updateData) => {
    try {
      set({ createLoading: true });
      if (!id || !updateData) throw new Error("Bad Data");

      const updatedProject = await finalProjectService.editFinalProject(id, updateData);

      if (updatedProject) {
        set({ project: updatedProject });
        handleSuccess("Project Updated Successfully");
      }
    } catch (error) {
      handleInternalError(error);
    } finally {
      set({ createLoading: false });
    }
  },

  deleteProject: async (id) => {
    try {
      set({ createLoading: true });
      if (!id) throw new Error("Bad Data");

      await finalProjectService.deleteFinalProject(id);

      if (projects) {
        set({ projects: {} });
        handleSuccess("Project Deleted Successfully");
      }
    } catch (error) {
      handleInternalError(error);
    } finally {
      set({ createLoading: false });
    }
  }
}));

export default finalProjectStore;
